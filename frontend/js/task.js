/**
 * TaskPilot Enterprise — Tasks API Manager
 */

let globalTasksList = [];
let layoutViewMode = 'kanban';

async function loadAdminTasks() {
  try {
    const res = await apiClient.get('/tasks?all=true');
    if (!res.success) return;

    globalTasksList = res.tasks;

    // Populate Filters
    await populateAssigneeFilters();

    // Pre-populate search input if search parameter exists in URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      const searchInput = document.getElementById('admin-task-search');
      if (searchInput) {
        searchInput.value = searchParam;
      }
    }

    // Render View
    renderAdminTasksView();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function populateAssigneeFilters() {
  const select = document.getElementById('admin-task-assignee-filter');
  const modalSelect = document.getElementById('task-form-assignee');
  if (!select || !modalSelect) return;

  try {
    const res = await apiClient.get('/employees');
    if (!res.success) return;

    select.innerHTML = '<option value="All">All Assignees</option>';
    modalSelect.innerHTML = '<option value="">-- Choose Employee --</option>';

    res.employees.forEach(emp => {
      select.innerHTML += `<option value="${emp.id}">${emp.name}</option>`;
      modalSelect.innerHTML += `<option value="${emp.id}">${emp.name} (${emp.department})</option>`;
    });
  } catch (err) {
    console.error('Failed to populate assignees selects:', err);
  }
}

function switchTaskLayout(mode) {
  layoutViewMode = mode;
  document.querySelectorAll('.tab-pill').forEach(pill => pill.classList.remove('active'));
  
  const selectedPill = document.getElementById(`pill-layout-${mode}`);
  if (selectedPill) selectedPill.classList.add('active');

  document.getElementById('admin-task-layout-kanban').style.display = (mode === 'kanban') ? 'flex' : 'none';
  document.getElementById('admin-task-layout-list').style.display = (mode === 'list') ? 'block' : 'none';

  renderAdminTasksView();
}

function renderAdminTasksView() {
  const searchVal = document.getElementById('admin-task-search').value.toLowerCase();
  const priorityVal = document.getElementById('admin-task-priority-filter').value;
  const assigneeVal = document.getElementById('admin-task-assignee-filter').value;

  const filtered = globalTasksList.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchVal) || t.description.toLowerCase().includes(searchVal);
    const matchesPriority = priorityVal === 'All' || t.priority === priorityVal;
    const matchesAssignee = assigneeVal === 'All' || String(t.assignee_id) === assigneeVal;
    return matchesSearch && matchesPriority && matchesAssignee;
  });

  if (layoutViewMode === 'kanban') {
    renderKanbanColumns(filtered);
  } else {
    renderTasksListTable(filtered);
  }
}

function renderKanbanColumns(tasks) {
  const cols = {
    todo: document.querySelector('#admin-col-todo .kanban-cards'),
    inprogress: document.querySelector('#admin-col-inprogress .kanban-cards'),
    completed: document.querySelector('#admin-col-completed .kanban-cards')
  };

  if (!cols.todo || !cols.inprogress || !cols.completed) return;

  // Reset columns
  Object.keys(cols).forEach(k => {
    cols[k].innerHTML = '';
    document.getElementById(`admin-count-${k}`).innerText = '0';
  });

  let counts = { todo: 0, inprogress: 0, completed: 0 };

  if (tasks.length === 0) {
    Object.keys(cols).forEach(k => {
      cols[k].innerHTML = `<div style="text-align: center; color: var(--color-text-light); font-size:11.5px; padding: 20px;">No tasks.</div>`;
    });
    return;
  }

  tasks.forEach(t => {
    let priBadge = 'badge-neutral';
    if (t.priority === 'High') priBadge = 'badge-danger';
    else if (t.priority === 'Medium') priBadge = 'badge-warning';

    const noteTag = t.completion_note ? `<div style="font-size:10.5px; color:var(--color-success); border-left:2px solid var(--color-success); padding-left:6px; margin-top:8px;">Note: "${t.completion_note}"</div>` : '';

    const cardHTML = `
      <div class="task-card" draggable="true" ondragstart="handleDragStart(event, ${t.id})" id="admin-task-card-${t.id}">
        <div class="task-tag-row">
          <span class="badge ${priBadge}">${t.priority}</span>
          <div style="display:flex; gap:6px;">
            <button class="nav-action-btn" style="width:22px; height:22px; font-size:11px; border:none; padding:0;" onclick="editAdminTask(${t.id})"><i class="ti ti-pencil"></i></button>
            <button class="nav-action-btn" style="width:22px; height:22px; font-size:11px; border:none; padding:0; color:var(--color-danger);" onclick="deleteAdminTask(${t.id})"><i class="ti ti-trash"></i></button>
          </div>
        </div>
        <div class="task-title">${t.title}</div>
        <div class="task-desc">${t.description}</div>
        ${noteTag}
        <div class="task-footer">
          <span class="task-meta"><i class="ti ti-calendar"></i> ${t.due_date}</span>
          <div class="task-assignee" title="${t.assignee_name || 'Unassigned'}">${getInitials(t.assignee_name)}</div>
        </div>
      </div>
    `;

    if (cols[t.status]) {
      cols[t.status].innerHTML += cardHTML;
      counts[t.status]++;
    }
  });

  Object.keys(counts).forEach(k => {
    document.getElementById(`admin-count-${k}`).innerText = counts[k];
  });
}

function renderTasksListTable(tasks) {
  const tbody = document.getElementById('admin-task-list-tbody');
  if (!tbody) return;

  if (tasks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--color-text-muted); padding: 24px;">No tasks match filters.</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  tasks.forEach(t => {
    let priBadge = 'badge-neutral';
    if (t.priority === 'High') priBadge = 'badge-danger';
    else if (t.priority === 'Medium') priBadge = 'badge-warning';

    tbody.innerHTML += `
      <tr>
        <td>
          <strong>${t.title}</strong>
          <div style="font-size:11px; color: var(--color-text-muted); margin-top:2px;">${t.description}</div>
        </td>
        <td><span class="badge ${priBadge}">${t.priority}</span></td>
        <td><span class="badge ${t.status === 'completed' ? 'badge-success' : 'badge-info'}">${t.status}</span></td>
        <td>${t.assignee_name}</td>
        <td>${t.due_date}</td>
        <td>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-secondary btn-sm" onclick="editAdminTask(${t.id})"><i class="ti ti-pencil"></i> Edit</button>
            <button class="btn btn-secondary btn-sm" style="color:var(--color-danger); border-color:var(--color-danger-light);" onclick="deleteAdminTask(${t.id})"><i class="ti ti-trash"></i> Delete</button>
          </div>
        </td>
      </tr>
    `;
  });
}

// Drag & Drop
let draggedTaskId = null;
function handleDragStart(e, taskId) {
  draggedTaskId = taskId;
  e.dataTransfer.setData('text/plain', taskId);
}
function allowDrop(e) { e.preventDefault(); }
function dragEnter(e) { e.preventDefault(); e.currentTarget.classList.add('dragover'); }
function dragLeave(e) { e.currentTarget.classList.remove('dragover'); }

async function handleDrop(e, status) {
  e.preventDefault();
  e.currentTarget.classList.remove('dragover');
  
  const id = parseInt(e.dataTransfer.getData('text/plain') || draggedTaskId);
  const task = globalTasksList.find(t => t.id === id);

  if (task && task.status !== status) {
    try {
      const res = await apiClient.patch(`/tasks/${id}/status`, {
        status,
        completion_note: status === 'completed' ? 'Status updated via Kanban Board' : ''
      });

      if (res.success) {
        showToast('Task status updated', 'success');
        await loadAdminTasks();
      }
    } catch (err) {
      showToast(err.message, 'danger');
    }
  }
}

// Task CRUD forms
function openNewTaskModal() {
  const modalSelect = document.getElementById('task-form-assignee');
  if (modalSelect.options.length <= 1) {
    showToast('Register at least one employee profile first', 'warning');
    return;
  }

  document.getElementById('task-form-id').value = '';
  document.getElementById('task-form').reset();
  
  // Set default due date
  const d = new Date();
  d.setDate(d.getDate() + 3);
  document.getElementById('task-form-duedate').value = d.toISOString().split('T')[0];

  document.getElementById('task-modal').classList.add('active');
  document.getElementById('task-modal-title').innerText = 'Assign Task';
}

function editAdminTask(id) {
  const task = globalTasksList.find(t => t.id === id);
  if (!task) return;

  document.getElementById('task-form-id').value = task.id;
  document.getElementById('task-form-title').value = task.title;
  document.getElementById('task-form-desc').value = task.description;
  document.getElementById('task-form-assignee').value = task.assignee_id;
  document.getElementById('task-form-priority').value = task.priority;
  document.getElementById('task-form-duedate').value = task.due_date;
  document.getElementById('task-form-status').value = task.status;

  document.getElementById('task-modal').classList.add('active');
  document.getElementById('task-modal-title').innerText = 'Edit Task Properties';
}

async function deleteAdminTask(id) {
  if (confirm('Are you sure you want to delete this task assignment?')) {
    try {
      const res = await apiClient.delete(`/tasks/${id}`);
      if (res.success) {
        showToast('Task assignment deleted', 'success');
        await loadAdminTasks();
      }
    } catch (err) {
      showToast(err.message, 'danger');
    }
  }
}

function closeTaskModal() {
  document.getElementById('task-modal').classList.remove('active');
}

async function handleTaskFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('task-form-id').value;
  const title = document.getElementById('task-form-title').value.trim();
  const description = document.getElementById('task-form-desc').value.trim();
  const assignee_id = parseInt(document.getElementById('task-form-assignee').value);
  const priority = document.getElementById('task-form-priority').value;
  const due_date = document.getElementById('task-form-duedate').value;
  const status = document.getElementById('task-form-status').value;

  if (!validation.isNotEmpty(title) || !validation.isNotEmpty(description) || !assignee_id || !due_date) {
    showToast('Please fill out all task parameters.', 'danger');
    return;
  }

  try {
    let res;
    if (id) {
      // Edit mode
      res = await apiClient.put(`/tasks/${id}`, { title, description, priority, status, assignee_id, due_date });
    } else {
      // Create mode
      res = await apiClient.post('/tasks', { title, description, priority, assignee_id, due_date });
    }

    if (res.success) {
      showToast(res.message, 'success');
      closeTaskModal();
      await loadAdminTasks();
    }
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

// ----------------------------------------------------
// Employee Allocated Tasks View Logic
// ----------------------------------------------------
let employeeTasksList = [];

async function loadEmployeeTasksTable() {
  const tbody = document.getElementById('employee-task-table-body');
  if (!tbody) return;

  try {
    const res = await apiClient.get('/tasks');
    if (!res.success) return;

    employeeTasksList = res.tasks;

    if (employeeTasksList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--color-text-muted); padding: 24px;">No tasks assigned to you.</td></tr>`;
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search')?.toLowerCase() || '';

    tbody.innerHTML = '';
    let hasMatching = false;

    employeeTasksList.forEach(t => {
      if (searchParam && !t.title.toLowerCase().includes(searchParam) && !t.description.toLowerCase().includes(searchParam)) {
        return;
      }
      hasMatching = true;

      let priBadge = 'badge-neutral';
      if (t.priority === 'High') priBadge = 'badge-danger';
      else if (t.priority === 'Medium') priBadge = 'badge-warning';

      tbody.innerHTML += `
        <tr>
          <td>
            <strong>${t.title}</strong>
            <div style="font-size:11px; color:var(--color-text-muted); margin-top:2px;">${t.description}</div>
          </td>
          <td><span class="badge ${priBadge}">${t.priority}</span></td>
          <td><span class="badge ${t.status === 'completed' ? 'badge-success' : 'badge-info'}">${t.status}</span></td>
          <td>${t.due_date}</td>
          <td style="font-style: italic; color:var(--color-text-muted); font-size:11px;">
            ${t.completion_note ? `"${t.completion_note}"` : '—'}
          </td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="openStatusUpdateModal(${t.id}, '${t.title.replace(/'/g, "\\'")}', '${t.status}')">
              <i class="ti ti-edit"></i> Update Status
            </button>
          </td>
        </tr>
      `;
    });

    if (!hasMatching) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--color-text-muted); padding: 24px;">No matching tasks assigned to you.</td></tr>`;
    }
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

function openStatusUpdateModal(id, title, status) {
  document.getElementById('status-task-id').value = id;
  document.getElementById('status-task-title').value = title;
  document.getElementById('status-task-select').value = status;
  document.getElementById('status-task-note').value = '';
  
  toggleCompletionNoteRequired(status);
  document.getElementById('status-update-modal').classList.add('active');
}

function toggleCompletionNoteRequired(status) {
  const label = document.getElementById('completion-note-label');
  const textarea = document.getElementById('status-task-note');
  if (status === 'completed') {
    label.innerHTML = 'Work Progress / Completion Note <span style="color:var(--color-danger);">*</span>';
    textarea.required = true;
  } else {
    label.innerHTML = 'Work Progress / Completion Note';
    textarea.required = false;
  }
}

function closeStatusUpdateModal() {
  document.getElementById('status-update-modal').classList.remove('active');
}

async function handleStatusUpdateFormSubmit(e) {
  e.preventDefault();
  const id = parseInt(document.getElementById('status-task-id').value);
  const status = document.getElementById('status-task-select').value;
  const note = document.getElementById('status-task-note').value.trim();

  if (status === 'completed' && !note) {
    showToast('A completion note is required to finalize tasks.', 'danger');
    return;
  }

  try {
    const res = await apiClient.patch(`/tasks/${id}/status`, {
      status,
      completion_note: note
    });

    if (res.success) {
      showToast('Task status updated successfully.', 'success');
      closeStatusUpdateModal();
      
      // Reload stats and tables
      if (typeof loadEmployeeDashboard === 'function') {
        await loadEmployeeDashboard();
      }
    }
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

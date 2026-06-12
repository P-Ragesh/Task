/**
 * TaskPilot Enterprise — Employee API Manager
 */

let globalEmployeesList = [];

async function loadEmployeeDirectory() {
  const grid = document.getElementById('admin-employees-grid');
  if (!grid) return;

  try {
    const res = await apiClient.get('/employees');
    if (!res.success) return;

    globalEmployeesList = res.employees;

    // Fetch tasks counts to render allocations metadata
    const taskRes = await apiClient.get('/tasks');
    const tasks = taskRes.success ? taskRes.tasks : [];

    if (globalEmployeesList.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px 0;">
          <div class="empty-state">
            <div class="empty-state-icon"><i class="ti ti-users"></i></div>
            <div class="empty-state-title">No Registered Employees</div>
            <div class="empty-state-desc">Create employee accounts to begin task assignments.</div>
            <button class="btn btn-primary btn-sm" onclick="openNewEmployeeModal()">Register Employee</button>
          </div>
        </div>
      `;
      return;
    }

    grid.innerHTML = '';
    globalEmployeesList.forEach(emp => {
      const empTasks = tasks.filter(t => t.assignee_id === emp.id);
      const completed = empTasks.filter(t => t.status === 'completed').length;
      const pending = empTasks.length - completed;

      const currentUser = auth.getCurrentUser();
      const showReset = currentUser && currentUser.role === 'admin';

      grid.innerHTML += `
        <div class="card employee-card">
          <div class="emp-card-header" style="display:flex; justify-content:flex-end;">
            <button class="btn btn-secondary btn-sm" style="color:var(--color-danger); padding:4px 8px; border:none;" onclick="deleteEmployee(${emp.id})"><i class="ti ti-trash"></i></button>
          </div>
          <div class="emp-card-avatar" style="width:56px; height:56px; border-radius:var(--border-radius-full); background-color:var(--color-primary); color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:18px; margin:0 auto 12px;">${getInitials(emp.name)}</div>
          <div class="emp-card-name" style="font-weight:700; text-align:center; font-size:15px; color:var(--color-text-main);">${emp.name}</div>
          <div class="emp-card-dept" style="font-size:12px; color:var(--color-text-muted); text-align:center; margin-bottom:8px;">${emp.role} • <strong>${emp.department}</strong></div>
          <div style="font-size:11.5px; color:var(--color-text-muted); text-align:center; margin-bottom:12px;"><i class="ti ti-mail"></i> ${emp.email}</div>
          
          <div class="emp-card-stats" style="display:flex; justify-content:space-around; border-top:1px solid var(--color-border); padding-top:10px; margin-top:10px;">
            <div style="text-align:center;">
              <div class="emp-card-stat-label" style="font-size:10px; color:var(--color-text-light);">Tasks Scoped</div>
              <div class="emp-card-stat-val" style="font-size:14px; font-weight:700;">${empTasks.length}</div>
            </div>
            <div style="text-align:center;">
              <div class="emp-card-stat-label" style="font-size:10px; color:var(--color-text-light);">Active / Pending</div>
              <div class="emp-card-stat-val" style="font-size:14px; font-weight:700; color:var(--color-warning);">${pending}</div>
            </div>
          </div>

          ${showReset ? `
          <div style="display:flex; gap:8px; margin-top:14px;">
            <button class="btn btn-secondary btn-sm" style="flex:1; justify-content:center; font-size:11.5px;" onclick="openResetPassword(${emp.id}, '${emp.name}')">
              <i class="ti ti-key"></i> Reset Pass
            </button>
          </div>
          ` : ''}
        </div>
      `;
    });
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

function openNewEmployeeModal() {
  document.getElementById('employee-form').reset();
  const emailInput = document.getElementById('emp-form-email');
  const emailError = document.getElementById('emp-form-email-error');
  if (emailInput) emailInput.style.borderColor = '';
  if (emailError) {
    emailError.style.display = 'none';
    emailError.innerText = '';
  }
  document.getElementById('employee-modal').classList.add('active');
}

function closeEmployeeModal() {
  document.getElementById('employee-modal').classList.remove('active');
}

async function handleEmployeeFormSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('emp-form-name').value.trim();
  const department = document.getElementById('emp-form-dept').value;
  const role = document.getElementById('emp-form-role').value.trim();
  const email = document.getElementById('emp-form-email').value.trim();
  const phone = document.getElementById('emp-form-phone').value.trim();
  const password = document.getElementById('emp-form-password').value || '123456';

  const emailInput = document.getElementById('emp-form-email');
  const emailError = document.getElementById('emp-form-email-error');

  // Reset errors
  if (emailInput) emailInput.style.borderColor = '';
  if (emailError) {
    emailError.style.display = 'none';
    emailError.innerText = '';
  }

  // Clear error state on user typing
  if (emailInput && !emailInput.dataset.listenerAdded) {
    emailInput.addEventListener('input', () => {
      emailInput.style.borderColor = '';
      if (emailError) {
        emailError.style.display = 'none';
        emailError.innerText = '';
      }
    });
    emailInput.dataset.listenerAdded = 'true';
  }

  if (!validation.isNotEmpty(name) || !validation.isNotEmpty(role) || !validation.isNotEmpty(email) || !validation.isNotEmpty(phone)) {
    showToast('Please fill out all registration parameters.', 'danger');
    return;
  }

  const isValidEmail = await validation.isValidEmail(email);
  if (!isValidEmail) {
    if (emailInput) emailInput.style.borderColor = 'var(--color-danger)';
    if (emailError) {
      emailError.innerText = 'Please enter a valid active email address.';
      emailError.style.display = 'block';
    } else {
      showToast('Please enter a valid active email address.', 'danger');
    }
    return;
  }

  try {
    const res = await apiClient.post('/employees', { name, email, role, department, phone, password });
    if (res.success) {
      showToast(res.message, 'success');
      closeEmployeeModal();
      await loadEmployeeDirectory();
    }
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function deleteEmployee(id) {
  if (confirm('Are you sure you want to delete this employee account? This will cascade delete their task assignments.')) {
    try {
      const res = await apiClient.delete(`/employees/${id}`);
      if (res.success) {
        showToast('Employee account deleted', 'success');
        await loadEmployeeDirectory();
      }
    } catch (err) {
      showToast(err.message, 'danger');
    }
  }
}

// Password Reset Manager
function openResetPassword(id, name) {
  document.getElementById('reset-emp-id').value = id;
  document.getElementById('reset-emp-name').value = name;
  document.getElementById('reset-emp-password').value = '';
  document.getElementById('reset-password-modal').classList.add('active');
}

function closeResetPasswordModal() {
  document.getElementById('reset-password-modal').classList.remove('active');
}

async function handleResetPasswordSubmit(e) {
  e.preventDefault();
  const id = parseInt(document.getElementById('reset-emp-id').value);
  const password = document.getElementById('reset-emp-password').value;

  if (!validation.hasMinLength(password, 4)) {
    showToast('Password must be at least 4 characters long.', 'danger');
    return;
  }

  try {
    const res = await apiClient.post(`/employees/${id}/reset-password`, { password });
    if (res.success) {
      showToast(res.message, 'success');
      closeResetPasswordModal();
    }
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

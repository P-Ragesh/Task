/**
 * TaskPilot Enterprise — Dashboard Data Loader
 */

let dashboardDonutChart = null;

async function loadAdminDashboard() {
  try {
    const res = await apiClient.get('/dashboard/admin');
    if (!res.success) return;

    // Metrics Counters
    document.getElementById('kpi-total-employees').innerText = res.stats.totalEmployees;
    document.getElementById('kpi-total-tasks').innerText = res.stats.totalTasks;
    document.getElementById('kpi-completed-tasks').innerText = res.stats.completedTasks;
    document.getElementById('kpi-inprogress-tasks').innerText = res.stats.inprogressTasks;
    document.getElementById('kpi-pending-tasks').innerText = res.stats.pendingTasks;

    const rate = res.stats.totalTasks > 0 ? Math.round((res.stats.completedTasks / res.stats.totalTasks) * 100) : 0;
    document.getElementById('kpi-completed-rate').innerText = `${rate}% average rate`;

    // Timeline Rendering
    renderTimeline(res.recentLogs);

    // Matrix Table Rendering
    renderMatrixTable(res.employeeMatrix);

    // Chart.js Status Donut Chart
    renderStatusDonutChart(res.stats.pendingTasks, res.stats.inprogressTasks, res.stats.completedTasks);
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function loadEmployeeDashboard() {
  try {
    const res = await apiClient.get('/dashboard/employee');
    if (!res.success) return;

    // Stats Counters
    document.getElementById('emp-kpi-assigned').innerText = res.stats.totalTasks;
    document.getElementById('emp-kpi-completed').innerText = res.stats.completedTasks;
    document.getElementById('emp-kpi-inprogress').innerText = res.stats.inprogressTasks;
    document.getElementById('emp-kpi-pending').innerText = res.stats.pendingTasks;

    // Load Tasks Table
    await loadEmployeeTasksTable();

    // Render personal timeline logs
    renderEmployeeTimeline(res.recentLogs);
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

function renderTimeline(logs) {
  const container = document.getElementById('recent-updates-timeline');
  if (!container) return;

  if (logs.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--color-text-light); font-size:12px; padding: 20px;">No updates logged yet.</div>`;
    return;
  }

  let html = '<div class="timeline">';
  logs.forEach(log => {
    let toName = log.to_status === 'todo' ? 'Pending' : log.to_status === 'inprogress' ? 'In Progress' : 'Completed';
    html += `
      <div class="timeline-item">
        <span class="timeline-marker ${log.to_status}"></span>
        <div class="timeline-content">
          <div class="timeline-title">
            <strong>${log.actor_name}</strong> updated status of <strong>"${log.task_title}"</strong> to <span class="badge ${log.to_status === 'completed' ? 'badge-success' : 'badge-info'}" style="font-size:9px; padding:1px 6px;">${toName}</span>
          </div>
          ${log.note ? `<div class="timeline-note">"${log.note}"</div>` : ''}
          <div class="timeline-date">${new Date(log.timestamp).toLocaleString()}</div>
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

function renderEmployeeTimeline(logs) {
  const container = document.getElementById('employee-recent-logs');
  if (!container) return;

  if (logs.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--color-text-light); font-size:12px; padding: 20px;">No updates logged yet.</div>`;
    return;
  }

  let html = '<div class="timeline">';
  logs.forEach(log => {
    let toName = log.to_status === 'todo' ? 'Pending' : log.to_status === 'inprogress' ? 'In Progress' : 'Completed';
    html += `
      <div class="timeline-item">
        <span class="timeline-marker ${log.to_status}"></span>
        <div class="timeline-content">
          <div class="timeline-title">
            Modified task <strong>"${log.task_title}"</strong> to status <span class="badge ${log.to_status === 'completed' ? 'badge-success' : 'badge-info'}" style="font-size:9px; padding:1px 6px;">${toName}</span>
          </div>
          ${log.note ? `<div class="timeline-note">"${log.note}"</div>` : ''}
          <div class="timeline-date">${new Date(log.timestamp).toLocaleString()}</div>
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

function renderMatrixTable(matrix) {
  const tbody = document.getElementById('admin-matrix-table-body');
  if (!tbody) return;

  if (matrix.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--color-text-muted); padding: 20px;">No registered employees.</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  matrix.forEach(row => {
    tbody.innerHTML += `
      <tr>
        <td>
          <div class="avatar-cell">
            <div class="avatar-sm" style="background-color: var(--color-primary-light); color: var(--color-primary);">${getInitials(row.name)}</div>
            <strong>${row.name}</strong>
          </div>
        </td>
        <td>${row.department}</td>
        <td>${row.role}</td>
        <td style="font-weight:600;">${row.todo}</td>
        <td style="font-weight:600;">${row.inprogress}</td>
        <td style="font-weight:600; color:var(--color-success);">${row.completed}</td>
        <td><span class="badge ${row.score > 80 ? 'badge-success' : 'badge-warning'}">${row.score} Score</span></td>
      </tr>
    `;
  });
}

function renderStatusDonutChart(todo, progress, completed) {
  const wrapper = document.getElementById('donut-chart-wrapper');
  if (!wrapper) return;

  if (todo === 0 && progress === 0 && completed === 0) {
    wrapper.innerHTML = getEmptyStateHTML('No Task Data', 'Assign tasks to view chart metric.', 'ti-chart-pie');
    return;
  }

  // Restore canvas element
  wrapper.innerHTML = '<canvas id="adminStatusDonutChart"></canvas>';

  const ctx = document.getElementById('adminStatusDonutChart');
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const labelColor = isDark ? '#94A3B8' : '#64748B';

  if (dashboardDonutChart) dashboardDonutChart.destroy();

  dashboardDonutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Pending', 'In Progress', 'Completed'],
      datasets: [{
        data: [todo, progress, completed],
        backgroundColor: ['#94A3B8', '#2563EB', '#10B981'],
        borderWidth: 0,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: labelColor, boxWidth: 12, font: { family: 'Plus Jakarta Sans', size: 11 } }
        }
      },
      cutout: '70%'
    }
  });
}

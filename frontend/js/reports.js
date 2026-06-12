/**
 * TaskPilot Enterprise — Reports & Analytics Handler
 */

async function loadFilteredReports() {
  const department = document.getElementById('report-dept-select').value;
  const priority = document.getElementById('report-priority-select').value;

  const tbody = document.getElementById('report-table-body');
  if (!tbody) return;

  try {
    const res = await apiClient.get(`/reports/filtered?department=${department}&priority=${priority}`);
    if (!res.success) return;

    if (res.report.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--color-text-muted); padding: 20px;">No matching records found.</td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    res.report.forEach(t => {
      tbody.innerHTML += `
        <tr>
          <td>#${t.id}</td>
          <td><strong>${t.title}</strong></td>
          <td>${t.assignee_name}</td>
          <td><span class="badge ${t.status === 'completed' ? 'badge-success' : 'badge-info'}">${t.status}</span></td>
          <td>${t.priority}</td>
          <td>${t.due_date}</td>
        </tr>
      `;
    });
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

function exportCSVReport() {
  const department = document.getElementById('report-dept-select').value;
  const priority = document.getElementById('report-priority-select').value;

  const token = localStorage.getItem('tp_token');
  const url = `${API_BASE_URL}/reports/export?department=${department}&priority=${priority}&token=${token}`;
  
  // Download file via opening hidden anchor link
  const link = document.createElement('a');
  link.href = url;
  
  // Attach authorization header workaround by appending token parameter or downloading directly
  // Note: Since standard href downloads don't support custom headers easily, we've enabled authorization token parameter check in middleware or handle download
  // Let's implement authorization via token query parameter in authMiddleware for export route, OR use fetch blob!
  // Fetch Blob is cleaner and more secure:
  downloadCSVReportFile(department, priority);
}

async function downloadCSVReportFile(department, priority) {
  try {
    const token = localStorage.getItem('tp_token');
    const response = await fetch(`${API_BASE_URL}/reports/export?department=${department}&priority=${priority}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to export CSV report.');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `taskpilot_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV report downloaded successfully.', 'success');
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

function printPDFReport() {
  window.print();
}

/**
 * TaskPilot Enterprise — Shared UI Framework
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check session on page load
  if (!window.location.pathname.endsWith('login.html') && !window.location.pathname.endsWith('index.html')) {
    auth.checkSession();
    initializeShellComponents();
  }
});

async function initializeShellComponents() {
  await loadSidebar();
  await loadNavbar();
  restoreThemePreference();
}

async function loadSidebar() {
  const container = document.getElementById('sidebar-container');
  if (!container) return;

  try {
    const response = await fetch('components/sidebar.html');
    const html = await response.text();
    container.innerHTML = html;

    const user = auth.getCurrentUser();
    if (user) {
      document.getElementById('nav-username').innerText = user.name;
      document.getElementById('nav-userrole').innerText = user.role === 'admin' ? 'Administrator' : 'Employee';
      document.getElementById('nav-avatar').innerText = getInitials(user.name);

      renderSidebarLinks(user.role);
    }
  } catch (err) {
    console.error('Failed to load sidebar template:', err);
  }
}

async function loadNavbar() {
  const container = document.getElementById('navbar-container');
  if (!container) return;

  try {
    const response = await fetch('components/navbar.html');
    const html = await response.text();
    container.innerHTML = html;
  } catch (err) {
    console.error('Failed to load navbar template:', err);
  }
}

function renderSidebarLinks(role) {
  const menu = document.getElementById('sidebar-menu-items');
  if (!menu) return;

  let links = '';
  if (role === 'admin') {
    links = `
      <div class="menu-label">Console</div>
      <a class="sidebar-link" href="admin-dashboard.html" id="link-admin-dashboard">
        <i class="ti ti-smart-home"></i>
        <span>Dashboard</span>
      </a>
      <a class="sidebar-link" href="task-management.html" id="link-task-management">
        <i class="ti ti-checkbox"></i>
        <span>Tasks</span>
      </a>
      <a class="sidebar-link" href="employee-management.html" id="link-employee-management">
        <i class="ti ti-users"></i>
        <span>Employees</span>
      </a>
      <div class="menu-label">Reports & Profile</div>
      <a class="sidebar-link" href="reports.html" id="link-reports">
        <i class="ti ti-chart-bar"></i>
        <span>Reports</span>
      </a>
      <a class="sidebar-link" href="profile.html" id="link-profile">
        <i class="ti ti-settings"></i>
        <span>Profile</span>
      </a>
    `;
  } else {
    links = `
      <div class="menu-label">My Space</div>
      <a class="sidebar-link" href="employee-dashboard.html" id="link-employee-dashboard">
        <i class="ti ti-checkbox"></i>
        <span>My Tasks</span>
      </a>
      <div class="menu-label">Settings</div>
      <a class="sidebar-link" href="profile.html" id="link-profile">
        <i class="ti ti-settings"></i>
        <span>My Profile</span>
      </a>
    `;
  }

  menu.innerHTML = links;
  highlightActiveSidebarLink();
}

function highlightActiveSidebarLink() {
  const path = window.location.pathname;
  const pageName = path.substring(path.lastIndexOf('/') + 1);
  
  // Strip extension
  const idStr = pageName.replace('.html', '');
  const element = document.getElementById(`link-${idStr}`);
  
  if (element) {
    element.classList.add('active');
  }
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.toggle('mobile-active');
}

function handleLogout() {
  auth.handleLogout();
}

// Theme Controls
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const target = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', target);
  localStorage.setItem('tp_theme', target);

  const icon = document.getElementById('theme-icon');
  if (icon) icon.className = target === 'dark' ? 'ti ti-moon' : 'ti ti-sun';
}

function restoreThemePreference() {
  const saved = localStorage.getItem('tp_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.className = saved === 'dark' ? 'ti ti-moon' : 'ti ti-sun';
}

// Toast alerts
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'ti-info-circle';
  if (type === 'success') icon = 'ti-circle-check';
  else if (type === 'warning') icon = 'ti-alert-circle';
  else if (type === 'danger') icon = 'ti-alert-triangle';

  toast.innerHTML = `
    <i class="ti ${icon} toast-icon"></i>
    <div class="toast-message">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => {
      container.removeChild(toast);
    }, 300);
  }, 3000);
}

function getInitials(name) {
  if (!name) return 'TP';
  return name.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
}

function getEmptyStateHTML(title, desc, icon = 'ti-database-off') {
  return `
    <div class="empty-state">
      <div class="empty-state-icon"><i class="ti ${icon}"></i></div>
      <div class="empty-state-title">${title}</div>
      <div class="empty-state-desc">${desc}</div>
    </div>
  `;
}

// ----------------------------------------------------
// GLOBAL SEARCH CONTROLLER
// ----------------------------------------------------
let searchTimeout = null;

async function handleGlobalSearch(query) {
  const dropdown = document.getElementById('search-results-dropdown');
  if (!dropdown) return;

  if (!query || !query.trim()) {
    dropdown.innerHTML = '';
    dropdown.style.display = 'none';
    return;
  }

  const q = query.toLowerCase().trim();

  // Show dropdown with a loading state
  dropdown.style.display = 'flex';
  dropdown.innerHTML = `<div style="text-align: center; padding: 12px; font-size:12px; color:var(--color-text-muted);"><i class="ti ti-loader animate-spin" style="margin-right: 6px;"></i>Searching tasks...</div>`;

  // Debounce API calls
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    try {
      const user = auth.getCurrentUser();
      if (!user) return;

      // Fetch tasks based on user role
      const endpoint = user.role === 'admin' ? '/tasks?all=true' : '/tasks';
      const res = await apiClient.get(endpoint);
      if (!res.success) {
        dropdown.style.display = 'none';
        return;
      }

      // Filter tasks by matching title or description
      const filtered = res.tasks.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q)
      );

      if (filtered.length === 0) {
        dropdown.innerHTML = `<div class="search-no-results">No tasks found matching "${query}"</div>`;
        return;
      }

      // Render matching tasks (limit to 5)
      let html = `<div class="search-section-header">Matching Tasks (${filtered.length})</div>`;
      filtered.slice(0, 5).forEach(t => {
        let statusColor = 'var(--color-text-muted)';
        if (t.status === 'completed') statusColor = 'var(--color-success)';
        else if (t.status === 'inprogress') statusColor = 'var(--color-warning)';
        
        let priorityColor = 'var(--color-text-muted)';
        if (t.priority === 'High') priorityColor = 'var(--color-danger)';
        else if (t.priority === 'Medium') priorityColor = 'var(--color-warning)';

        const targetPage = user.role === 'admin' ? 'task-management.html' : 'employee-dashboard.html';
        const clickUrl = `${targetPage}?search=${encodeURIComponent(t.title)}`;

        html += `
          <a class="search-item" href="${clickUrl}">
            <div class="search-item-title">${t.title}</div>
            <div class="search-item-meta">
              <span>Status: <strong style="color: ${statusColor};">${t.status}</strong></span>
              <span>Priority: <strong style="color: ${priorityColor};">${t.priority}</strong></span>
            </div>
          </a>
        `;
      });

      if (filtered.length > 5) {
        const targetPage = user.role === 'admin' ? 'task-management.html' : 'employee-dashboard.html';
        html += `
          <a class="search-item" href="${targetPage}?search=${encodeURIComponent(query)}" style="text-align: center; font-weight: 600; color: var(--color-primary); font-size: 11.5px; border-top: 1px solid var(--color-border); margin-top: 4px; padding-top: 8px;">
            View all ${filtered.length} matching tasks
          </a>
        `;
      }

      dropdown.innerHTML = html;
    } catch (err) {
      console.error('Search error:', err);
      dropdown.innerHTML = `<div class="search-no-results" style="color: var(--color-danger);">Error fetching search results.</div>`;
    }
  }, 200);
}

// Close search dropdown on click outside
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('search-results-dropdown');
  const input = document.getElementById('global-search-input');
  if (dropdown && input && !dropdown.contains(e.target) && !input.contains(e.target)) {
    dropdown.style.display = 'none';
  }
});


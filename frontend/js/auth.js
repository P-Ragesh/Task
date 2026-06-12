/**
 * TaskPilot Enterprise — Authentication Session Controller
 */

const auth = {
  getToken() {
    return localStorage.getItem('tp_token');
  },

  getCurrentUser() {
    const userJson = localStorage.getItem('tp_user');
    return userJson ? JSON.parse(userJson) : null;
  },

  checkSession(requiredRole = null) {
    const token = this.getToken();
    const user = this.getCurrentUser();

    // Not Logged In
    if (!token || !user) {
      if (!window.location.pathname.endsWith('login.html')) {
        window.location.href = 'login.html';
      }
      return;
    }

    // Role-based Access Gate
    if (requiredRole) {
      const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!allowedRoles.includes(user.role)) {
        if (user.role === 'admin') {
          window.location.href = 'admin-dashboard.html';
        } else {
          window.location.href = 'employee-dashboard.html';
        }
        return;
      }
    }

    // On login screen but already authenticated -> Redirect home
    if (window.location.pathname.endsWith('login.html')) {
      if (user.role === 'admin') {
        window.location.href = 'admin-dashboard.html';
      } else {
        window.location.href = 'employee-dashboard.html';
      }
    }
  },

  async handleLogin(usernameOrEmail, password, portal) {
    try {
      const payload = portal === 'admin' 
        ? { username: usernameOrEmail, password, portal }
        : { email: usernameOrEmail, password, portal };

      const res = await apiClient.post('/auth/login', payload);

      if (res.success) {
        localStorage.setItem('tp_token', res.token);
        localStorage.setItem('tp_user', JSON.stringify(res.user));

        if (res.user.role === 'admin') {
          window.location.href = 'admin-dashboard.html';
        } else {
          window.location.href = 'employee-dashboard.html';
        }
      }
    } catch (err) {
      showToast(err.message, 'danger');
    }
  },

  handleLogout() {
    localStorage.removeItem('tp_token');
    localStorage.removeItem('tp_user');
    window.location.href = 'login.html';
  }
};

/**
 * TaskPilot Enterprise — Input Validation Utilities
 */

const validation = {
  async isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) return false;

    try {
      const res = await apiClient.get(`/employees/validate-email?email=${encodeURIComponent(email)}`);
      if (res && res.hasOwnProperty('isValid')) {
        return res.isValid;
      }
      return false;
    } catch (err) {
      console.warn('Backend DNS check failed, falling back to basic validation:', err);
      return true;
    }
  },

  isValidPhone(phone) {
    // Validates formats like +123456789, 555-1234, etc.
    const re = /^[\d\s\-+\(\)]{7,20}$/;
    return re.test(phone);
  },

  isNotEmpty(value) {
    return value !== undefined && value !== null && value.trim() !== '';
  },

  hasMinLength(value, len) {
    return value && value.length >= len;
  }
};

const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const dns = require('dns').promises;

async function getAllEmployees(req, res) {
  try {
    const list = await Employee.findAll();
    res.status(200).json({ success: true, employees: list });
  } catch (err) {
    console.error('Get employees error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve employee directory.' });
  }
}

async function createEmployee(req, res) {
  try {
    const { name, email, role, department, phone, password } = req.body;

    if (!name || !email || !role || !department || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All registration parameters are required.' });
    }

    // Email conflict check
    const existing = await Employee.findByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email address is already registered.' });
    }

    // Real-world DNS email verification
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }
    const domain = email.split('@')[1];
    const mxValid = await performMxLookup(domain);
    if (!mxValid) {
      return res.status(400).json({ success: false, message: 'Please enter a valid active email address (domain does not exist or has no MX records).' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newId = await Employee.create({
      name,
      email,
      role,
      department,
      phone,
      password: hashedPassword
    });

    res.status(201).json({
      success: true,
      message: 'Employee account registered successfully.',
      employeeId: newId
    });
  } catch (err) {
    console.error('Create employee error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create employee account.' });
  }
}

async function updateEmployee(req, res) {
  try {
    const { id } = req.params;
    const { name, email, role, department, phone } = req.body;

    if (!name || !email || !role || !department || !phone) {
      return res.status(400).json({ success: false, message: 'All parameters are required.' });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found.' });
    }

    // Email conflict check
    const conflict = await Employee.findByEmail(email);
    if (conflict && conflict.id !== parseInt(id)) {
      return res.status(400).json({ success: false, message: 'Email address is already in use.' });
    }

    // Real-world DNS email verification
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }
    const domain = email.split('@')[1];
    const mxValid = await performMxLookup(domain);
    if (!mxValid) {
      return res.status(400).json({ success: false, message: 'Please enter a valid active email address (domain does not exist or has no MX records).' });
    }

    await Employee.update(id, { name, email, role, department, phone });
    res.status(200).json({ success: true, message: 'Employee profile updated successfully.' });
  } catch (err) {
    console.error('Update employee error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update employee.' });
  }
}

async function deleteEmployee(req, res) {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found.' });
    }

    await Employee.delete(id);
    res.status(200).json({ success: true, message: 'Employee account deleted successfully.' });
  } catch (err) {
    console.error('Delete employee error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete employee account.' });
  }
}

async function resetEmployeePassword(req, res) {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await Employee.updatePassword(id, hashedPassword);

    res.status(200).json({ success: true, message: `Password reset successfully for ${employee.name}.` });
  } catch (err) {
    console.error('Password reset error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to reset employee password.' });
  }
}

async function performMxLookup(domain) {
  try {
    const mx = await dns.resolveMx(domain);
    return mx && mx.length > 0;
  } catch (err) {
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
      try {
        const { Resolver } = require('dns').promises;
        const resolver = new Resolver();
        resolver.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
        const mx = await resolver.resolveMx(domain);
        return mx && mx.length > 0;
      } catch (publicDnsErr) {
        if (publicDnsErr.code === 'ENOTFOUND' || publicDnsErr.code === 'ENODATA') {
          return false;
        }
        return true; // network/port blocking -> fallback to valid
      }
    }
    return true; // local DNS lookup timeout/refused -> fallback to valid
  }
}

async function validateEmailRealWorld(req, res) {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email query parameter is required.' });
    }

    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
      return res.status(200).json({ success: true, isValid: false, reason: 'Invalid email format' });
    }

    const domain = email.split('@')[1];
    if (!domain) {
      return res.status(200).json({ success: true, isValid: false, reason: 'No domain found' });
    }

    const isValid = await performMxLookup(domain);
    return res.status(200).json({ success: true, isValid });
  } catch (err) {
    console.error('Email validation error:', err.message);
    res.status(200).json({ success: true, isValid: true, fallback: true });
  }
}

module.exports = {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  resetEmployeePassword,
  validateEmailRealWorld
};

const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');
const { signToken } = require('../config/jwtConfig');
const dns = require('dns').promises;

async function login(req, res) {
  try {
    const { username, email, password, portal } = req.body;

    if (portal === 'admin') {
      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and Password are required.' });
      }

      const admin = await Admin.findByUsername(username);
      if (!admin) {
        return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
      }

      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
      }

      const token = signToken({
        id: admin.id,
        username: admin.username,
        name: 'System Admin',
        role: 'admin'
      });

      return res.status(200).json({
        success: true,
        message: 'Admin login successful.',
        token,
        user: { id: admin.id, name: 'System Admin', role: 'admin', username: admin.username }
      });
    } else {
      // Employee portal
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and Password are required.' });
      }

      const employee = await Employee.findByEmail(email);
      if (!employee) {
        return res.status(401).json({ success: false, message: 'Invalid employee credentials.' });
      }

      const isValidPassword = await bcrypt.compare(password, employee.password);
      if (!isValidPassword) {
        return res.status(401).json({ success: false, message: 'Invalid employee credentials.' });
      }

      const userRole = (employee.role && employee.role.toLowerCase() === 'admin') ? 'admin' : 'employee';

      const token = signToken({
        id: employee.id,
        email: employee.email,
        name: employee.name,
        role: userRole
      });

      return res.status(200).json({
        success: true,
        message: 'Employee login successful.',
        token,
        user: { id: employee.id, name: employee.name, role: userRole, email: employee.email }
      });
    }
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
}

async function updateProfile(req, res) {
  try {
    const { role, id } = req.user;
    const { username, password, email, phone } = req.body;

    if (role === 'admin') {
      if (!username) {
        return res.status(400).json({ success: false, message: 'Username is required.' });
      }

      let hashedPass = null;
      if (password) {
        hashedPass = await bcrypt.hash(password, 10);
      }

      await Admin.updateCredentials(id, username, hashedPass);
      return res.status(200).json({ success: true, message: 'Admin credentials updated successfully.' });
    } else {
      // Employee editing profile
      if (!email || !phone) {
        return res.status(400).json({ success: false, message: 'Email and Phone are required.' });
      }

      const current = await Employee.findById(id);
      if (!current) {
        return res.status(404).json({ success: false, message: 'Employee not found.' });
      }

      // Check unique email conflict
      const conflict = await Employee.findByEmail(email);
      if (conflict && conflict.id !== id) {
        return res.status(400).json({ success: false, message: 'Email is already in use.' });
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

      // Update basic details
      await Employee.update(id, {
        name: current.name,
        email,
        role: current.role,
        department: current.department,
        phone
      });

      // Update password if present
      if (password) {
        const hashedPass = await bcrypt.hash(password, 10);
        await Employee.updatePassword(id, hashedPass);
      }

      return res.status(200).json({ success: true, message: 'Employee profile updated successfully.' });
    }
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ success: false, message: 'An internal server error occurred.' });
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

module.exports = {
  login,
  updateProfile
};

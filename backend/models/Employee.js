const { query } = require('../database');

class Employee {
  static async create({ name, email, role, department, phone, password }) {
    const sql = `INSERT INTO employees (name, email, role, department, phone, password)
                 VALUES (?, ?, ?, ?, ?, ?)`;
    const result = await query.run(sql, [name, email, role, department, phone, password]);
    return result.id;
  }

  static async findAll() {
    const sql = 'SELECT id, name, email, role, department, phone FROM employees ORDER BY id DESC';
    return await query.all(sql);
  }

  static async findById(id) {
    const sql = 'SELECT * FROM employees WHERE id = ?';
    return await query.get(sql, [id]);
  }

  static async findByEmail(email) {
    const sql = 'SELECT * FROM employees WHERE email = ?';
    return await query.get(sql, [email]);
  }

  static async update(id, { name, email, role, department, phone }) {
    const sql = `UPDATE employees 
                 SET name = ?, email = ?, role = ?, department = ?, phone = ? 
                 WHERE id = ?`;
    return await query.run(sql, [name, email, role, department, phone, id]);
  }

  static async updatePassword(id, hashedPassword) {
    const sql = 'UPDATE employees SET password = ? WHERE id = ?';
    return await query.run(sql, [hashedPassword, id]);
  }

  static async delete(id) {
    const sql = 'DELETE FROM employees WHERE id = ?';
    return await query.run(sql, [id]);
  }
}

module.exports = Employee;

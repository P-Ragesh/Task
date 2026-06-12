const { query } = require('../database');

class Task {
  static async create({ title, description, priority, status = 'todo', assignee_id, due_date }) {
    const sql = `INSERT INTO tasks (title, description, priority, status, assignee_id, due_date)
                 VALUES (?, ?, ?, ?, ?, ?)`;
    const result = await query.run(sql, [title, description, priority, status, assignee_id, due_date]);
    return result.id;
  }

  static async findAll() {
    const sql = `
      SELECT t.*, e.name as assignee_name, e.department as assignee_department
      FROM tasks t
      JOIN employees e ON t.assignee_id = e.id
      ORDER BY t.id DESC
    `;
    return await query.all(sql);
  }

  static async findById(id) {
    const sql = 'SELECT * FROM tasks WHERE id = ?';
    return await query.get(sql, [id]);
  }

  static async findByAssignee(assigneeId) {
    const sql = 'SELECT * FROM tasks WHERE assignee_id = ? ORDER BY id DESC';
    return await query.all(sql, [assigneeId]);
  }

  static async update(id, { title, description, priority, status, assignee_id, due_date }) {
    const sql = `UPDATE tasks 
                 SET title = ?, description = ?, priority = ?, status = ?, assignee_id = ?, due_date = ?
                 WHERE id = ?`;
    return await query.run(sql, [title, description, priority, status, assignee_id, due_date, id]);
  }

  static async updateStatus(id, status, completionNote = '') {
    const sql = 'UPDATE tasks SET status = ?, completion_note = ? WHERE id = ?';
    return await query.run(sql, [status, completionNote, id]);
  }

  static async delete(id) {
    const sql = 'DELETE FROM tasks WHERE id = ?';
    return await query.run(sql, [id]);
  }
}

module.exports = Task;

const { query } = require('../database');

class TaskStatus {
  static async create({ task_id, from_status, to_status, note = '', actor_name }) {
    const sql = `INSERT INTO task_status_history (task_id, from_status, to_status, note, actor_name)
                 VALUES (?, ?, ?, ?, ?)`;
    const result = await query.run(sql, [task_id, from_status, to_status, note, actor_name]);
    return result.id;
  }

  static async findByTaskId(taskId) {
    const sql = 'SELECT * FROM task_status_history WHERE task_id = ? ORDER BY id DESC';
    return await query.all(sql, [taskId]);
  }

  static async findRecent(limit = 10) {
    const sql = `
      SELECT h.*, t.title as task_title
      FROM task_status_history h
      JOIN tasks t ON h.task_id = t.id
      ORDER BY h.id DESC
      LIMIT ?
    `;
    return await query.all(sql, [limit]);
  }

  static async findRecentByAssignee(assigneeId, limit = 10) {
    const sql = `
      SELECT h.*, t.title as task_title
      FROM task_status_history h
      JOIN tasks t ON h.task_id = t.id
      WHERE t.assignee_id = ?
      ORDER BY h.id DESC
      LIMIT ?
    `;
    return await query.all(sql, [assigneeId, limit]);
  }
}

module.exports = TaskStatus;

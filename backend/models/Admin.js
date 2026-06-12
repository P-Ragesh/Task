const { query } = require('../database');

class Admin {
  static async findById(id) {
    const sql = 'SELECT * FROM admins WHERE id = ?';
    return await query.get(sql, [id]);
  }

  static async findByUsername(username) {
    const sql = 'SELECT * FROM admins WHERE username = ?';
    return await query.get(sql, [username]);
  }

  static async updateCredentials(id, username, hashedPass = null) {
    if (hashedPass) {
      const sql = 'UPDATE admins SET username = ?, password = ? WHERE id = ?';
      return await query.run(sql, [username, hashedPass, id]);
    } else {
      const sql = 'UPDATE admins SET username = ? WHERE id = ?';
      return await query.run(sql, [username, id]);
    }
  }
}

module.exports = Admin;

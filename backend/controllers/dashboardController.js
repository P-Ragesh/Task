const Employee = require('../models/Employee');
const Task = require('../models/Task');
const TaskStatus = require('../models/TaskStatus');

async function getAdminDashboardStats(req, res) {
  try {
    const emps = await Employee.findAll();
    const tasks = await Task.findAll();
    const recentLogs = await TaskStatus.findRecent(10);

    const totalEmployees = emps.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inprogressTasks = tasks.filter(t => t.status === 'inprogress').length;
    const pendingTasks = tasks.filter(t => t.status === 'todo').length;

    // Build Employee performance scorecard matrix
    const employeeMatrix = emps.map(emp => {
      const empTasks = tasks.filter(t => t.assignee_id === emp.id);
      const todo = empTasks.filter(t => t.status === 'todo').length;
      const inprogress = empTasks.filter(t => t.status === 'inprogress').length;
      const completed = empTasks.filter(t => t.status === 'completed').length;

      let score = 100;
      if (empTasks.length > 0) {
        score = Math.round(50 + ((completed / empTasks.length) * 50));
      }

      return {
        id: emp.id,
        name: emp.name,
        department: emp.department,
        role: emp.role,
        todo,
        inprogress,
        completed,
        score
      };
    });

    res.status(200).json({
      success: true,
      stats: {
        totalEmployees,
        totalTasks,
        completedTasks,
        inprogressTasks,
        pendingTasks
      },
      recentLogs,
      employeeMatrix
    });
  } catch (err) {
    console.error('Admin dashboard stats error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to aggregate dashboard analytics.' });
  }
}

async function getEmployeeDashboardStats(req, res) {
  try {
    const empId = req.user.id;
    const allTasks = await Task.findByAssignee(empId);
    const recentLogs = await TaskStatus.findRecentByAssignee(empId, 10);

    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === 'completed').length;
    const inprogressTasks = allTasks.filter(t => t.status === 'inprogress').length;
    const pendingTasks = allTasks.filter(t => t.status === 'todo').length;

    const rate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalTasks,
        completedTasks,
        inprogressTasks,
        pendingTasks,
        score: rate
      },
      recentLogs
    });
  } catch (err) {
    console.error('Employee dashboard stats error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve stats.' });
  }
}

module.exports = {
  getAdminDashboardStats,
  getEmployeeDashboardStats
};

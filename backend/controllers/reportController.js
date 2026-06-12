const Task = require('../models/Task');
const Employee = require('../models/Employee');
const { generateCSV } = require('../services/reportService');

async function getFilteredReport(req, res) {
  try {
    const { department, priority } = queryParams(req.query);

    const employees = await Employee.findAll();
    const tasks = await Task.findAll();

    const filtered = filterTasks(tasks, employees, department, priority);

    res.status(200).json({ success: true, report: filtered });
  } catch (err) {
    console.error('Filter report error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to compile report.' });
  }
}

async function exportCSVReport(req, res) {
  try {
    const { department, priority } = queryParams(req.query);

    const employees = await Employee.findAll();
    const tasks = await Task.findAll();

    const filtered = filterTasks(tasks, employees, department, priority);

    const headers = ['Task ID', 'Title', 'Description', 'Priority', 'Status', 'Assignee Name', 'Due Date', 'Completion Note'];
    const keyMappings = ['id', 'title', 'description', 'priority', 'status', 'assignee_name', 'due_date', 'completion_note'];

    const csvData = generateCSV(headers, filtered, keyMappings);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=taskpilot_report_${Date.now()}.csv`);
    return res.status(200).send(csvData);
  } catch (err) {
    console.error('CSV export error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to export CSV report.' });
  }
}

// Helpers
function queryParams(query) {
  return {
    department: query.department || 'All',
    priority: query.priority || 'All'
  };
}

function filterTasks(tasks, employees, department, priority) {
  return tasks.filter(t => {
    const emp = employees.find(e => e.id === t.assignee_id);
    const matchesDept = department === 'All' || (emp && emp.department === department);
    const matchesPriority = priority === 'All' || t.priority === priority;
    return matchesDept && matchesPriority;
  });
}

module.exports = {
  getFilteredReport,
  exportCSVReport
};

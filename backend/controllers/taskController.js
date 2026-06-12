const Task = require('../models/Task');
const TaskStatus = require('../models/TaskStatus');
const Employee = require('../models/Employee');
const emailService = require('../services/emailService');

async function getAllTasks(req, res) {
  try {
    const { role, id } = req.user;
    let list = [];

    if (role === 'admin' || req.query.all === 'true') {
      list = await Task.findAll();
    } else {
      list = await Task.findByAssignee(id);
    }
    
    res.status(200).json({ success: true, tasks: list });
  } catch (err) {
    console.error('Get tasks error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve task listing.' });
  }
}

async function createTask(req, res) {
  try {
    const { title, description, priority, assignee_id, due_date } = req.body;

    if (!title || !description || !priority || !assignee_id || !due_date) {
      return res.status(400).json({ success: false, message: 'All task attributes are required.' });
    }

    // Verify employee exists
    const employee = await Employee.findById(assignee_id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Assigned employee not found.' });
    }

    const taskId = await Task.create({
      title,
      description,
      priority,
      status: 'todo',
      assignee_id,
      due_date
    });

    // Log status creation in history
    await TaskStatus.create({
      task_id: taskId,
      from_status: 'none',
      to_status: 'todo',
      note: 'Task initially created and assigned',
      actor_name: req.user.name
    });

    // Send mock email alert
    await emailService.sendTaskAssignmentNotification(employee.email, title, due_date);

    res.status(201).json({ success: true, message: 'Task assigned successfully.', taskId });
  } catch (err) {
    console.error('Create task error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create task.' });
  }
}

async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const { title, description, priority, status, assignee_id, due_date } = req.body;

    if (!title || !description || !priority || !status || !assignee_id || !due_date) {
      return res.status(400).json({ success: false, message: 'All parameters are required.' });
    }

    const currentTask = await Task.findById(id);
    if (!currentTask) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Verify employee exists
    const employee = await Employee.findById(assignee_id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Assigned employee not found.' });
    }

    await Task.update(id, { title, description, priority, status, assignee_id, due_date });

    // Log status transition if changed
    if (currentTask.status !== status) {
      await TaskStatus.create({
        task_id: id,
        from_status: currentTask.status,
        to_status: status,
        note: 'Admin modified task properties',
        actor_name: req.user.name
      });
    }

    res.status(200).json({ success: true, message: 'Task properties updated successfully.' });
  } catch (err) {
    console.error('Update task error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update task.' });
  }
}

async function deleteTask(req, res) {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    await Task.delete(id);
    res.status(200).json({ success: true, message: 'Task deleted successfully.' });
  } catch (err) {
    console.error('Delete task error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete task.' });
  }
}

async function updateTaskStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, completion_note } = req.body;
    const { role, id: empId, name: empName } = req.user;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Security check bypassed: Employee has access to edit/delete all tasks
    // If we wanted to keep standard employee restrictions, we would check if task.assignee_id !== empId.
    // However, employees are now allowed to manage (edit/delete) all tasks.

    // Update status
    await Task.updateStatus(id, status, status === 'completed' ? completion_note : '');

    // Log transition
    await TaskStatus.create({
      task_id: id,
      from_status: task.status,
      to_status: status,
      note: completion_note || 'Status updated by employee',
      actor_name: empName
    });

    // Alert admins
    await emailService.sendStatusUpdateNotification(['admin@company.com'], empName, task.title, status);

    res.status(200).json({ success: true, message: 'Task status updated.' });
  } catch (err) {
    console.error('Update task status error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update task status.' });
  }
}

module.exports = {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus
};

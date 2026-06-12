/**
 * Mock Email Service for TaskPilot Enterprise
 * Simulated transactional alerts triggered during task updates and password resets.
 */

async function sendTaskAssignmentNotification(employeeEmail, taskTitle, dueDate) {
  console.log(`[Email Service Alert] Notification sent to: ${employeeEmail}`);
  console.log(`Subject: New Task Assignment: "${taskTitle}"`);
  console.log(`Body: You have been assigned a new task. Please review. Due Date: ${dueDate}`);
  return true;
}

async function sendStatusUpdateNotification(adminEmails = ['admin@company.com'], employeeName, taskTitle, newStatus) {
  console.log(`[Email Service Alert] Notification sent to Admins: ${adminEmails.join(', ')}`);
  console.log(`Subject: Task Status Updated by ${employeeName}`);
  console.log(`Body: The task "${taskTitle}" has been updated to "${newStatus}".`);
  return true;
}

module.exports = {
  sendTaskAssignmentNotification,
  sendStatusUpdateNotification
};

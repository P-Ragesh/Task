/**
 * Report Builder Service for TaskPilot Enterprise
 * Converts arrays of JavaScript objects into CSV files.
 */

function generateCSV(headers, data, keyMappings) {
  let csvContent = headers.join(',') + '\n';
  
  data.forEach(item => {
    const row = keyMappings.map(key => {
      let val = item[key] !== undefined && item[key] !== null ? String(item[key]) : '';
      // Escape quotes and wrap in quotes to prevent delimiter breaking
      val = val.replace(/"/g, '""');
      return `"${val}"`;
    });
    csvContent += row.join(',') + '\n';
  });

  return csvContent;
}

module.exports = {
  generateCSV
};

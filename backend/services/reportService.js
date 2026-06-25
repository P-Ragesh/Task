/**
 * Report Builder Service for TaskPilot Enterprise
 * Converts arrays of JavaScript objects into CSV files.
 */

function generateCSV(headers, data, keyMappings) {
  let csvContent = headers.join(',') + '\n';
  
  data.forEach(item => {
    const row = keyMappings.map(key => {
      let val = item[key] !== undefined && item[key] !== null ? String(item[key]) : '';
      
      // Format due_date to be Excel-friendly (YYYY-MM-DD, which Excel understands)
      if (key === 'due_date' && val) {
        // If it's a valid date string, ensure it's in YYYY-MM-DD format
        const date = new Date(val);
        if (!isNaN(date.getTime())) {
          val = date.toISOString().split('T')[0];
        }
      }
      
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

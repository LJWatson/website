const { DateTime } = require('luxon');

module.exports = function(date, format = 'DDD') {
  // Handle various date input types
  let dateObj;

  if (date instanceof Date) {
    dateObj = DateTime.fromJSDate(date);
  } else if (typeof date === 'string') {
    // Try parsing as ISO string (YYYY-MM-DD)
    dateObj = DateTime.fromISO(date);

    // If that fails, try other formats
    if (!dateObj.isValid) {
      dateObj = DateTime.fromFormat(date, 'yyyy-MM-dd');
    }
  } else {
    // Return original if we can't parse it
    return date;
  }

  if (dateObj.isValid) {
    return dateObj.toFormat(format);
  } else {
    // Return the original date string if parsing fails
    return date;
  }
};
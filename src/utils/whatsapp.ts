export const sendToWhatsApp = (phone: string, message: string): void => {
  // Clean phone number
  const cleanPhone = phone.replace(/[^\d]/g, '');
  const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Create WhatsApp URL
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  
  // Open WhatsApp
  window.open(whatsappUrl, '_blank');
};

export const generateDailyMessage = (
  studentName: string,
  date: string,
  isPresent: boolean,
  homeworkCompleted: boolean
): string => {
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  let message = `📚 *Daily Report - ${studentName}*\n`;
  message += `📅 Date: ${formattedDate}\n\n`;
  
  message += `📝 *Attendance:* ${isPresent ? '✅ Present' : '❌ Absent'}\n`;
  message += `📖 *Homework:* ${homeworkCompleted ? '✅ Completed' : '❌ Not Done'}\n\n`;
  
  if (!isPresent || !homeworkCompleted) {
    message += `⚠️ Please ensure ${studentName} ${!isPresent ? 'attends classes regularly' : ''} ${!isPresent && !homeworkCompleted ? ' and ' : ''} ${!homeworkCompleted ? 'completes homework daily' : ''} for better performance.\n\n`;
  } else {
    message += `🎉 Great job! ${studentName} had a perfect day today.\n\n`;
  }
  
  message += `Thank you!\n*Hitesh Sir*`;
  
  return message;
};

export const generateMonthlyMessage = (
  studentName: string,
  month: string,
  attendanceStats: { present: number; total: number },
  homeworkStats: { completed: number; total: number },
  rank: number
): string => {
  const monthName = new Date(month + '-01').toLocaleDateString('en-IN', { 
    month: 'long', 
    year: 'numeric' 
  });

  const attendanceRate = Math.round((attendanceStats.present / attendanceStats.total) * 100);
  const homeworkRate = Math.round((homeworkStats.completed / homeworkStats.total) * 100);

  let message = `📊 *Monthly Report - ${studentName}*\n`;
  message += `📅 Month: ${monthName}\n\n`;
  
  message += `📝 *Attendance:*\n`;
  message += `   Present: ${attendanceStats.present} out of ${attendanceStats.total} days\n`;
  message += `   Rate: ${attendanceRate}%\n\n`;
  
  message += `📖 *Homework:*\n`;
  message += `   Completed: ${homeworkStats.completed} out of ${homeworkStats.total} assignments\n`;
  message += `   Rate: ${homeworkRate}%\n\n`;
  
  message += `🏆 *Class Rank:* #${rank}\n\n`;
  
  if (attendanceRate < 80 || homeworkRate < 80) {
    message += `⚠️ *Areas for Improvement:*\n`;
    if (attendanceRate < 80) message += `• Regular attendance needed\n`;
    if (homeworkRate < 80) message += `• More focus on homework completion\n`;
    message += `\n`;
  } else {
    message += `🌟 Excellent performance this month!\n\n`;
  }
  
  message += `Thank you for your support!\n*Hitesh Sir*`;
  
  return message;
};
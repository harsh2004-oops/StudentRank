import { Student, AttendanceRecord, HomeworkRecord, StudentStats } from '../types';

export const calculateStudentStats = (
  students: Student[],
  attendanceRecords: AttendanceRecord[],
  homeworkRecords: HomeworkRecord[],
  month: string,
  batch?: string
): StudentStats[] => {
  const filteredStudents = batch ? students.filter(s => s.batch === batch) : students;

  const stats: StudentStats[] = filteredStudents
    .filter(student => student.isActive)
    .map(student => {
      const studentAttendance = attendanceRecords.filter(
        record => record.studentId === student.id && record.month === month
      );
      const studentHomework = homeworkRecords.filter(
        record => record.studentId === student.id && record.month === month
      );

      const presentDays = studentAttendance.filter(record => record.isPresent).length;
      const totalDays = studentAttendance.length;
      const homeworkCompleted = studentHomework.filter(record => record.isCompleted).length;
      const totalHomework = studentHomework.length;

      const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
      const homeworkRate = totalHomework > 0 ? (homeworkCompleted / totalHomework) * 100 : 0;
      
      // Total score: 60% attendance + 40% homework
      const totalScore = (attendanceRate * 0.6) + (homeworkRate * 0.4);

      return {
        studentId: student.id,
        attendanceRate,
        homeworkRate,
        totalScore,
        rank: 0, // Will be calculated after sorting
        presentDays,
        totalDays,
        homeworkCompleted,
        totalHomework
      };
    });

  // Sort by total score and assign ranks
  stats.sort((a, b) => b.totalScore - a.totalScore);
  stats.forEach((stat, index) => {
    stat.rank = index + 1;
  });

  return stats;
};

export const calculateOverallRank = (
  students: Student[],
  attendanceRecords: AttendanceRecord[],
  homeworkRecords: HomeworkRecord[],
  month: string
): StudentStats[] => {
  return calculateStudentStats(students, attendanceRecords, homeworkRecords, month);
};

export const getCurrentMonth = (): string => {
  return new Date().toISOString().slice(0, 7); // YYYY-MM format
};

export const getAvailableMonths = (
  attendanceRecords: AttendanceRecord[],
  homeworkRecords: HomeworkRecord[]
): string[] => {
  const months = new Set<string>();
  
  attendanceRecords.forEach(record => months.add(record.month));
  homeworkRecords.forEach(record => months.add(record.month));
  
  return Array.from(months).sort().reverse();
};
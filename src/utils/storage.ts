import { Student, AttendanceRecord, HomeworkRecord } from '../types';

export const storage = {
  // Students
  getStudents: (): Student[] => {
    const students = localStorage.getItem('tuition_students');
    return students ? JSON.parse(students) : [];
  },

  setStudents: (students: Student[]): void => {
    localStorage.setItem('tuition_students', JSON.stringify(students));
  },

  // Attendance Records
  getAttendanceRecords: (): AttendanceRecord[] => {
    const records = localStorage.getItem('tuition_attendance');
    return records ? JSON.parse(records) : [];
  },

  setAttendanceRecords: (records: AttendanceRecord[]): void => {
    localStorage.setItem('tuition_attendance', JSON.stringify(records));
  },

  // Homework Records
  getHomeworkRecords: (): HomeworkRecord[] => {
    const records = localStorage.getItem('tuition_homework');
    return records ? JSON.parse(records) : [];
  },

  setHomeworkRecords: (records: HomeworkRecord[]): void => {
    localStorage.setItem('tuition_homework', JSON.stringify(records));
  },

  // Clear all data
  clearAllData: (): void => {
    localStorage.removeItem('tuition_students');
    localStorage.removeItem('tuition_attendance');
    localStorage.removeItem('tuition_homework');
  },

  // Clear data by month
  clearMonthData: (month: string): void => {
    const attendance = storage.getAttendanceRecords();
    const homework = storage.getHomeworkRecords();
    
    const filteredAttendance = attendance.filter(record => record.month !== month);
    const filteredHomework = homework.filter(record => record.month !== month);
    
    storage.setAttendanceRecords(filteredAttendance);
    storage.setHomeworkRecords(filteredHomework);
  }
};
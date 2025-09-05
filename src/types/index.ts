export interface Student {
  id: string;
  name: string;
  batch: string;
  parentPhone: string;
  class: string;
  joinDate: string;
  isActive: boolean;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  isPresent: boolean;
  month: string; // YYYY-MM format
}

export interface HomeworkRecord {
  id: string;
  studentId: string;
  date: string;
  isCompleted: boolean;
  month: string; // YYYY-MM format
}

export interface StudentStats {
  studentId: string;
  attendanceRate: number;
  homeworkRate: number;
  totalScore: number;
  rank: number;
  presentDays: number;
  totalDays: number;
  homeworkCompleted: number;
  totalHomework: number;
}
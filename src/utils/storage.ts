import { supabase } from '../supabaseClient';
import { Student, AttendanceRecord, HomeworkRecord } from '../types';

export const storage = {
  // Students
  getStudents: async (): Promise<Student[]> => {
    const { data, error } = await supabase.from('students').select('*');
    if (error) {
      console.error('Error fetching students:', error);
      return [];
    }
    return data || [];
  },

  setStudents: async (students: Student[]): Promise<void> => {
    const { error } = await supabase.from('students').upsert(students);
    if (error) {
      console.error('Error saving students:', error);
    }
  },

  // Attendance Records
  getAttendanceRecords: async (): Promise<AttendanceRecord[]> => {
    const { data, error } = await supabase.from('attendance').select('*');
    if (error) {
      console.error('Error fetching attendance records:', error);
      return [];
    }
    return data || [];
  },

  setAttendanceRecords: async (records: AttendanceRecord[]): Promise<void> => {
    const { error } = await supabase.from('attendance').upsert(records);
    if (error) {
      console.error('Error saving attendance records:', error);
    }
  },

  // Homework Records
  getHomeworkRecords: async (): Promise<HomeworkRecord[]> => {
    const { data, error } = await supabase.from('homework').select('*');
    if (error) {
      console.error('Error fetching homework records:', error);
      return [];
    }
    return data || [];
  },

  setHomeworkRecords: async (records: HomeworkRecord[]): Promise<void> => {
    const { error } = await supabase.from('homework').upsert(records);
    if (error) {
      console.error('Error saving homework records:', error);
    }
  },

  // Clear all data
  clearAllData: async (): Promise<void> => {
    await supabase.from('students').delete().match({});
    await supabase.from('attendance').delete().match({});
    await supabase.from('homework').delete().match({});
  },

  // Clear data by month
  clearMonthData: async (month: string): Promise<void> => {
    await supabase.from('attendance').delete().eq('month', month);
    await supabase.from('homework').delete().eq('month', month);
  }
};
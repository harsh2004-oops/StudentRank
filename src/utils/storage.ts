import { supabase } from '../supabaseClient';

export const storage = {
  async clearMonthData(month: string) {
    const { error: attendanceError } = await supabase
      .from('attendance')
      .delete()
      .eq('month', month);

    if (attendanceError) {
      console.error('Error clearing monthly attendance data:', attendanceError);
      throw attendanceError;
    }

    const { error: homeworkError } = await supabase
      .from('homework')
      .delete()
      .eq('month', month);

    if (homeworkError) {
      console.error('Error clearing monthly homework data:', homeworkError);
      throw homeworkError;
    }
  },

  async clearAllData() {
    // It's generally safer to delete records from tables that have foreign keys first.
    const { error: attendanceError } = await supabase
      .from('attendance')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // A way to delete all rows

    if (attendanceError) {
      console.error('Error clearing all attendance data:', attendanceError);
      throw attendanceError;
    }

    const { error: homeworkError } = await supabase
      .from('homework')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (homeworkError) {
      console.error('Error clearing all homework data:', homeworkError);
      throw homeworkError;
    }

    const { error: studentsError } = await supabase
      .from('students')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (studentsError) {
      console.error('Error clearing all students data:', studentsError);
      throw studentsError;
    }
  },
};
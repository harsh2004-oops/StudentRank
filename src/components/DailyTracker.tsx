import React, { useState, useEffect } from 'react';
import { Student, AttendanceRecord, HomeworkRecord } from '../types';
import { Calendar, Users, Send, CheckCircle, XCircle, Save, Filter } from 'lucide-react';
import { sendToWhatsApp, generateDailyMessage } from '../utils/whatsapp';

interface DailyTrackerProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  homeworkRecords: HomeworkRecord[];
  onUpdateAttendance: (records: AttendanceRecord[]) => void;
  onUpdateHomework: (records: HomeworkRecord[]) => void;
  selectedBatch: string;
  availableBatches: string[];
  onBatchChange: (batch: string) => void;
}

export const DailyTracker: React.FC<DailyTrackerProps> = ({
  students,
  attendanceRecords,
  homeworkRecords,
  onUpdateAttendance,
  onUpdateHomework,
  selectedBatch,
  availableBatches,
  onBatchChange,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyData, setDailyData] = useState<{[key: string]: { attendance: boolean; homework: boolean }}>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const data: {[key: string]: { attendance: boolean; homework: boolean }} = {};
    
    students.filter(s => s.isActive).forEach(student => {
      const attendanceRecord = attendanceRecords.find(
        r => r.studentId === student.id && r.date === selectedDate
      );
      const homeworkRecord = homeworkRecords.find(
        r => r.studentId === student.id && r.date === selectedDate
      );
      
      data[student.id] = {
        attendance: attendanceRecord?.isPresent || false,
        homework: homeworkRecord?.isCompleted || false
      };
    });
    
    setDailyData(data);
    setHasChanges(false);
  }, [selectedDate, students, attendanceRecords, homeworkRecords]);

  const handleAttendanceToggle = (studentId: string) => {
    setDailyData(prevData => ({
      ...prevData,
      [studentId]: {
        ...prevData[studentId],
        attendance: !prevData[studentId]?.attendance
      }
    }));
    setHasChanges(true);
  };

  const handleHomeworkToggle = (studentId: string) => {
    setDailyData(prevData => ({
      ...prevData,
      [studentId]: {
        ...prevData[studentId],
        homework: !prevData[studentId]?.homework
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    const month = selectedDate.slice(0, 7);
    let newAttendanceRecords: AttendanceRecord[] = [...attendanceRecords];
    let newHomeworkRecords: HomeworkRecord[] = [...homeworkRecords];

    Object.keys(dailyData).forEach(studentId => {
      const data = dailyData[studentId];
      const student = students.find(s => s.id === studentId);
      if (!student || !student.isActive) return;

      const attIndex = newAttendanceRecords.findIndex(r => r.studentId === studentId && r.date === selectedDate);
      if (attIndex > -1) {
        newAttendanceRecords[attIndex] = { ...newAttendanceRecords[attIndex], isPresent: data.attendance };
      } else {
        newAttendanceRecords.push({ id: `att_${studentId}_${selectedDate}`, studentId, date: selectedDate, isPresent: data.attendance, month });
      }

      const hwIndex = newHomeworkRecords.findIndex(r => r.studentId === studentId && r.date === selectedDate);
      if (hwIndex > -1) {
        newHomeworkRecords[hwIndex] = { ...newHomeworkRecords[hwIndex], isCompleted: data.homework };
      } else {
        newHomeworkRecords.push({ id: `hw_${studentId}_${selectedDate}`, studentId, date: selectedDate, isCompleted: data.homework, month });
      }
    });

    onUpdateAttendance(newAttendanceRecords);
    onUpdateHomework(newHomeworkRecords);
    setHasChanges(false);
  };

  const sendDailyReport = (student: Student) => {
    const studentData = dailyData[student.id] || { attendance: false, homework: false };
    const message = generateDailyMessage(
      student.name,
      selectedDate,
      studentData.attendance,
      studentData.homework
    );
    sendToWhatsApp(student.parentPhone, message);
  };

  const activeStudents = students.filter(s => s.isActive && (selectedBatch === 'all' || s.batch === selectedBatch));

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800 whitespace-nowrap">Daily Tracker</h2>
        </div>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedBatch}
              onChange={(e) => onBatchChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {availableBatches.map(batch => (
                <option key={batch} value={batch}>
                  {batch === 'all' ? 'All Batches' : batch}
                </option>
              ))}
            </select>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      {activeStudents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No active students found. Add some students to start tracking.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeStudents.map(student => {
            const studentData = dailyData[student.id] || { attendance: false, homework: false };
            
            return (
              <div
                key={student.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 w-full">
                  <h3 className="font-medium text-gray-800">{student.name}</h3>
                  <p className="text-sm text-gray-500">{student.class}</p>
                </div>

                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-6">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium text-gray-700">Attendance:</span>
                    <button
                      onClick={() => handleAttendanceToggle(student.id)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        studentData.attendance
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {studentData.attendance ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Present
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          Absent
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium text-gray-700">Homework:</span>
                    <button
                      onClick={() => handleHomeworkToggle(student.id)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        studentData.homework
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {studentData.homework ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Done
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          Not Done
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => sendDailyReport(student)}
                    className="w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    title="Send daily report to parent"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
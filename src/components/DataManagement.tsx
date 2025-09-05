import React, { useState } from 'react';
import { Student, AttendanceRecord, HomeworkRecord } from '../types';
import { Trash2, AlertTriangle, Calendar, Download, Database } from 'lucide-react';
import { storage } from '../utils/storage';
import { getAvailableMonths } from '../utils/calculations';

interface DataManagementProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  homeworkRecords: HomeworkRecord[];
  onDataUpdate: () => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({
  students,
  attendanceRecords,
  homeworkRecords,
  onDataUpdate
}) => {
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const availableMonths = getAvailableMonths(attendanceRecords, homeworkRecords);

  const handleClearMonth = (month: string) => {
    storage.clearMonthData(month);
    setShowConfirm(null);
    onDataUpdate();
  };

  const handleClearAllData = () => {
    storage.clearAllData();
    setShowConfirm(null);
    onDataUpdate();
  };

  const exportData = () => {
    const data = {
      students: students,
      attendance: attendanceRecords,
      homework: homeworkRecords,
      exportDate: new Date().toISOString(),
      exportedBy: 'Tuition Management System'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tuition-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getDataStats = () => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.isActive).length;
    const totalAttendanceRecords = attendanceRecords.length;
    const totalHomeworkRecords = homeworkRecords.length;
    
    return {
      totalStudents,
      activeStudents,
      totalAttendanceRecords,
      totalHomeworkRecords
    };
  };

  const stats = getDataStats();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
        <Database className="w-5 h-5 text-blue-600" />
        Data Management
      </h2>

      {/* Data Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
          <div className="text-sm text-blue-700">Total Students</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.activeStudents}</div>
          <div className="text-sm text-green-700">Active Students</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{stats.totalAttendanceRecords}</div>
          <div className="text-sm text-yellow-700">Attendance Records</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.totalHomeworkRecords}</div>
          <div className="text-sm text-purple-700">Homework Records</div>
        </div>
      </div>

      {/* Export Data */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-800 mb-3">Export Data</h3>
        <button
          onClick={exportData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export All Data
        </button>
        <p className="text-sm text-gray-500 mt-2">
          Download all your data as a JSON file for backup or transfer.
        </p>
      </div>

      {/* Clear Monthly Data */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-800 mb-3">Clear Monthly Data</h3>
        <p className="text-sm text-gray-600 mb-3">
          Remove old monthly records to free up storage space. This action cannot be undone.
        </p>
        
        {availableMonths.length === 0 ? (
          <p className="text-sm text-gray-500">No monthly data available to clear.</p>
        ) : (
          <div className="space-y-2">
            {availableMonths.map(month => {
              const monthName = new Date(month + '-01').toLocaleDateString('en-IN', {
                month: 'long',
                year: 'numeric'
              });
              
              const monthAttendance = attendanceRecords.filter(r => r.month === month).length;
              const monthHomework = homeworkRecords.filter(r => r.month === month).length;
              
              return (
                <div key={month} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">{monthName}</div>
                    <div className="text-sm text-gray-500">
                      {monthAttendance} attendance, {monthHomework} homework records
                    </div>
                  </div>
                  <button
                    onClick={() => setShowConfirm(`month-${month}`)}
                    className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Month
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Clear All Data */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Danger Zone
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Permanently delete all data including students, attendance, and homework records.
        </p>
        <button
          onClick={() => setShowConfirm('all')}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clear All Data
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-bold text-gray-800">Confirm Deletion</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              {showConfirm === 'all' 
                ? 'This will permanently delete ALL data including students, attendance, and homework records. This action cannot be undone.'
                : `This will permanently delete all data for ${new Date(showConfirm.replace('month-', '') + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}. This action cannot be undone.`
              }
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showConfirm === 'all') {
                    handleClearAllData();
                  } else {
                    const month = showConfirm.replace('month-', '');
                    handleClearMonth(month);
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
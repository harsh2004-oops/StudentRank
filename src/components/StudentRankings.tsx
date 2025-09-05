import React, { useState, useEffect } from 'react';
import { Student, StudentStats } from '../types';
import { Trophy, Users, Send, TrendingUp, Calendar, Filter } from 'lucide-react';
import { sendToWhatsApp, generateMonthlyMessage } from '../utils/whatsapp';

interface StudentRankingsProps {
  students: Student[];
  studentStats: StudentStats[];
  overallStudentStats: StudentStats[];
  selectedMonth: string;
  availableMonths: string[];
  onMonthChange: (month: string) => void;
  selectedBatch: string;
  availableBatches: string[];
  onBatchChange: (batch: string) => void;
  attendanceRecords: any[];
  homeworkRecords: any[];
}

export const StudentRankings: React.FC<StudentRankingsProps> = ({
  students,
  studentStats,
  overallStudentStats,
  selectedMonth,
  availableMonths,
  onMonthChange,
  selectedBatch,
  availableBatches,
  onBatchChange,
  attendanceRecords,
  homeworkRecords
}) => {
  const sendMonthlyReport = (student: Student, stats: StudentStats) => {
    const overallRank = overallStudentStats.find(s => s.studentId === student.id)?.rank || 0;
    const message = generateMonthlyMessage(
      student.name,
      selectedMonth,
      { present: stats.presentDays, total: stats.totalDays },
      { completed: stats.homeworkCompleted, total: stats.totalHomework },
      overallRank
    );
    sendToWhatsApp(student.parentPhone, message);
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600 bg-yellow-100';
    if (rank === 2) return 'text-gray-600 bg-gray-100';
    if (rank === 3) return 'text-orange-600 bg-orange-100';
    return 'text-blue-600 bg-blue-100';
  };

  const getPerformanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 bg-green-100';
    if (rate >= 75) return 'text-yellow-600 bg-yellow-100';
    if (rate >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const monthName = new Date(selectedMonth + '-01').toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Student Rankings
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedBatch}
              onChange={(e) => onBatchChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {availableBatches.map(batch => (
                <option key={batch} value={batch}>
                  {batch === 'all' ? 'All Batches' : batch}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {availableMonths.map(month => {
                const monthName = new Date(month + '-01').toLocaleDateString('en-IN', {
                  month: 'long',
                  year: 'numeric'
                });
                return (
                  <option key={month} value={month}>
                    {monthName}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {studentStats.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No data available for {monthName}</p>
          <p className="text-sm mt-2">Start tracking attendance and homework to see rankings.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {studentStats.map((stats) => {
            const student = students.find(s => s.id === stats.studentId);
            if (!student) return null;

            const overallRank = overallStudentStats.find(s => s.studentId === student.id)?.rank || 0;

            return (
              <div
                key={stats.studentId}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors space-y-4 sm:space-y-0"
              >
                <div className={`w-16 h-12 rounded-lg flex flex-col items-center justify-center font-bold text-lg ${getRankColor(overallRank)}`}>
                  <span>#{overallRank}</span>
                  <span className="text-xs font-medium">Overall</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-800">{student.name}</h3>
                    <span className="text-sm text-gray-500">({student.class} / {student.batch})</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">Attendance:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(stats.attendanceRate)}`}>
                        {Math.round(stats.attendanceRate)}% ({stats.presentDays}/{stats.totalDays})
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">Homework:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(stats.homeworkRate)}`}>
                        {Math.round(stats.homeworkRate)}% ({stats.homeworkCompleted}/{stats.totalHomework})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Batch Rank</div>
                    <div className="text-lg font-bold text-blue-600">
                      #{stats.rank}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => sendMonthlyReport(student, stats)}
                    className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    title="Send monthly report to parent"
                  >
                    <Send className="w-4 h-4" />
                    Send Report
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {studentStats.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-800">Ranking Calculation</span>
          </div>
          <p className="text-sm text-blue-700">
            Overall Score = (Attendance Rate × 60%) + (Homework Rate × 40%)
          </p>
        </div>
      )}
    </div>
  );
};
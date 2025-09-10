import { supabase } from './supabaseClient';
import React, { useState, useEffect } from 'react';
import { Student, AttendanceRecord, HomeworkRecord, StudentStats } from './types';
import { calculateStudentStats, getCurrentMonth, getAvailableMonths, calculateOverallRank } from './utils/calculations';
import { StudentForm } from './components/StudentForm';
import { StudentList } from './components/StudentList';
import { DailyTracker } from './components/DailyTracker';
import { StudentRankings } from './components/StudentRankings';
import { DataManagement } from './components/DataManagement';
import { BookOpen, Users, Calendar, Trophy, Database, BarChart3 } from 'lucide-react';

type Tab = 'dashboard' | 'students' | 'tracker' | 'rankings' | 'data';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [homeworkRecords, setHomeworkRecords] = useState<HomeworkRecord[]>([]);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data, error } = await supabase.from('students').select('*');
    if (error) {
      console.error('Error fetching students:', error);
    } else {
      setStudents(data as Student[]);
    }

    const { data: attendanceData, error: attendanceError } = await supabase.from('attendance').select('*');
    if (attendanceError) {
      console.error('Error fetching attendance:', attendanceError);
    } else {
      setAttendanceRecords(attendanceData as AttendanceRecord[]);
    }

    const { data: homeworkData, error: homeworkError } = await supabase.from('homework').select('*');
    if (homeworkError) {
      console.error('Error fetching homework:', homeworkError);
    } else {
      setHomeworkRecords(homeworkData as HomeworkRecord[]);
    }
  };

  const handleAddStudent = async (studentData: Omit<Student, 'id'>) => {
    const { data, error } = await supabase.from('students').insert([studentData]).select();
    if (error) {
      console.error('Error adding student:', error);
      return;
    }
    if (!data) {
      console.error('No data returned after adding student');
      return;
    }
    const newStudent = data[0] as Student;
    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);
    setShowStudentForm(false);
  };

  const handleEditStudent = async (studentData: Omit<Student, 'id'>) => {
    if (!editingStudent) return;

    const { data, error } = await supabase
      .from('students')
      .update(studentData)
      .match({ id: editingStudent.id })
      .select();

    if (error) {
      console.error('Error updating student:', error);
      return;
    }

    if (!data) {
      console.error('No data returned after updating student');
      return;
    }

    const updatedStudent = data[0] as Student;

    const updatedStudents = students.map(s => 
      s.id === editingStudent.id ? updatedStudent : s
    );
    setStudents(updatedStudents);
    setEditingStudent(undefined);
    setShowStudentForm(false);
  };

  const handleDeleteStudent = async (studentId: string) => {
    const { error } = await supabase.from('students').delete().match({ id: studentId });
    if (error) {
      console.error('Error deleting student:', error);
      return;
    }

    // Remove student
    const updatedStudents = students.filter(s => s.id !== studentId);
    setStudents(updatedStudents);

    // Remove related records
    const updatedAttendance = attendanceRecords.filter(r => r.studentId !== studentId);
    const updatedHomework = homeworkRecords.filter(r => r.studentId !== studentId);
    
    setAttendanceRecords(updatedAttendance);
    setHomeworkRecords(updatedHomework);
  };

  const handleUpdateAttendance = async (records: AttendanceRecord[]) => {
    const { error } = await supabase.from('attendance').upsert(records);
    if (error) {
      console.error('Error updating attendance:', error);
      return;
    }
    setAttendanceRecords(records);
  };

  const handleUpdateHomework = async (records: HomeworkRecord[]) => {
    const { error } = await supabase.from('homework').upsert(records);
    if (error) {
      console.error('Error updating homework:', error);
      return;
    }
    setHomeworkRecords(records);
  };

  // Calculate stats
  const overallStudentStats = calculateOverallRank(students, attendanceRecords, homeworkRecords, selectedMonth);
  const batchStudentStats = calculateStudentStats(students, attendanceRecords, homeworkRecords, selectedMonth, selectedBatch === 'all' ? undefined : selectedBatch);
  const availableMonths = getAvailableMonths(attendanceRecords, homeworkRecords);
  const availableBatches = ['all', ...Array.from(new Set(students.map(s => s.batch)))];
  
  // Ensure current month is in available months if there's any data
  if (availableMonths.length > 0 && !availableMonths.includes(selectedMonth)) {
    const currentMonth = getCurrentMonth();
    if (!availableMonths.includes(currentMonth)) {
      availableMonths.unshift(currentMonth);
    }
  }

  // Dashboard stats
  const totalStudents = students.filter(s => s.isActive).length;
  const todayDate = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceRecords.filter(r => r.date === todayDate);
  const presentToday = todayAttendance.filter(r => r.isPresent).length;
  const todayHomework = homeworkRecords.filter(r => r.date === todayDate);
  const homeworkDoneToday = todayHomework.filter(r => r.isCompleted).length;

  const tabs = [
    { id: 'dashboard' as const, name: 'Dashboard', icon: BarChart3 },
    { id: 'students' as const, name: 'Students', icon: Users },
    { id: 'tracker' as const, name: 'Daily Tracker', icon: Calendar },
    { id: 'rankings' as const, name: 'Rankings', icon: Trophy },
    { id: 'data' as const, name: 'Data Management', icon: Database }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tuition Manager</h1>
                <p className="text-sm text-gray-500">Attendance & Homework Tracker</p>
              </div>
            </div>
            
            <nav className="hidden sm:flex sm:space-x-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors sm:px-4 ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <div className="sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <BarChart3 className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{totalStudents}</div>
                    <div className="text-sm text-gray-500">Active Students</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{presentToday}</div>
                    <div className="text-sm text-gray-500">Present Today</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{homeworkDoneToday}</div>
                    <div className="text-sm text-gray-500">Homework Done Today</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{overallStudentStats.length}</div>
                    <div className="text-sm text-gray-500">Students Ranked</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Performers */}
            {overallStudentStats.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Top Performers This Month
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {overallStudentStats.slice(0, 3).map((stats, index) => {
                    const student = students.find(s => s.id === stats.studentId);
                    if (!student) return null;

                    const colors = [
                      'bg-yellow-100 text-yellow-800 border-yellow-200',
                      'bg-gray-100 text-gray-800 border-gray-200',
                      'bg-orange-100 text-orange-800 border-orange-200'
                    ];

                    return (
                      <div key={stats.studentId} className={`p-4 rounded-lg border-2 ${colors[index]}`}>
                        <div className="flex items-center gap-3">
                          <div className="text-2xl font-bold">#{stats.rank}</div>
                          <div className="flex-1">
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm opacity-75">{student.class}</div>
                            <div className="text-sm font-medium mt-1">
                              Score: {Math.round(stats.totalScore)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <StudentList
            students={students}
            onAdd={() => {
              setEditingStudent(undefined);
              setShowStudentForm(true);
            }}
            onEdit={(student) => {
              setEditingStudent(student);
              setShowStudentForm(true);
            }}
            onDelete={handleDeleteStudent}
            selectedBatch={selectedBatch}
            availableBatches={availableBatches}
            onBatchChange={setSelectedBatch}
          />
        )}

        {activeTab === 'tracker' && (
          <DailyTracker
            students={students}
            attendanceRecords={attendanceRecords}
            homeworkRecords={homeworkRecords}
            onUpdateAttendance={handleUpdateAttendance}
            onUpdateHomework={handleUpdateHomework}
            selectedBatch={selectedBatch}
            availableBatches={availableBatches}
            onBatchChange={setSelectedBatch}
          />
        )}

        {activeTab === 'rankings' && availableMonths.length > 0 && (
          <StudentRankings
            students={students}
            studentStats={batchStudentStats}
            overallStudentStats={overallStudentStats}
            selectedMonth={selectedMonth}
            availableMonths={availableMonths}
            onMonthChange={setSelectedMonth}
            selectedBatch={selectedBatch}
            availableBatches={availableBatches}
            onBatchChange={setSelectedBatch}
            attendanceRecords={attendanceRecords}
            homeworkRecords={homeworkRecords}
          />
        )}

        {activeTab === 'rankings' && availableMonths.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Rankings Available</h2>
            <p className="text-gray-600">Start tracking attendance and homework to see student rankings.</p>
          </div>
        )}

        {activeTab === 'data' && (
          <DataManagement
            students={students}
            attendanceRecords={attendanceRecords}
            homeworkRecords={homeworkRecords}
            onDataUpdate={loadData}
          />
        )}
      </main>

      {/* Student Form Modal */}
      {showStudentForm && (
        <StudentForm
          onSubmit={editingStudent ? handleEditStudent : handleAddStudent}
          onCancel={() => {
            setShowStudentForm(false);
            setEditingStudent(undefined);
          }}
          initialData={editingStudent}
        />
      )}
    </div>
  );
}

export default App;
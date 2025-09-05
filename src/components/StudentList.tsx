import React, { useState } from 'react';
import { Student } from '../types';
import { Users, Edit, Trash2, UserPlus, Phone, Calendar } from 'lucide-react';

interface StudentListProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (studentId: string) => void;
  onAdd: () => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  onEdit,
  onDelete,
  onAdd
}) => {
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  const handleDelete = (studentId: string) => {
    onDelete(studentId);
    setShowConfirm(null);
  };

  const activeStudents = students.filter(s => s.isActive);
  const inactiveStudents = students.filter(s => !s.isActive);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Students ({students.length})
        </h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No students registered</p>
          <p className="text-sm mb-4">Add your first student to start managing attendance and homework.</p>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add First Student
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Students */}
          {activeStudents.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-800 mb-3 text-sm uppercase tracking-wide">
                Active Students ({activeStudents.length})
              </h3>
              <div className="grid gap-3">
                {activeStudents.map(student => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-800">{student.name}</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Active
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 space-y-1">
                        <div className="flex items-center gap-4">
                          <span>Class: {student.class}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Joined: {new Date(student.joinDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          Parent: {student.parentName} ({student.parentPhone})
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(student)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit student"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowConfirm(student.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inactive Students */}
          {inactiveStudents.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-800 mb-3 text-sm uppercase tracking-wide">
                Inactive Students ({inactiveStudents.length})
              </h3>
              <div className="grid gap-3">
                {inactiveStudents.map(student => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors opacity-75"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-600">{student.name}</h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          Inactive
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 space-y-1">
                        <div className="flex items-center gap-4">
                          <span>Class: {student.class}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Joined: {new Date(student.joinDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          Parent: {student.parentName} ({student.parentPhone})
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(student)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit student"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowConfirm(student.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this student? This will also remove all their attendance and homework records. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showConfirm)}
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
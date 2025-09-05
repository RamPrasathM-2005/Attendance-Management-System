import React, { useState } from 'react';
import { Plus, BookOpen } from 'lucide-react';

const CreateSemesterForm = ({ showCreateForm, setShowCreateForm, onCreateSemester, departments }) => {
  const [formData, setFormData] = useState({ batch: '', department: '', semester: '' });

  const handleSubmit = () => {
    if (!formData.batch || !formData.department || !formData.semester) {
      alert('Please fill all fields');
      return;
    }
    onCreateSemester({
      ...formData,
      semester: parseInt(formData.semester),
      totalCourses: 0,
      totalStudents: 0,
      createdAt: new Date().toISOString().split('T')[0]
    });
    setFormData({ batch: '', department: '', semester: '' });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create New Semester
        </h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Manage Courses
        </button>
      </div>

      {!showCreateForm ? (
        <div className="text-center py-8">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Add New Semester</h3>
          <p className="text-gray-600 mb-6">Create a new semester for a specific batch and department</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create Semester
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input
              type="text"
              placeholder="Batch (e.g., 2025-2029)"
              value={formData.batch}
              onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <select
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Select Semester</option>
              {[1,2,3,4,5,6,7,8].map((sem) => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4">
            <button onClick={handleSubmit} className="px-6 py-3 bg-blue-600 text-white rounded-lg">Create</button>
            <button onClick={() => setShowCreateForm(false)} className="px-6 py-3 bg-gray-200 rounded-lg">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateSemesterForm;

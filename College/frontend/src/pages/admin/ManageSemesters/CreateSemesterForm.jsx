import React, { useState } from "react";
import { Plus } from "lucide-react";

const CreateSemesterForm = ({
  showCreateForm,
  setShowCreateForm,
  onCreateSemester,
  departments,
}) => {
  const [formData, setFormData] = useState({
    batchId: "",
    department: "",
    semesterNumber: "",
    startDate: "",
    endDate: "",
    createdBy: "admin",
    updatedBy: "admin",
  });

  const handleSubmit = () => {
    if (
      !formData.batchId ||
      !formData.department ||
      !formData.semesterNumber ||
      !formData.startDate ||
      !formData.endDate
    ) {
      alert("Please fill all fields");
      return;
    }

    onCreateSemester({
      ...formData,
      semesterNumber: parseInt(formData.semesterNumber),
    });

    setFormData({
      batchId: "",
      department: "",
      semesterNumber: "",
      startDate: "",
      endDate: "",
      createdBy: "admin",
      updatedBy: "admin",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
      {!showCreateForm ? (
        <div className="text-center py-8">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Add New Semester
          </h3>
          <p className="text-gray-600 mb-6">
            Create a new semester for a specific batch and department
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create Semester
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="number"
              placeholder="Batch ID (from DB)"
              value={formData.batchId}
              onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />

            <select
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <select
              value={formData.semesterNumber}
              onChange={(e) =>
                setFormData({ ...formData, semesterNumber: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Select Semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />

            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg"
            >
              Create
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-6 py-3 bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateSemesterForm;

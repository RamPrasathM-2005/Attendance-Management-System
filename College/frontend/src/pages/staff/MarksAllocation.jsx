// src/pages/staff/MarksAllocation.jsx
// src/pages/staff/MarksAllocation.jsx
import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Plus, Edit, Trash2, X, ChevronDown, ChevronUp } from "lucide-react";
import Swal from "sweetalert2"; // Correct line
import withReactContent from "sweetalert2-react-content";


const MySwal = withReactContent(Swal);

const MarkAllocation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId } = useParams();

  // Get course from location state or fallback to default
  const course = location.state?.course ?? {
    id: courseId,
    name: courseId || "Untitled Course",
    semester: "2025 - 2026 ODD SEMESTER",
  };

  // State for course outcomes, students, and modals
  const [courseOutcomes, setCourseOutcomes] = useState([
    { id: 1, name: "CO1", description: "Understanding basic concepts", weightage: 25, tools: [] },
    { id: 2, name: "CO2", description: "Application of principles", weightage: 30, tools: [] },
    { id: 3, name: "CO3", description: "Analysis and evaluation", weightage: 25, tools: [] },
    { id: 4, name: "CO4", description: "Design and implementation", weightage: 20, tools: [] },
  ]);

  const [students] = useState([
    { id: 1, name: "Ram Prasath M", rollNo: "2312063" },
    { id: 2, name: "Joel A", rollNo: "2312053" },
    { id: 3, name: "Saravankumar", rollNo: "2312061" },
    { id: 4, name: "Praveen kumar S", rollNo: "2312077" },
    { id: 5, name: "Balakrishna T", rollNo: "2312078" },
    { id: 6, name: "Mydeen Haan H", rollNo: "2312080" },
  ]);

  const [selectedCO, setSelectedCO] = useState(null);
  const [showCOModal, setShowCOModal] = useState(false);
  const [showToolModal, setShowToolModal] = useState(false);
  const [editingCO, setEditingCO] = useState(null);
  const [editingTool, setEditingTool] = useState(null);
  const [newCO, setNewCO] = useState({ name: "", description: "", weightage: 0 });
  const [newTool, setNewTool] = useState({ name: "", type: "quiz", maxMarks: 0, weightage: 0 });

  // State for collapsible sections
  const [collapsed, setCollapsed] = useState({});

  // ------------------- Utility Functions -------------------
  const toggleCollapse = (coId) => {
    setCollapsed(prev => ({
      ...prev,
      [coId]: !prev[coId]
    }));
  };

  const calculateCOMarks = (co, studentId) => {
    if (!co.tools.length) return 0;
    let totalScore = 0;
    let totalWeightage = 0;
    co.tools.forEach((tool) => {
      const studentMark = tool.marks?.[studentId] || 0;
      totalScore += (studentMark / (tool.maxMarks || 1)) * tool.weightage;
      totalWeightage += tool.weightage;
    });
    return totalWeightage ? Math.round((totalScore / totalWeightage) * 100) : 0;
  };

  const calculateInternalMarks = (studentId) => {
    let totalWeightedScore = 0;
    let totalWeightage = 0;
    courseOutcomes.forEach((co) => {
      if (co.tools.length) {
        const coScore = calculateCOMarks(co, studentId);
        totalWeightedScore += (coScore / 100) * co.weightage;
        totalWeightage += co.weightage;
      }
    });
    return totalWeightage ? Math.round((totalWeightedScore / totalWeightage) * 100) : 0;
  };

  const handleSaveCO = () => {
    // Validation
    if (!newCO.name.trim() || newCO.weightage < 0 || newCO.weightage > 100) {
      alert("Please provide a valid CO name and weightage (0-100).");
      return;
    }

    const totalWeightage = courseOutcomes.reduce((sum, co) => sum + (co.id === editingCO?.id ? 0 : co.weightage), 0) + newCO.weightage;
    if (totalWeightage > 100) {
      alert(`Total CO weightage cannot exceed 100%. Current total: ${totalWeightage}%`);
      return;
    }

    if (editingCO) {
      setCourseOutcomes((cos) =>
        cos.map((co) => (co.id === editingCO.id ? { ...co, ...newCO } : co))
      );
    } else {
      const newId = courseOutcomes.length > 0 ? Math.max(...courseOutcomes.map((co) => co.id)) + 1 : 1;
      setCourseOutcomes([...courseOutcomes, { ...newCO, id: newId, tools: [] }]);
    }
    setShowCOModal(false);
    setEditingCO(null);
    setNewCO({ name: "", description: "", weightage: 0 });
  };

  const handleSaveTool = () => {
    // Validation
    if (!newTool.name.trim() || newTool.maxMarks <= 0 || newTool.weightage < 0 || newTool.weightage > 100) {
      alert("Please provide a valid tool name, maximum marks (>0), and weightage (0-100).");
      return;
    }

    const totalToolWeightage = selectedCO.tools.reduce(
      (sum, t) => sum + (t.id === editingTool?.id ? 0 : t.weightage),
      0
    ) + newTool.weightage;
    if (totalToolWeightage > 100) {
      alert(`Total tool weightage for this CO cannot exceed 100%. Current total: ${totalToolWeightage}%`);
      return;
    }

    const toolToSave = {
      ...newTool,
      id: editingTool ? editingTool.id : Date.now(),
      marks: editingTool ? editingTool.marks : {},
    };
    setCourseOutcomes((cos) =>
      cos.map((co) =>
        co.id === selectedCO.id
          ? {
              ...co,
              tools: editingTool
                ? co.tools.map((t) => (t.id === editingTool.id ? toolToSave : t))
                : [...co.tools, toolToSave],
            }
          : co
      )
    );
    setShowToolModal(false);
    setEditingTool(null);
    setNewTool({ name: "", type: "quiz", maxMarks: 0, weightage: 0 });
  };

  const updateStudentMark = (coId, toolId, studentId, marks) => {
    const parsedMarks = parseFloat(marks);
    if (isNaN(parsedMarks) || parsedMarks < 0) return; // Prevent negative or invalid marks
    const tool = courseOutcomes.find((co) => co.id === coId)?.tools.find((t) => t.id === toolId);
    if (tool && parsedMarks > tool.maxMarks) return; // Prevent marks exceeding maxMarks

    setCourseOutcomes((cos) =>
      cos.map((co) =>
        co.id === coId
          ? {
              ...co,
              tools: co.tools.map((tool) =>
                tool.id === toolId
                  ? {
                      ...tool,
                      marks: { ...tool.marks, [studentId]: parsedMarks },
                    }
                  : tool
              ),
            }
          : co
      )
    );
  };

  const deleteCO = (coId) => {
    if (window.confirm("Are you sure you want to delete this Course Outcome?")) {
      setCourseOutcomes((cos) => cos.filter((co) => co.id !== coId));
    }
  };

  const deleteTool = (coId, toolId) => {
    if (window.confirm("Are you sure you want to delete this tool?")) {
      setCourseOutcomes((cos) =>
        cos.map((co) =>
          co.id === coId ? { ...co, tools: co.tools.filter((tool) => tool.id !== toolId) } : co
        )
      );
    }
  };

  const handleSaveToDatabase = async () => {
    try {
      // In a real application, you would send this data to your backend API.
      // Example using fetch:
      // const response = await fetch('/api/save-marks', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ courseId, marks: courseOutcomes }),
      // });
      //
      // if (!response.ok) {
      //   throw new Error('Failed to save marks');
      // }

      // For this example, we'll simulate a successful save
      await new Promise(resolve => setTimeout(resolve, 1000));

      MySwal.fire({
        icon: 'success',
        title: 'Marks Saved!',
        text: 'The marks have been successfully stored.',
        customClass: {
          confirmButton: 'bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded',
        },
        buttonsStyling: false,
      });
    } catch (error) {
      MySwal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong while saving marks. Please try again.',
        customClass: {
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded',
        },
        buttonsStyling: false,
      }, error);
    }
  };

  // ------------------- Render -------------------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Mark Allocation</h1>
                <p className="text-sm text-gray-500">{course.name}</p>
              </div>
            </div>
            <button
              onClick={() => setShowCOModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Course Outcome
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Outcomes */}
        <div className="space-y-6">
          {courseOutcomes.map((co) => (
            <div key={co.id} className="bg-white rounded-lg shadow-md">
              {/* CO Header */}
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{co.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{co.description}</p>
                  <p className="text-sm text-blue-600 mt-2">Weightage: {co.weightage}%</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleCollapse(co.id)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                    title={collapsed[co.id] ? "Expand" : "Collapse"}
                  >
                    {collapsed[co.id] ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCO(co);
                      setShowToolModal(true);
                    }}
                    className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-sm flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Tool
                  </button>
                  <button
                    onClick={() => {
                      setEditingCO(co);
                      setNewCO({
                        name: co.name,
                        description: co.description,
                        weightage: co.weightage,
                      });
                      setShowCOModal(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteCO(co.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Tools & Marks */}
              {!collapsed[co.id] && co.tools.length > 0 && (
                <div className="p-6 space-y-4">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Assessment Tools</h4>
                  {co.tools.map((tool) => (
                    <div key={tool.id} className="border border-gray-200 rounded-lg">
                      <div className="p-4 bg-gray-50 flex justify-between items-center border-b border-gray-200">
                        <div>
                          <h5 className="font-medium text-gray-900">{tool.name}</h5>
                          <p className="text-sm text-gray-600">
                            Type: {tool.type} | Max Marks: {tool.maxMarks} | Weightage: {tool.weightage}%
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedCO(co);
                              setEditingTool(tool);
                              setNewTool({
                                name: tool.name,
                                type: tool.type,
                                maxMarks: tool.maxMarks,
                                weightage: tool.weightage,
                              });
                              setShowToolModal(true);
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteTool(co.id, tool.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Student Marks */}
                      <div className="p-4 overflow-x-auto">
                        <table className="min-w-full text-sm text-gray-900">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-2">Roll No</th>
                              <th className="text-left py-2">Student Name</th>
                              <th className="text-left py-2">Marks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {students.map((student) => (
                              <tr key={student.id} className="border-b border-gray-100">
                                <td className="py-2">{student.rollNo}</td>
                                <td className="py-2">{student.name}</td>
                                <td className="py-2">
                                  <input
                                    type="number"
                                    min="0"
                                    max={tool.maxMarks}
                                    value={tool.marks?.[student.id] || ""}
                                    onChange={(e) =>
                                      updateStudentMark(co.id, tool.id, student.id, e.target.value)
                                    }
                                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                  <span className="text-xs text-gray-500 ml-2">/ {tool.maxMarks}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Table */}
        {courseOutcomes.some((co) => co.tools.length > 0) && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Marks Summary</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-900">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3">Roll No</th>
                    <th className="text-left py-3">Student Name</th>
                    {courseOutcomes.map((co) => (
                      <th key={co.id} className="text-center py-3">
                        {co.name}
                        <br />
                        <span className="text-xs text-gray-500">({co.weightage}%)</span>
                      </th>
                    ))}
                    <th className="text-center py-3">Internal Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b border-gray-100">
                      <td className="py-3">{student.rollNo}</td>
                      <td className="py-3">{student.name}</td>
                      {courseOutcomes.map((co) => (
                        <td key={co.id} className="text-center py-3">
                          {calculateCOMarks(co, student.id)}
                        </td>
                      ))}
                      <td className="text-center py-3 font-medium text-blue-600">
                        {calculateInternalMarks(student.id)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Save to Database Button */}
        <div className="flex justify-end mt-8">
          <button
            onClick={handleSaveToDatabase}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md shadow-lg hover:bg-blue-700 transition-colors"
          >
            Save Marks to Database
          </button>
        </div>
      </div>

      {/* CO Modal */}
      {showCOModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingCO ? "Edit Course Outcome" : "Add Course Outcome"}
                </h3>
                <button
                  onClick={() => {
                    setShowCOModal(false);
                    setEditingCO(null);
                    setNewCO({ name: "", description: "", weightage: 0 });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newCO.name}
                    onChange={(e) => setNewCO({ ...newCO, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., CO1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newCO.description}
                    onChange={(e) => setNewCO({ ...newCO, description: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the course outcome..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weightage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newCO.weightage}
                    onChange={(e) => setNewCO({ ...newCO, weightage: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="25"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCOModal(false);
                    setEditingCO(null);
                    setNewCO({ name: "", description: "", weightage: 0 });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCO}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {editingCO ? "Update" : "Add"} Course Outcome
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tool Modal */}
      {showToolModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingTool ? "Edit Tool" : "Add Tool"} - {selectedCO?.name}
                </h3>
                <button
                  onClick={() => {
                    setShowToolModal(false);
                    setEditingTool(null);
                    setNewTool({ name: "", type: "quiz", maxMarks: 0, weightage: 0 });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tool Name</label>
                  <input
                    type="text"
                    value={newTool.name}
                    onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Quiz 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newTool.type}
                    onChange={(e) => setNewTool({ ...newTool, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="quiz">Quiz</option>
                    <option value="assignment">Assignment</option>
                    <option value="presentation">Presentation</option>
                    <option value="project">Project</option>
                    <option value="exam">Exam</option>
                    <option value="lab">Lab Work</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Marks</label>
                  <input
                    type="number"
                    min="1"
                    value={newTool.maxMarks}
                    onChange={(e) => setNewTool({ ...newTool, maxMarks: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weightage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newTool.weightage}
                    onChange={(e) => setNewTool({ ...newTool, weightage: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="30"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowToolModal(false);
                    setEditingTool(null);
                    setNewTool({ name: "", type: "quiz", maxMarks: 0, weightage: 0 });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTool}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {editingTool ? "Update" : "Add"} Tool
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkAllocation;
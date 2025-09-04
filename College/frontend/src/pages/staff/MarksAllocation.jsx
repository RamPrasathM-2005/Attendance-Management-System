import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Plus, ChevronDown, ChevronUp, Edit, Trash2 } from "lucide-react";
import useMarkAllocation from "../../hooks/useMarkAllocation";
import COModal from "../../components/modals/COModal";
import ToolModal from "../../components/modals/ToolModal";
import StudentMarksTable from "../../components/tables/StudentMarksTable";
import MarksSummary from "../../components/tables/MarksSummary";

const MarkAllocation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId } = useParams();

  const course = location.state?.course ?? {
    id: courseId,
    name: courseId || "Untitled Course",
    semester: "2025 - 2026 ODD SEMESTER",
  };

  const {
    courseOutcomes,
    students,
    selectedCO,
    showCOModal,
    showToolModal,
    editingCO,
    editingTool,
    newCO,
    newTool,
    collapsed,
    toggleCollapse,
    calculateCOMarks,
    calculateInternalMarks,
    handleSaveCO,
    handleSaveTool,
    updateStudentMark,
    deleteCO,
    deleteTool,
    handleSaveToDatabase,
    setShowCOModal,
    setEditingCO,
    setNewCO,
    setSelectedCO,
    setShowToolModal,
    setEditingTool,
    setNewTool,
  } = useMarkAllocation(course);

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
        <div className="space-y-6">
          {courseOutcomes.map((co) => (
            <div key={co.id} className="bg-white rounded-lg shadow-md">
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
                      <StudentMarksTable
                        coId={co.id}
                        tool={tool}
                        students={students}
                        updateStudentMark={updateStudentMark}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <MarksSummary
          courseOutcomes={courseOutcomes}
          students={students}
          calculateCOMarks={calculateCOMarks}
          calculateInternalMarks={calculateInternalMarks}
        />
        <div className="flex justify-end mt-8">
          <button
            onClick={handleSaveToDatabase}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md shadow-lg hover:bg-blue-700 transition-colors"
          >
            Save Marks to Database
          </button>
        </div>
      </div>

      <COModal
        show={showCOModal}
        newCO={newCO}
        setNewCO={setNewCO}
        editingCO={editingCO}
        handleSaveCO={handleSaveCO}
        onClose={() => {
          setShowCOModal(false);
          setEditingCO(null);
          setNewCO({ name: "", description: "", weightage: 0 });
        }}
      />

      <ToolModal
        show={showToolModal}
        newTool={newTool}
        setNewTool={setNewTool}
        editingTool={editingTool}
        selectedCO={selectedCO}
        handleSaveTool={handleSaveTool}
        onClose={() => {
          setShowToolModal(false);
          setEditingTool(null);
          setNewTool({ name: "", type: "quiz", maxMarks: 0, weightage: 0 });
        }}
      />
    </div>
  );
};

export default MarkAllocation;

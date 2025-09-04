import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Plus, ChevronDown, ChevronUp, Edit, Trash2, Download } from "lucide-react";
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
    name: courseId || "CS101 - Introduction to Programming",
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
    coCollapsed,
    toolCollapsed,
    toggleCoCollapse,
    toggleToolCollapse,
    calculateCOMarks,
    calculateInternalMarks,
    handleSaveCOs,
    handleSaveStudentMarks,
    handleSaveToolMarks,
    handleSaveCO,
    handleSaveTool,
    updateStudentMark,
    exportCoWiseCsv,
    exportCourseWiseCsv,
    deleteCO,
    deleteTool,
    setShowCOModal,
    setEditingCO,
    setNewCO,
    setSelectedCO,
    setShowToolModal,
    setEditingTool,
    setNewTool,
  } = useMarkAllocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between py-6 gap-3">
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
            <div className="flex flex-wrap items-center space-x-2">
              <button
                onClick={() => setShowCOModal(true)}
                className="bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md hover:bg-blue-700 flex items-center text-sm"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Course Outcome
              </button>
              <button
                onClick={handleSaveCOs}
                className="bg-green-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md hover:bg-green-700 flex items-center text-sm"
              >
                Save COs & Tools
              </button>
            </div>
          </div>
        </div>
      </div>



      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {courseOutcomes.map((co) => (
            <div key={co.coId} className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{co.coNumber}</h3>
                  <p className="text-sm text-gray-600 mt-1">Course Code: {co.courseCode}</p>
                  <p className="text-sm text-blue-600 mt-2">Weightage: {co.weightage}%</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleCoCollapse(co.coId)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                    title={coCollapsed[co.coId] ? "Expand" : "Collapse"}
                  >
                    {coCollapsed[co.coId] ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
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
                        coNumber: co.coNumber,
                        weightage: co.weightage,
                      });
                      setShowCOModal(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteCO(co.coId)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {!coCollapsed[co.coId] && co.tools.length > 0 && (
                <div className="p-6 space-y-4">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Assessment Tools</h4>
                  {co.tools.map((tool) => (
                    <div key={tool.toolId} className="border border-gray-200 rounded-lg">
                      <div className="p-4 bg-gray-50 flex justify-between items-center border-b border-gray-200">
                        <div>
                          <h5 className="font-medium text-gray-900">{tool.toolName}</h5>
                          <p className="text-sm text-gray-600">
                            Max Marks: {tool.maxMarks} | Weightage: {tool.weightage}%
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleToolCollapse(tool.toolId)}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                            title={toolCollapsed[tool.toolId] ? "Expand" : "Collapse"}
                          >
                            {toolCollapsed[tool.toolId] ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCO(co);
                              setEditingTool(tool);
                              setNewTool({
                                toolName: tool.toolName,
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
                            onClick={() => deleteTool(co.coId, tool.toolId)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {!toolCollapsed[tool.toolId] && (
                        <>
                          <StudentMarksTable
                            coId={co.coId}
                            tool={tool}
                            students={students}
                            updateStudentMark={updateStudentMark}
                          />
                          <div className="flex justify-end p-4 border-t border-gray-200">
                            <button
                              onClick={() => handleSaveToolMarks(co.coId, tool.toolId)}
                              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                              Save Marks for this Tool
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  <div className="flex justify-between items-center mt-6">
                    <button
                      onClick={() => exportCoWiseCsv(co.coId)}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                    >
                      <Download className="h-4 w-4 mr-1" /> Export {co.coNumber} Marks
                    </button>
                  </div>
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
        <div className="flex justify-end mt-8 space-x-4">
          <button
            onClick={exportCourseWiseCsv}
            className="px-6 py-2 bg-purple-600 text-white font-medium rounded-md shadow-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" /> Export Course Summary
          </button>
          <button
            onClick={handleSaveStudentMarks}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md shadow-lg hover:bg-blue-700 transition-colors"
          >
            Save All Student Marks
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
          setNewCO({ coNumber: "", weightage: 0 });
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
          setNewTool({ toolName: "", maxMarks: 0, weightage: 0 });
        }}
      />
    </div>
  );
};

export default MarkAllocation;
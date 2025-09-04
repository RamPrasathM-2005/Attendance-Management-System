import { useState, useCallback } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const useMarkAllocation = (course, initialStudents = []) => {
  // ------------------- State -------------------
  const [courseOutcomes, setCourseOutcomes] = useState([
    { id: 1, name: "CO1", description: "Understanding basic concepts", weightage: 25, tools: [] },
    { id: 2, name: "CO2", description: "Application of principles", weightage: 30, tools: [] },
    { id: 3, name: "CO3", description: "Analysis and evaluation", weightage: 25, tools: [] },
    { id: 4, name: "CO4", description: "Design and implementation", weightage: 20, tools: [] },
  ]);

  const [students] = useState(
    initialStudents.length > 0
      ? initialStudents
      : [
          { id: 1, name: "Ram Prasath M", rollNo: "2312063" },
          { id: 2, name: "Joel A", rollNo: "2312053" },
          { id: 3, name: "Saravankumar", rollNo: "2312061" },
          { id: 4, name: "Praveen kumar S", rollNo: "2312077" },
          { id: 5, name: "Balakrishna T", rollNo: "2312078" },
          { id: 6, name: "Mydeen Haan H", rollNo: "2312080" },
        ]
  );

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
    setCollapsed((prev) => ({
      ...prev,
      [coId]: !prev[coId],
    }));
  };

  const calculateCOMarks = useCallback((co, studentId) => {
    if (!co.tools.length) return 0;
    let totalScore = 0;
    let totalWeightage = 0;
    co.tools.forEach((tool) => {
      const studentMark = tool.marks?.[studentId] || 0;
      totalScore += (studentMark / (tool.maxMarks || 1)) * tool.weightage;
      totalWeightage += tool.weightage;
    });
    return totalWeightage ? Math.round((totalScore / totalWeightage) * 100) : 0;
  }, []);

  const calculateInternalMarks = useCallback(
    (studentId) => {
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
    },
    [courseOutcomes, calculateCOMarks]
  );

  // ------------------- Validation -------------------
  const validateCO = (co, editingId = null) => {
    if (!co.name.trim() || co.weightage < 0 || co.weightage > 100) {
      return "Please provide a valid CO name and weightage (0-100).";
    }
    const totalWeightage =
      courseOutcomes.reduce((sum, c) => sum + (c.id === editingId ? 0 : c.weightage), 0) + co.weightage;
    if (totalWeightage > 100) {
      return `Total CO weightage cannot exceed 100%. Current total: ${totalWeightage}%`;
    }
    return null;
  };

  const validateTool = (tool, selectedCO, editingId = null) => {
    if (!tool.name.trim() || tool.maxMarks <= 0 || tool.weightage < 0 || tool.weightage > 100) {
      return "Please provide a valid tool name, maximum marks (>0), and weightage (0-100).";
    }
    const totalToolWeightage =
      selectedCO.tools.reduce((sum, t) => sum + (t.id === editingId ? 0 : t.weightage), 0) + tool.weightage;
    if (totalToolWeightage > 100) {
      return `Total tool weightage for this CO cannot exceed 100%. Current total: ${totalToolWeightage}%`;
    }
    return null;
  };

  // ------------------- Handlers -------------------
  const handleSaveCO = () => {
    const errorMsg = validateCO(newCO, editingCO?.id);
    if (errorMsg) {
      MySwal.fire({ icon: "error", title: "Invalid Input", text: errorMsg });
      return;
    }

    if (editingCO) {
      setCourseOutcomes((cos) => cos.map((co) => (co.id === editingCO.id ? { ...co, ...newCO } : co)));
    } else {
      const newId = courseOutcomes.length > 0 ? Math.max(...courseOutcomes.map((co) => co.id)) + 1 : 1;
      setCourseOutcomes([...courseOutcomes, { ...newCO, id: newId, tools: [] }]);
    }

    setShowCOModal(false);
    setEditingCO(null);
    setNewCO({ name: "", description: "", weightage: 0 });
  };

  const handleSaveTool = () => {
    const errorMsg = validateTool(newTool, selectedCO, editingTool?.id);
    if (errorMsg) {
      MySwal.fire({ icon: "error", title: "Invalid Input", text: errorMsg });
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
    if (isNaN(parsedMarks) || parsedMarks < 0) return; // Prevent invalid marks
    const tool = courseOutcomes.find((co) => co.id === coId)?.tools.find((t) => t.id === toolId);
    if (tool && parsedMarks > tool.maxMarks) return; // Prevent exceeding maxMarks

    setCourseOutcomes((cos) =>
      cos.map((co) =>
        co.id === coId
          ? {
              ...co,
              tools: co.tools.map((tool) =>
                tool.id === toolId ? { ...tool, marks: { ...tool.marks, [studentId]: parsedMarks } } : tool
              ),
            }
          : co
      )
    );
  };

  const deleteCO = async (coId) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "This CO will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton: "bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded",
        cancelButton: "bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded",
      },
      buttonsStyling: false,
    });

    if (result.isConfirmed) {
      setCourseOutcomes((cos) => cos.filter((co) => co.id !== coId));
    }
  };

  const deleteTool = async (coId, toolId) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "This tool will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton: "bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded",
        cancelButton: "bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded",
      },
      buttonsStyling: false,
    });

    if (result.isConfirmed) {
      setCourseOutcomes((cos) =>
        cos.map((co) =>
          co.id === coId ? { ...co, tools: co.tools.filter((tool) => tool.id !== toolId) } : co
        )
      );
    }
  };

  const handleSaveToDatabase = async () => {
    try {
      // Fake API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      MySwal.fire({
        icon: "success",
        title: "Marks Saved!",
        text: "The marks have been successfully stored.",
        customClass: {
          confirmButton: "bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded",
        },
        buttonsStyling: false,
      });
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Oops...",
        text: error?.message || "Something went wrong while saving marks. Please try again.",
        customClass: {
          confirmButton: "bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded",
        },
        buttonsStyling: false,
      });
    }
  };

  // ------------------- Return API -------------------
  return {
    courseOutcomes,
    setCourseOutcomes,
    students,
    selectedCO,
    setSelectedCO,
    showCOModal,
    setShowCOModal,
    showToolModal,
    setShowToolModal,
    editingCO,
    setEditingCO,
    editingTool,
    setEditingTool,
    newCO,
    setNewCO,
    newTool,
    setNewTool,
    collapsed,
    setCollapsed,
    toggleCollapse,
    calculateCOMarks,
    calculateInternalMarks,
    handleSaveCO,
    handleSaveTool,
    updateStudentMark,
    deleteCO,
    deleteTool,
    handleSaveToDatabase,
  };
};

export default useMarkAllocation;

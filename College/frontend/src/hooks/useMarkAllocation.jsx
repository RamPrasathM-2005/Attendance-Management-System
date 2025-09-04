import { useState, useCallback } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

// Mock data based on your DB schema.
const initialCourseOutcomes = [
  { 
    coId: 1, 
    courseCode: "CS101", 
    coNumber: "CO1", 
    weightage: 25, 
    tools: [
      { toolId: 101, coId: 1, toolName: "Quiz 1", maxMarks: 20, weightage: 10, marks: {} },
      { toolId: 102, coId: 1, toolName: "Assignment 1", maxMarks: 50, weightage: 15, marks: {} },
    ] 
  },
  { 
    coId: 2, 
    courseCode: "CS101", 
    coNumber: "CO2", 
    weightage: 30, 
    tools: [
      { toolId: 201, coId: 2, toolName: "Midterm Exam", maxMarks: 100, weightage: 30, marks: {} },
    ] 
  },
  { 
    coId: 3, 
    courseCode: "CS101", 
    coNumber: "CO3", 
    weightage: 25, 
    tools: [] 
  },
  { 
    coId: 4, 
    courseCode: "CS101", 
    coNumber: "CO4", 
    weightage: 20, 
    tools: [] 
  },
];

const initialStudents = [
  { rollnumber: "2312063", name: "Ram Prasath M", studentId: 1 },
  { rollnumber: "2312053", name: "Joel A", studentId: 2 },
  { rollnumber: "2312061", name: "Saravankumar", studentId: 3 },
  { rollnumber: "2312077", name: "Praveen kumar S", studentId: 4 },
  { rollnumber: "2312078", name: "Balakrishna T", studentId: 5 },
  { rollnumber: "2312080", name: "Mydeen Haan H", studentId: 6 },
];

const useMarkAllocation = () => {
  const [courseOutcomes, setCourseOutcomes] = useState(initialCourseOutcomes);
  const [students] = useState(initialStudents);

  const [selectedCO, setSelectedCO] = useState(null);
  const [showCOModal, setShowCOModal] = useState(false);
  const [showToolModal, setShowToolModal] = useState(false);
  const [editingCO, setEditingCO] = useState(null);
  const [editingTool, setEditingTool] = useState(null);
  const [newCO, setNewCO] = useState({ coNumber: "", weightage: 0 });
  const [newTool, setNewTool] = useState({ toolName: "", maxMarks: 0, weightage: 0 });
  
  // States for collapse options
  const [coCollapsed, setCoCollapsed] = useState({});
  const [toolCollapsed, setToolCollapsed] = useState({});

  const toggleCoCollapse = (coId) => {
    setCoCollapsed((prev) => ({ ...prev, [coId]: !prev[coId] }));
  };
  
  const toggleToolCollapse = (toolId) => {
    setToolCollapsed((prev) => ({ ...prev, [toolId]: !prev[toolId] }));
  };

  const calculateCOMarks = useCallback((co, studentRollNumber) => {
    const totalCOWeightage = co.weightage;
    if (!co.tools.length || totalCOWeightage === 0) return 0;
    
    let totalScore = 0;
    co.tools.forEach((tool) => {
      const studentMark = tool.marks?.[studentRollNumber] || 0;
      totalScore += (studentMark / (tool.maxMarks || 1)) * tool.weightage;
    });
    
    return Math.round(totalScore);
  }, []);

  const calculateInternalMarks = useCallback((studentRollNumber) => {
    let totalInternalMarks = 0;
    let totalCourseWeightage = 0;
    
    courseOutcomes.forEach((co) => {
      const coScore = calculateCOMarks(co, studentRollNumber);
      totalInternalMarks += coScore;
      totalCourseWeightage += co.weightage;
    });
    
    if (totalCourseWeightage > 0) {
      return Math.round((totalInternalMarks / totalCourseWeightage) * 100);
    }
    
    return 0;
  }, [courseOutcomes, calculateCOMarks]);

  const validateCO = (co, editingId = null) => {
    if (!co.coNumber.trim() || co.weightage < 0 || co.weightage > 100) {
      return "Please provide a valid CO number and weightage (0-100).";
    }
    const totalCourseWeightage =
      courseOutcomes.reduce((sum, c) => sum + (c.coId === editingId ? 0 : c.weightage), 0) + co.weightage;
    if (totalCourseWeightage > 100) {
      return `Total CO weightage cannot exceed 100%. Current total: ${totalCourseWeightage}%`;
    }
    return null;
  };

  const validateTool = (tool, selectedCO, editingId = null) => {
    if (!tool.toolName.trim() || tool.maxMarks <= 0 || tool.weightage < 0 || tool.weightage > selectedCO.weightage) {
      return `Please provide a valid tool name, max marks (>0), and a weightage between 0 and ${selectedCO.weightage}.`;
    }
    const totalToolWeightage =
      selectedCO.tools.reduce((sum, t) => sum + (t.toolId === editingId ? 0 : t.weightage), 0) + tool.weightage;
    if (totalToolWeightage > selectedCO.weightage) {
      return `Total tool weightage for this CO cannot exceed ${selectedCO.weightage}%. Current total: ${totalToolWeightage}%`;
    }
    return null;
  };

  const handleSaveCOs = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      MySwal.fire("Saved!", "All Course Outcomes and tools have been saved.", "success");
    } catch (error) {
      MySwal.fire("Error!", "Failed to save Course Outcomes and tools.", error);
    }
  };

  const handleSaveStudentMarks = async () => {
    try {
      const allStudentMarks = courseOutcomes.flatMap(co => 
        co.tools.flatMap(tool =>
          students.map(student => ({
            rollnumber: student.rollnumber,
            toolId: tool.toolId,
            marksObtained: tool.marks[student.rollnumber] || 0
          }))
        )
      );

      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Saving all student marks:", allStudentMarks);
      MySwal.fire("Saved!", "All student marks have been saved.", "success");
    } catch (error) {
      MySwal.fire("Error!", "Failed to save student marks.", error);
    }
  };

  const handleSaveToolMarks = async (coId, toolId) => {
    try {
      const co = courseOutcomes.find(c => c.coId === coId);
      const tool = co?.tools.find(t => t.toolId === toolId);
      if (!tool) return;

      const marksToSave = students.map(student => ({
        rollnumber: student.rollnumber,
        toolId: tool.toolId,
        marksObtained: tool.marks[student.rollnumber] || 0
      }));

      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Saving marks for tool ${toolId}:`, marksToSave);
      MySwal.fire("Saved!", "Marks for the assessment tool have been saved.", "success");
    } catch (error) {
      MySwal.fire("Error!", "Failed to save marks for the tool.", error);
    }
  };
  
  const handleSaveCO = async () => {
    const errorMsg = validateCO(newCO, editingCO?.coId);
    if (errorMsg) {
      MySwal.fire({ icon: "error", title: "Invalid Input", text: errorMsg });
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      if (editingCO) {
        setCourseOutcomes((cos) => cos.map((co) => (co.coId === editingCO.coId ? { ...co, ...newCO } : co)));
      } else {
        const newId = courseOutcomes.length > 0 ? Math.max(...courseOutcomes.map((co) => co.coId)) + 1 : 1;
        setCourseOutcomes([...courseOutcomes, { ...newCO, coId: newId, courseCode: "CS101", tools: [] }]);
      }
  
      setShowCOModal(false);
      setEditingCO(null);
      setNewCO({ coNumber: "", weightage: 0 });
      MySwal.fire("Saved!", "Course Outcome has been saved.", "success");

    } catch (error) {
      MySwal.fire("Error!", "Failed to save Course Outcome.", error);
    }
  };

  const handleSaveTool = async () => {
    const errorMsg = validateTool(newTool, selectedCO, editingTool?.toolId);
    if (errorMsg) {
      MySwal.fire({ icon: "error", title: "Invalid Input", text: errorMsg });
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const toolToSave = {
        ...newTool,
        toolId: editingTool ? editingTool.toolId : Date.now(),
        marks: editingTool ? editingTool.marks : {},
      };
  
      setCourseOutcomes((cos) =>
        cos.map((co) =>
          co.coId === selectedCO.coId
            ? {
                ...co,
                tools: editingTool
                  ? co.tools.map((t) => (t.toolId === editingTool.toolId ? toolToSave : t))
                  : [...co.tools, toolToSave],
              }
            : co
        )
      );
  
      setShowToolModal(false);
      setEditingTool(null);
      setNewTool({ toolName: "", maxMarks: 0, weightage: 0 });
      MySwal.fire("Saved!", "Assessment Tool has been saved.", "success");
      
    } catch (error) {
      MySwal.fire("Error!", "Failed to save Assessment Tool.", error);
    }
  };

  const updateStudentMark = (coId, toolId, studentRollNumber, marks) => {
    const parsedMarks = parseFloat(marks);
    if (isNaN(parsedMarks) || parsedMarks < 0) return;
    const tool = courseOutcomes.find((co) => co.coId === coId)?.tools.find((t) => t.toolId === toolId);
    if (tool && parsedMarks > tool.maxMarks) return;

    setCourseOutcomes((cos) =>
      cos.map((co) =>
        co.coId === coId
          ? {
              ...co,
              tools: co.tools.map((tool) =>
                tool.toolId === toolId ? { ...tool, marks: { ...tool.marks, [studentRollNumber]: parsedMarks } } : tool
              ),
            }
          : co
      )
    );
  };

  const exportCoWiseCsv = (coId) => {
    const co = courseOutcomes.find(c => c.coId === coId);
    if (!co) return;

    const headers = ["Roll Number", "Student Name", ...co.tools.map(t => `${t.toolName} (Max: ${t.maxMarks})`)];
    const rows = students.map(student => {
      const marks = co.tools.map(tool => tool.marks[student.rollnumber] || 0);
      return [student.rollnumber, student.name, ...marks];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CO_${co.coNumber}_Marks.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    MySwal.fire("Exported!", "CO marks exported successfully.", "success");
  };

  const exportCourseWiseCsv = () => {
    const headers = ["Roll Number", "Student Name", ...courseOutcomes.map(co => `${co.coNumber} (${co.weightage}%)`), "Internal Marks"];
    const rows = students.map(student => {
      const coMarks = courseOutcomes.map(co => calculateCOMarks(co, student.rollnumber));
      const internalMarks = calculateInternalMarks(student.rollnumber);
      return [student.rollnumber, student.name, ...coMarks, internalMarks];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Course_Marks_Summary.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    MySwal.fire("Exported!", "Course marks summary exported successfully.", "success");
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
      setCourseOutcomes((cos) => cos.filter((co) => co.coId !== coId));
      MySwal.fire("Deleted!", "The CO has been deleted.", "success");
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
          co.coId === coId ? { ...co, tools: co.tools.filter((tool) => tool.toolId !== toolId) } : co
        )
      );
      MySwal.fire("Deleted!", "The tool has been deleted.", "success");
    }
  };
  
  return {
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
  };
};

export default useMarkAllocation;
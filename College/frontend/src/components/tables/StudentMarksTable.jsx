import React from "react";

const StudentMarksTable = ({ coId, tool, students, updateStudentMark }) => {
  return (
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
                    updateStudentMark(coId, tool.id, student.id, e.target.value)
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
  );
};

export default StudentMarksTable;

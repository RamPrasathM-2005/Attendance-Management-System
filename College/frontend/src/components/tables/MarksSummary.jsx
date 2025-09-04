import React from "react";

const MarksSummary = ({ courseOutcomes, students, calculateCOMarks, calculateInternalMarks }) => {
  if (!courseOutcomes.some((co) => co.tools.length > 0)) {
    return null;
  }

  return (
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
  );
};

export default MarksSummary;

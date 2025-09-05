import React from "react";
import { ChevronRight, Plus, BookOpen } from "lucide-react";
import CourseCard from "./CourseCard";

const SemesterDetails = ({ semester, onBack }) => {
  const semesterCourses = {
    [semester.semesterId]: [
      { id: 1, code: "CS301", name: "Data Structures", credits: 4, type: "Core" },
      { id: 2, code: "CS302", name: "DBMS", credits: 3, type: "Core" },
    ],
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-white rounded-lg">
          <ChevronRight className="w-5 h-5 text-gray-600 transform rotate-180" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {semester.department} - Semester {semester.semesterNumber}
          </h2>
          <p className="text-gray-600">Batch: {semester.batchYears}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Courses</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Courses
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(semesterCourses[semester.semesterId] || []).map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>

        {(!semesterCourses[semester.semesterId] ||
          semesterCourses[semester.semesterId].length === 0) && (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No courses added yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SemesterDetails;

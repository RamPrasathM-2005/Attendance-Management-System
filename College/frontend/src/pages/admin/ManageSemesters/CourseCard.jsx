import React from "react";

const CourseCard = ({ course }) => (
  <div className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer">
    <div className="flex justify-between items-start mb-2">
      <span className="font-semibold text-blue-600">{course.code}</span>
      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
        {course.type}
      </span>
    </div>
    <h4 className="font-medium text-gray-800 mb-2">{course.name}</h4>
    <div className="text-sm text-gray-600">Credits: {course.credits}</div>
  </div>
);

export default CourseCard;

import React from "react";
import { BookOpen, ChevronRight } from "lucide-react";

const SemesterCard = ({ semester, onClick, index }) => (
  <div
    onClick={() => onClick(semester)}
    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
    style={{ animation: `slideIn 0.6s ease-out ${index * 0.1}s both` }}
  >
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
          <BookOpen className="w-6 h-6 text-blue-600" />
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-800">
            Sem {semester.semesterNumber}
          </div>
          <div className="text-sm text-blue-600 font-medium">
            {semester.batchYears}
          </div>
        </div>
      </div>

      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
        {semester.department}
      </h3>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Start</span>
          <span className="font-medium text-gray-800">{semester.startDate}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">End</span>
          <span className="font-medium text-gray-800">{semester.endDate}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          Created {semester.createdDate?.split("T")[0]}
        </span>
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
      </div>
    </div>
  </div>
);

export default SemesterCard;

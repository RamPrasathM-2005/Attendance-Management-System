import React from "react";
import { X } from "lucide-react";

const ToolModal = ({ show, newTool, setNewTool, editingTool, selectedCO, handleSaveTool, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {editingTool ? "Edit Tool" : "Add Tool"} - {selectedCO?.coNumber}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tool Name</label>
              <input
                type="text"
                value={newTool.toolName}
                onChange={(e) => setNewTool({ ...newTool, toolName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Quiz 1"
              />
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
                max={selectedCO.weightage}
                value={newTool.weightage}
                onChange={(e) => setNewTool({ ...newTool, weightage: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Max: ${selectedCO.weightage}`}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
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
  );
};

export default ToolModal;
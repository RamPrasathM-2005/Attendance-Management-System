import React, { useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";

const ManageSemesters = () => {
  const [semesters, setSemesters] = useState([]);
  const [newSemester, setNewSemester] = useState("");

  const addSemester = () => {
    if (!newSemester) return;
    setSemesters([...semesters, newSemester]);
    setNewSemester("");
  };

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-4">Manage Semesters</h2>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newSemester}
          onChange={(e) => setNewSemester(e.target.value)}
          placeholder="Enter Semester Name"
          className="border p-2 rounded w-1/2"
        />
        <button
          onClick={addSemester}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Semester
        </button>
      </div>

      <ul className="space-y-2">
        {semesters.map((sem, index) => (
          <li
            key={index}
            className="flex justify-between bg-white p-3 shadow rounded"
          >
            {sem}
            <button
              className="text-red-500 hover:underline"
              onClick={() => setSemesters(semesters.filter((_, i) => i !== index))}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </AdminLayout>
  );
};

export default ManageSemesters;

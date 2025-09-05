import React, { useState, useEffect } from "react";
import { GraduationCap } from "lucide-react";
import SearchBar from "./SearchBar";
import SemesterList from "./SemesterList";
import CreateSemesterForm from "./CreateSemesterForm";
import SemesterDetails from "./SemesterDetails";

const ManageSemesters = () => {
  const [semesters, setSemesters] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [searchQuery, setSearchQuery] = useState({
    batch: "",
    department: "",
    semester: "",
  });

  // Fetch from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/semesters")
      .then((res) => res.json())
      .then((data) => setSemesters(data))
      .catch((err) => console.error("Error fetching semesters:", err));
  }, []);

  const handleCreateSemester = async (newSemester) => {
    try {
      const res = await fetch("http://localhost:5000/api/semesters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSemester),
      });

      if (!res.ok) throw new Error("Failed to create semester");

      const savedSemester = await res.json();
      setSemesters([...semesters, savedSemester]);
      setShowCreateForm(false);
    } catch (error) {
      console.error(error);
      alert("Error creating semester");
    }
  };

  const filteredSemesters = semesters.filter((s) => {
    const batchMatch = s.batchYears
      ?.toLowerCase()
      .includes(searchQuery.batch.toLowerCase());
    const deptMatch = s.department
      ?.toLowerCase()
      .includes(searchQuery.department.toLowerCase());
    const semMatch = searchQuery.semester
      ? s.semesterNumber === parseInt(searchQuery.semester)
      : true;
    return batchMatch && deptMatch && semMatch;
  });

  const departments = [
    "Computer Science Engineering",
    "Information Technology",
    "Electronics & Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Manage Semesters</h1>
          </div>
          <p className="text-gray-600">
            Create and manage semesters for different batches and departments
          </p>
        </div>

        {!selectedSemester ? (
          <>
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              departments={departments}
            />
            <SemesterList
              semesters={filteredSemesters}
              onSemesterClick={setSelectedSemester}
            />
            <CreateSemesterForm
              showCreateForm={showCreateForm}
              setShowCreateForm={setShowCreateForm}
              onCreateSemester={handleCreateSemester}
              departments={departments}
            />
          </>
        ) : (
          <SemesterDetails
            semester={selectedSemester}
            onBack={() => setSelectedSemester(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ManageSemesters;

import React, { useState } from 'react';
import { Search, Filter, Save, Edit, X, Clock, Coffee, UtensilsCrossed } from 'lucide-react';

const Timetable = () => {
  // Sample data - replace with actual API calls
  const [departments] = useState([
    { id: 1, name: 'Computer Science Engineering', code: 'CSE' },
    { id: 2, name: 'Electronics & Communication', code: 'ECE' },
    { id: 3, name: 'Mechanical Engineering', code: 'MECH' },
    { id: 4, name: 'Civil Engineering', code: 'CIVIL' }
  ]);

  const [semesters] = useState([
    { id: 1, name: 'Semester 1', deptId: 1, batch: '2024-25' },
    { id: 2, name: 'Semester 3', deptId: 1, batch: '2023-24' },
    { id: 3, name: 'Semester 5', deptId: 1, batch: '2022-23' },
    { id: 4, name: 'Semester 1', deptId: 2, batch: '2024-25' },
    { id: 5, name: 'Semester 3', deptId: 2, batch: '2023-24' }
  ]);

  const [courses] = useState([
    { id: 1, code: 'CS101', name: 'Programming Fundamentals', semId: 1, staff: 'Dr. Smith' },
    { id: 2, code: 'CS102', name: 'Data Structures', semId: 1, staff: 'Prof. Johnson' },
    { id: 3, code: 'CS103', name: 'Mathematics-I', semId: 1, staff: 'Dr. Brown' },
    { id: 4, code: 'CS201', name: 'Database Systems', semId: 2, staff: 'Dr. Wilson' },
    { id: 5, code: 'CS202', name: 'Operating Systems', semId: 2, staff: 'Prof. Davis' },
    { id: 6, code: 'EC101', name: 'Circuit Analysis', semId: 4, staff: 'Dr. Miller' }
  ]);

  // State management
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSem, setSelectedSem] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);

  // Timetable structure
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = [
    { id: 1, name: 'Period 1', time: '9:00-9:50', type: 'class' },
    { id: 2, name: 'Period 2', time: '9:50-10:40', type: 'class' },
    { id: 3, name: 'Short Break', time: '10:40-10:50', type: 'break' },
    { id: 4, name: 'Period 3', time: '10:50-11:40', type: 'class' },
    { id: 5, name: 'Period 4', time: '11:40-12:30', type: 'class' },
    { id: 6, name: 'Lunch Break', time: '12:30-1:30', type: 'lunch' },
    { id: 7, name: 'Period 5', time: '1:30-2:20', type: 'class' },
    { id: 8, name: 'Period 6', time: '2:20-3:10', type: 'class' },
    { id: 9, name: 'Short Break', time: '3:10-3:20', type: 'break' },
    { id: 10, name: 'Period 7', time: '3:20-4:10', type: 'class' },
    { id: 11, name: 'Period 8', time: '4:10-5:00', type: 'class' }
  ];

  // Main state for all timetable data
  const [timetableData, setTimetableData] = useState({
    1: { // Semester ID
      'Monday-1': { course: 'CS101', courseName: 'Programming Fundamentals', staff: 'Dr. Smith' },
      'Monday-2': { course: 'CS102', courseName: 'Data Structures', staff: 'Prof. Johnson' },
      'Monday-4': { course: 'CS103', courseName: 'Mathematics-I', staff: 'Dr. Brown' },
      'Tuesday-1': { course: 'CS102', courseName: 'Data Structures', staff: 'Prof. Johnson' },
      'Tuesday-2': { course: 'CS101', courseName: 'Programming Fundamentals', staff: 'Dr. Smith' },
      'Wednesday-1': { course: 'CS103', courseName: 'Mathematics-I', staff: 'Dr. Brown' },
    }
  });

  // Filter semesters based on selected department
  const filteredSemesters = selectedDept 
    ? semesters.filter(sem => sem.deptId === parseInt(selectedDept))
    : [];

  // Filter courses based on selected semester
  const availableCourses = selectedSem 
    ? courses.filter(course => course.semId === parseInt(selectedSem))
    : [];
    
  // **FIX 1: Define `currentTimetable` based on selected semester**
  // This gets the specific timetable for the selected semester, or an empty object if none exists yet.
  const currentTimetable = timetableData[selectedSem] || {};

  // **FIX 2: Define `getCourseSchedule` function**
  // This function calculates how many periods a specific course is scheduled for.
  const getCourseSchedule = (courseCode) => {
    return Object.values(currentTimetable).filter(cell => cell.course === courseCode);
  };

  const handleCellClick = (day, periodId, periodType) => {
    if (periodType !== 'class' || !editMode || !selectedSem) return;
    
    setSelectedCell({ day, periodId });
    setShowCourseModal(true);
  };

  const handleCourseAssign = (courseId) => {
    if (!selectedCell || !selectedSem || !courseId) {
        setShowCourseModal(false);
        setSelectedCell(null);
        return;
    };
    
    const course = availableCourses.find(c => c.id === parseInt(courseId));
    if (!course) return;

    const cellKey = `${selectedCell.day}-${selectedCell.periodId}`;
    
    setTimetableData(prev => ({
      ...prev,
      [selectedSem]: {
        // **FIX 3: Handle creation of a new timetable for a semester**
        // `...(prev[selectedSem] || {})` prevents an error if `prev[selectedSem]` is undefined.
        ...(prev[selectedSem] || {}),
        [cellKey]: {
          course: course.code,
          courseName: course.name,
          staff: course.staff,
        }
      }
    }));
    
    setShowCourseModal(false);
    setSelectedCell(null);
  };

  const handleRemoveCourse = (day, periodId) => {
    if (!selectedSem) return;
    
    const cellKey = `${day}-${periodId}`;
    setTimetableData(prev => {
      // Create a new copy of the semester's timetable data
      const newSemData = { ...(prev[selectedSem] || {}) };
      // Delete the specific cell entry
      delete newSemData[cellKey];
      // Return the updated state
      return {
        ...prev,
        [selectedSem]: newSemData
      };
    });
  };

  const renderPeriodHeader = (period) => {
    const icons = {
      break: <Coffee className="w-4 h-4" />,
      lunch: <UtensilsCrossed className="w-4 h-4" />,
      class: <Clock className="w-4 h-4" />
    };

    const bgColor = {
      break: 'bg-orange-50 text-orange-700',
      lunch: 'bg-green-50 text-green-700',
      class: 'bg-blue-50 text-blue-700'
    };

    return (
      <div className={`p-3 text-center font-medium border-r ${bgColor[period.type]}`}>
        <div className="flex items-center justify-center gap-2 mb-1">
          {icons[period.type]}
          <span className="text-sm">{period.name}</span>
        </div>
        <div className="text-xs">{period.time}</div>
      </div>
    );
  };

  const renderTimetableCell = (day, period) => {
    if (period.type !== 'class') {
      return (
        <div className="p-4 bg-gray-100 text-center text-gray-500 border-r h-full flex items-center justify-center">
          {period.type === 'break' ? '☕' : '🍽️'}
        </div>
      );
    }

    const cellKey = `${day}-${period.id}`;
    const cellData = currentTimetable[cellKey];
    const isSelected = selectedCell?.day === day && selectedCell?.periodId === period.id;

    return (
      <div
        className={`relative p-3 h-24 border-r transition-all duration-200 ${
          editMode ? 'cursor-pointer hover:bg-blue-50' : 'cursor-default'
        } ${isSelected ? 'bg-blue-100 ring-2 ring-blue-500 z-10' : ''} ${
          cellData ? 'bg-white' : 'bg-gray-50'
        }`}
        onClick={() => handleCellClick(day, period.id, period.type)}
      >
        {cellData ? (
          <div className="h-full flex flex-col justify-between text-left">
            <div>
              <div className="font-semibold text-sm text-blue-900 mb-1 truncate">
                {cellData.course}
              </div>
              <div className="text-xs text-gray-600 truncate" title={cellData.courseName}>
                {cellData.courseName}
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1 truncate">
              {cellData.staff}
            </div>
            {editMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent cell click from firing
                  handleRemoveCourse(day, period.id);
                }}
                className="absolute top-1 right-1 p-1 rounded-full bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-700 opacity-50 hover:opacity-100 transition-opacity"
                title="Remove course"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          editMode && (
            <div className="h-full flex items-center justify-center text-gray-400 text-xs">
              Click to assign
            </div>
          )
        )}
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Timetable Management</h1>
            <div className="flex items-center gap-3">
              {selectedSem && (
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    editMode
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {editMode ? (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4" />
                      Edit Timetable
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="dept-select" className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                id="dept-select"
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setSelectedSem('');
                  setEditMode(false); // Exit edit mode when changing context
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sem-select" className="block text-sm font-medium text-gray-700 mb-2">
                Semester
              </label>
              <select
                id="sem-select"
                value={selectedSem}
                onChange={(e) => {
                  setSelectedSem(e.target.value);
                  setEditMode(false); // Exit edit mode when changing context
                }}
                disabled={!selectedDept}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select Semester</option>
                {filteredSemesters.map(sem => (
                  <option key={sem.id} value={sem.id}>
                    {sem.name} - {sem.batch}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-2">
                Search Courses
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="search-input"
                  type="text"
                  placeholder="Feature coming soon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled // Search functionality can be added later
                />
              </div>
            </div>
          </div>
        </div>

        {/* Timetable */}
        {selectedSem ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              <h2 className="text-lg font-semibold">
                {departments.find(d => d.id === parseInt(selectedDept))?.name} - {' '}
                {semesters.find(s => s.id === parseInt(selectedSem))?.name}
              </h2>
              <p className="text-blue-100 text-sm">
                Batch: {semesters.find(s => s.id === parseInt(selectedSem))?.batch}
              </p>
            </div>

            <div className="overflow-x-auto">
              <div className="grid grid-cols-[auto_repeat(11,minmax(150px,1fr))]">
                {/* Header Row */}
                <div className="sticky top-0 left-0 bg-gray-100 z-20 p-4 font-semibold text-gray-700 border-r border-b text-left whitespace-nowrap">
                  Day/Period
                </div>
                {periods.map(period => (
                  <div key={period.id} className="sticky top-0 bg-gray-50 z-10 border-b min-w-[150px]">
                    {renderPeriodHeader(period)}
                  </div>
                ))}

                {/* Day Rows */}
                {days.map(day => (
                  <React.Fragment key={day}>
                    <div className="sticky left-0 bg-gray-100 z-10 p-4 font-semibold text-gray-700 border-r border-b whitespace-nowrap">
                      {day}
                    </div>
                    {periods.map(period => (
                      <div key={`${day}-${period.id}`} className="relative border-b">
                        {renderTimetableCell(day, period)}
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select Department & Semester</h3>
            <p className="text-gray-500">Choose a department and semester to view or create a timetable.</p>
          </div>
        )}

        {/* Course Assignment Modal */}
        {showCourseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Assign Course</h3>
                <button
                  onClick={() => setShowCourseModal(false)}
                  className="text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2 font-medium">
                  Assigning for: <span className="font-bold text-indigo-600">{selectedCell?.day}, {periods.find(p => p.id === selectedCell?.periodId)?.name}</span>
                </p>
                <select
                  defaultValue=""
                  onChange={(e) => handleCourseAssign(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>Select a course...</option>
                  {availableCourses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name} ({course.staff})
                    </option>
                  ))}
                </select>
                {availableCourses.length === 0 && (
                    <p className="text-sm text-red-600 mt-2">No courses available for this semester. Please add courses first.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Available Courses Summary */}
        {selectedSem && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Courses for this Semester</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableCourses.map(course => {
                const schedule = getCourseSchedule(course.code);
                return (
                  <div key={course.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-gray-50">
                    <div className="font-semibold text-blue-900">{course.code}</div>
                    <div className="text-sm text-gray-700 mb-1">{course.name}</div>
                    <div className="text-xs text-gray-500 mb-2">Staff: {course.staff}</div>
                    
                    <div className={`flex items-center gap-2 text-xs font-medium p-2 rounded-md ${schedule.length > 0 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{schedule.length > 0 ? `${schedule.length} periods scheduled` : 'Not scheduled'}</span>
                    </div>
                  </div>
                );
              })}
               {availableCourses.length === 0 && (
                  <p className="text-gray-500 col-span-full">No courses have been defined for this semester.</p>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timetable;

const StaffDashboard = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Staff Dashboard</h2>
      <p className="text-gray-600">
        Welcome! Here you can manage attendance, allocate marks, and view reports.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="p-4 bg-white shadow rounded-lg">
          <h3 className="font-semibold">Total Courses</h3>
          <p className="text-2xl">--</p>
        </div>
        <div className="p-4 bg-white shadow rounded-lg">
          <h3 className="font-semibold">Students Enrolled</h3>
          <p className="text-2xl">--</p>
        </div>
        <div className="p-4 bg-white shadow rounded-lg">
          <h3 className="font-semibold">Attendance Taken</h3>
          <p className="text-2xl">--</p>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;

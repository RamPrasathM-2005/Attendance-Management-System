const Reports = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Reports</h2>
      <p className="text-gray-600">Download reports for attendance and marks.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-100">
          Attendance Report
        </button>
        <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-100">
          Marks Report
        </button>
      </div>
    </div>
  );
};

export default Reports;

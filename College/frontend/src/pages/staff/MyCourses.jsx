const MyCourses = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My Courses</h2>
      <p className="text-gray-600">List of courses allocated to you.</p>

      <table className="w-full mt-4 border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Course Code</th>
            <th className="px-4 py-2 border">Course Name</th>
            <th className="px-4 py-2 border">Semester</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-2 border">--</td>
            <td className="px-4 py-2 border">--</td>
            <td className="px-4 py-2 border">--</td>
            <td className="px-4 py-2 border">
              <button className="px-3 py-1 bg-green-600 text-white rounded">
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default MyCourses;

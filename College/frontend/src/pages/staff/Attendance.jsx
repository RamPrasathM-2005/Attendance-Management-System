const Attendance = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Attendance</h2>
      <p className="text-gray-600">Mark attendance for students in your course.</p>

      <div className="mt-4">
        <select className="border p-2 rounded">
          <option>Select Date</option>
        </select>
        <table className="w-full mt-4 border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Student Name</th>
              <th className="px-4 py-2 border">Roll Number</th>
              <th className="px-4 py-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2 border">--</td>
              <td className="px-4 py-2 border">--</td>
              <td className="px-4 py-2 border">
                <input type="checkbox" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;

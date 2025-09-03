const MarksAllocation = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Marks Allocation</h2>
      <p className="text-gray-600">Allocate marks based on COs & Tools.</p>

      <div className="mt-6">
        <table className="w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Student</th>
              <th className="px-4 py-2 border">CO</th>
              <th className="px-4 py-2 border">Tool</th>
              <th className="px-4 py-2 border">Marks</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2 border">--</td>
              <td className="px-4 py-2 border">CO1</td>
              <td className="px-4 py-2 border">Quiz</td>
              <td className="px-4 py-2 border">
                <input type="number" className="border rounded p-1 w-20" />
              </td>
            </tr>
          </tbody>
        </table>
        <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded">
          Save Marks
        </button>
      </div>
    </div>
  );
};

export default MarksAllocation;

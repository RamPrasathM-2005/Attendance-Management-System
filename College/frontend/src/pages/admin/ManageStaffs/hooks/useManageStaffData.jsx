// src/hooks/useManageStaffData.js
import { useState, useEffect } from 'react';
import manageStaffService from '../../../../services/manageStaffService.js';

const useManageStaffData = (selectedStaff, setSelectedStaff) => {
  const [staffList, setStaffList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [batches, setBatches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await manageStaffService.fetchInitialData();
      setDepartments(data.departments);
      setSemesters(data.semesters);
      setBatches(data.batches);
      setStaffList(data.staff);
      setCourses(data.courses);
    } catch (err) {
      setError(`Failed to fetch data: ${err.message}`);
      console.error('Fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedStaff && staffList.length > 0) {
      const updatedStaff = staffList.find(s => s.staffId === selectedStaff.staffId);
      if (updatedStaff) {
        const oldCoursesMap = new Map(selectedStaff.allocatedCourses.map(c => [c.id, c]));
        const newCoursesMap = new Map(updatedStaff.allocatedCourses.map(c => [c.id, c]));
        let hasDifference = oldCoursesMap.size !== newCoursesMap.size;
        if (!hasDifference) {
          hasDifference = Array.from(newCoursesMap.values()).some(newC => {
            const oldC = oldCoursesMap.get(newC.id);
            return !oldC || oldC.sectionId !== newC.sectionId;
          });
        }
        if (hasDifference) {
          setSelectedStaff({ ...updatedStaff });
        }
      }
    }
  }, [staffList, selectedStaff, setSelectedStaff]);

  return { staffList, setStaffList, courses, semesters, batches, departments, loading, error, fetchData };
};

export default useManageStaffData;
import axios from 'axios';

const API_BASE = 'http://localhost:4000/api/admin';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

// Request interceptor for token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.error('No token found in localStorage');
  }
  return config;
});

// Get courses handled by the staff
export const getMyCourses = async (staffId) => {
  try {
    const response = await api.get(`/staff/${staffId}/courses`);
    if (response.data.status === 'success') {
      return response.data.data.map(course => ({
        ...course,
        semester: course.semester || 'Unknown Semester',
        degree: course.degree || 'Unknown Degree',
        branch: course.branch || 'Unknown Branch',
        batch: course.batch || 'Unknown Batch',
      }));
    } else {
      throw new Error(response.data.message || 'Failed to fetch courses');
    }
  } catch (error) {
    console.error('Error fetching courses:', error.message);
    throw error;
  }
};
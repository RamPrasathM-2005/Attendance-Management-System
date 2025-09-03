// src/services/authService.js

// Mock users (for demo purpose)
const users = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "staff", password: "staff123", role: "staff" },
];

// Login function
export const login = (username, password) => {
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  } else {
    throw new Error("Invalid credentials");
  }
};

// Register function (adds to localStorage users mock)
export const register = (username, password, role) => {
  const userExists = users.some((u) => u.username === username);
  if (userExists) {
    throw new Error("User already exists");
  }
  const newUser = { username, password, role };
  users.push(newUser);
  localStorage.setItem("user", JSON.stringify(newUser));
  return newUser;
};

// Logout
export const logout = () => {
  localStorage.removeItem("user");
};

// Get current user
export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

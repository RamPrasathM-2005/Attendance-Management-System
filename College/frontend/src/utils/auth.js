// src/utils/auth.js

import { getCurrentUser } from "../services/authService";

export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

export const getUserRole = () => {
  const user = getCurrentUser();
  return user ? user.role : null;
};

export const getRole = () => localStorage.getItem("role");
export const getToken = () => localStorage.getItem("token");

export const logout = () => {
  localStorage.removeItem("role");
  localStorage.removeItem("token");
};

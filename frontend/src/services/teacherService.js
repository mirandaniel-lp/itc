import axios from "axios";

const API_URL = "http://localhost:3000/api/teachers";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getAll = async () => {
  const res = await axios.get(API_URL, { headers: getAuthHeaders() });
  return res.data.teachers;
};

const getById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.data.teacher;
};

const create = async (data) => {
  const res = await axios.post(API_URL, data, { headers: getAuthHeaders() });
  return res.data;
};

const update = async (id, data) => {
  const res = await axios.put(`${API_URL}/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

const remove = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

const getCourses = async (teacherId) => {
  const res = await axios.get(`${API_URL}/${teacherId}/courses`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

const login = async (credentials) => {
  const res = await axios.post(`${API_URL}/login`, credentials);
  const { token, teacher } = res.data;
  localStorage.removeItem("user");
  localStorage.setItem("token", token);
  localStorage.setItem("teacher", JSON.stringify(teacher));
  return teacher;
};

const logout = async () => {
  try {
    await axios.post(`${API_URL}/logout`, {}, { headers: getAuthHeaders() });
  } catch (error) {
    console.warn("Advertencia: error al cerrar sesión en el servidor", error);
  } finally {
    localStorage.removeItem("teacher");
    localStorage.removeItem("token");
  }
};

const getDashboard = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No hay token disponible");

  const res = await axios.get(`${API_URL}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export default {
  getAll,
  getById,
  create,
  update,
  remove,
  getCourses,
  login,
  logout,
  getDashboard,
};

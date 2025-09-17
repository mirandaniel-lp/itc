import axios from "axios";

const API_URL = "http://localhost:3000/api/teachers";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default {
  async getAll() {
    const res = await apiClient.get("/");
    return res.data.teachers;
  },
  async getById(id) {
    const res = await apiClient.get(`/${id}`);
    return res.data.teacher;
  },
  async create(data) {
    const res = await apiClient.post("/", data);
    return res.data.teacher;
  },
  async update(id, data) {
    const res = await apiClient.put(`/${id}`, data);
    return res.data.teacher;
  },
  async remove(id) {
    const res = await apiClient.delete(`/${id}`);
    return res.data.message;
  },
};

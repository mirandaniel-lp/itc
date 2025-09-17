import axios from "axios";

const API_URL = "http://localhost:3000/api/enrollments";

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
    return res.data.enrollments;
  },
  async getById(id) {
    const res = await apiClient.get(`/${id}`);
    return res.data.enrollment;
  },
  async create(data) {
    const res = await apiClient.post("/", data);
    return res.data.enrollment;
  },
  async remove(id) {
    const res = await apiClient.delete(`/${id}`);
    return res.data.message;
  },
};

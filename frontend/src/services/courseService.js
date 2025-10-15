import axios from "axios";

const API_URL = "http://localhost:3000/api/courses";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
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
    return res.data.courses;
  },
  async getById(id) {
    const res = await apiClient.get(`/${id}`);
    return res.data.course;
  },
  async create(data) {
    const res = await apiClient.post("/", data);
    return res.data.course;
  },
  async update(id, data) {
    const res = await apiClient.put(`/${id}`, data);
    return res.data.course;
  },
  async remove(id) {
    const res = await apiClient.delete(`/${id}`);
    return res.data.message;
  },
};

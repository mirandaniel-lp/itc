import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/teachers",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default {
  async getAll() {
    const res = await api.get("/");
    return res.data.teachers;
  },
  async getById(id) {
    const res = await api.get(`/${id}`);
    return res.data.teacher;
  },
  async create(data) {
    const res = await api.post("/", data);
    return res.data.teacher;
  },
  async update(id, data) {
    const res = await api.put(`/${id}`, data);
    return res.data.teacher;
  },
  async remove(id) {
    const res = await api.delete(`/${id}`);
    return res.data.message;
  },
};

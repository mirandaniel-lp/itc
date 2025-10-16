import axios from "axios";

const API_URL = "http://localhost:3000/api/students";
const COURSES_API_URL = "http://localhost:3000/api/courses";

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
    return res.data.students;
  },
  async getById(id) {
    const res = await apiClient.get(`/${id}`);
    return res.data.student;
  },
  async create(data) {
    const res = await apiClient.post("/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.student;
  },
  async update(id, data) {
    const res = await apiClient.put(`/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.student;
  },
  async remove(id) {
    const res = await apiClient.delete(`/${id}`);
    return res.data.message;
  },
  async getByCourse(courseId) {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${COURSES_API_URL}/${courseId}/students`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
    return res.data.students;
  },
};

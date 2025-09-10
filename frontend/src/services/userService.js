import axios from "axios";

const API_URL = "http://localhost:3000/api/users";

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
  async getUsers() {
    const res = await apiClient.get("/");
    return res.data.users;
  },

  async getUser(id) {
    const res = await apiClient.get(`/${id}`);
    return res.data.user;
  },

  async updateUser(id, data) {
    const res = await apiClient.put(`/${id}`, data);
    return res.data.user;
  },

  async deleteUser(id) {
    const res = await apiClient.delete(`/${id}`);
    return res.data.message;
  },
};

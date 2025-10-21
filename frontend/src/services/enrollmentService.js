// src/services/enrollmentService.js
import http from "./http";

const API = "/enrollments";

export default {
  async getAll(params) {
    const { data } = await http.get(API, { params });
    return data.enrollments ?? data;
  },
  async getById(id) {
    const { data } = await http.get(`${API}/${id}`);
    return data.enrollment ?? data;
  },
  async create(payload) {
    const { data } = await http.post(API, payload);
    return data.enrollment ?? data;
  },
  async remove(id) {
    const { data } = await http.delete(`${API}/${id}`);
    return data.message ?? data;
  },
};

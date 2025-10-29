import http from "./http";

const API = "/enrollments";

export default {
  async getAll(params) {
    const { data } = await http.get(API, { params });
    return data.enrollments ?? data;
  },
  async getSummary(params) {
    const { data } = await http.get(`${API}/summary`, { params });
    return data.items ?? data;
  },
  async getById(id) {
    const { data } = await http.get(`${API}/${id}`);
    return data.enrollment ?? data;
  },
  async create(payload) {
    const { data } = await http.post(API, payload);
    return data.enrollment ?? data;
  },
  async createTx(payload) {
    const { data } = await http.post(`${API}/tx`, payload);
    return data;
  },
  async remove(id) {
    const { data } = await http.delete(`${API}/${id}`);
    return data.message ?? data;
  },
  async getStudentSchedule(studentId) {
    const { data } = await http.get(`${API}/student/${studentId}/schedule`);
    return data.items ?? data;
  },
};

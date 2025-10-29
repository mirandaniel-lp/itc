import http from "./http";
const API = "/grade-policies";

export default {
  async getAll(params) {
    const { data } = await http.get(API, { params });
    return data.policies ?? data;
  },
  async getById(id) {
    const { data } = await http.get(`${API}/${id}`);
    return data.policy ?? data;
  },
  async getByCourse(courseId) {
    const { data } = await http.get(`${API}/curso/${courseId}`);
    return data.policy ?? data;
  },
  async create(payload) {
    const { data } = await http.post(API, payload);
    return data.policy ?? data;
  },
  async update(id, payload) {
    const { data } = await http.put(`${API}/${id}`, payload);
    return data.policy ?? data;
  },
  async remove(id) {
    const { data } = await http.delete(`${API}/${id}`);
    return data.message ?? data;
  },
};

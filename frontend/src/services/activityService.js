import http from "./http";

const API = "/activities";

export default {
  async getAll(params) {
    const { data } = await http.get(API, { params });
    return data.activities ?? data;
  },
  async getById(id) {
    const { data } = await http.get(`${API}/${id}`);
    return data.activity ?? data;
  },
  async create(payload) {
    const { data } = await http.post(API, payload);
    return data.activity ?? data;
  },
  async update(id, payload) {
    const { data } = await http.put(`${API}/${id}`, payload);
    return data.activity ?? data;
  },
  async remove(id) {
    const { data } = await http.delete(`${API}/${id}`);
    return data.message ?? data;
  },
  async getActivitiesByCourse(courseId) {
    const { data } = await http.get(`${API}/course/${courseId}`);
    return data.activities ?? data;
  },
};

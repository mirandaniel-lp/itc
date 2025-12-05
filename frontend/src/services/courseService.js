import http from "./http";

const API = "/courses";

export default {
  async getAll(params) {
    const { data } = await http.get(API, { params });
    return data.courses ?? data;
  },
  async getById(id) {
    const { data } = await http.get(`${API}/${id}`);
    return data.course ?? data;
  },
  async create(payload) {
    const { data } = await http.post(API, payload);
    return data.course ?? data;
  },
  async update(id, payload) {
    const { data } = await http.put(`${API}/${id}`, payload);
    return data.course ?? data;
  },
  async remove(id) {
    const { data } = await http.delete(`${API}/${id}`);
    return data.message ?? data;
  },
  async getSchedules(courseId) {
    const { data } = await http.get(`${API}/${courseId}/schedules`);
    return data.schedules ?? data;
  },
};

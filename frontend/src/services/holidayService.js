import http from "./http";
const API = "/holidays";

export default {
  async getAll(params) {
    const { data } = await http.get(API, { params });
    return data.holidays ?? data;
  },
  async getById(id) {
    const { data } = await http.get(`${API}/${id}`);
    return data.holiday ?? data;
  },
  async create(payload) {
    const { data } = await http.post(API, payload);
    return data.holiday ?? data;
  },
  async update(id, payload) {
    const { data } = await http.put(`${API}/${id}`, payload);
    return data.holiday ?? data;
  },
  async remove(id) {
    const { data } = await http.delete(`${API}/${id}`);
    return data.message ?? data;
  },
};

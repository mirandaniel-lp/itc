import http from "./http";

const API = "/teachers";

export default {
  async getAll(params) {
    const { data } = await http.get(API, { params });
    return data.teachers ?? data;
  },
  async getById(id) {
    const { data } = await http.get(`${API}/${id}`);
    return data.teacher ?? data;
  },
  async create(payload) {
    const { data } = await http.post(API, payload);
    return data.teacher ?? data;
  },
  async update(id, payload) {
    const { data } = await http.put(`${API}/${id}`, payload);
    return data.teacher ?? data;
  },
  async remove(id) {
    const { data } = await http.delete(`${API}/${id}`);
    return data.message ?? data;
  },
};

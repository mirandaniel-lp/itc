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
  async getCatalogs() {
    const { data } = await http.get(`${API}/catalogs`);
    return data;
  },
  async createBulkWithSchedules(payload) {
    const { data } = await http.post(`${API}/bulk-with-schedules`, payload);
    return data.courses ?? data;
  },
};

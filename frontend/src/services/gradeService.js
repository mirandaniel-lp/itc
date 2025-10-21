import http from "./http";

const API = "/grades";

export default {
  async getAll(params) {
    const { data } = await http.get(API, { params });
    return data.grades ?? data;
  },
  async getGradesByActivity(activityId) {
    const { data } = await http.get(`${API}/activity/${activityId}`);
    return data.grades ?? data;
  },
  async updateGrade(id, payload) {
    const { data } = await http.put(`${API}/${id}`, payload);
    return data;
  },
  async createGrade(payload) {
    const { data } = await http.post(API, payload);
    return data;
  },
};

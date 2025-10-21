import http from "./http";

const API = "/attendance";

export default {
  async getCourseDates(courseId) {
    const { data } = await http.get(`${API}/course-dates`, {
      params: { courseId },
    });
    return data;
  },
  async getRoster(courseId, date) {
    const { data } = await http.get(`${API}/roster`, {
      params: { courseId, date },
    });
    return data;
  },
  async getStats(courseId, date) {
    const { data } = await http.get(`${API}/stats`, {
      params: { courseId, date },
    });
    return data;
  },
  async markBulk(courseId, date, items) {
    const { data } = await http.post(`${API}/bulk`, { courseId, date, items });
    return data;
  },
  async saveGrid(courseId, date, rows) {
    const { data } = await http.post(`${API}/save-grid`, {
      courseId,
      date,
      rows,
    });
    return data;
  },
  async updateOne(id, payload) {
    const { data } = await http.put(`${API}/${id}`, payload);
    return data;
  },
};

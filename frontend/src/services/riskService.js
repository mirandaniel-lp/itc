import http from "./http";
const API = "/risks";

export default {
  async health() {
    const { data } = await http.get(`${API}/health`);
    return data;
  },
  async train(payload) {
    const { data } = await http.post(`${API}/train`, payload);
    return data;
  },
  async getPredictions(courseId) {
    const { data } = await http.get(`${API}/courses/${courseId}/predictions`);
    return data;
  },
  async persistPredictions(courseId) {
    const { data } = await http.post(`${API}/courses/${courseId}/predictions`);
    return data;
  },
  async validateCourse(courseId) {
    const { data } = await http.get(`${API}/courses/${courseId}/validate`);
    return data;
  },
};

import http from "./http";
const API = "/dashboard";
export default {
  async summary() {
    const { data } = await http.get(`${API}/summary`);
    return data;
  },
  async getCourses() {
    const { data } = await http.get(`${API}/courses`);
    return data.courses ?? data;
  },
  async coursePerformance(courseId) {
    const { data } = await http.get(`${API}/course-performance/${courseId}`);
    return data.students ?? data;
  },
};

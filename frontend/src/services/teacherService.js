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
  async login(payload) {
    try {
      const { data } = await http.post(`${API}/auth/login`, payload);
      return data;
    } catch (err) {
      const { data } = await http.post(`${API}/login`, payload);
      return data;
    }
  },
  async getCourses(teacherId) {
    const { data } = await http.get(`${API}/${teacherId}/courses`);
    return data;
  },
  async getMyCourses() {
    const { data } = await http.get(`${API}/me/courses`);
    return data.courses ?? data;
  },
  async getMyActivities() {
    const { data } = await http.get(`${API}/me/activities`);
    return data.activities ?? data;
  },
  async getMyStudents() {
    const { data } = await http.get(`${API}/me/students`);
    return data.students ?? data;
  },
  async getMyGrades() {
    const { data } = await http.get(`${API}/me/grades`);
    return data.grades ?? data;
  },
};

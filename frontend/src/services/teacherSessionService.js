import http from "./http";

const API = "/teacher";

export default {
  async login(payload) {
    const { data } = await http.post(`${API}/auth/login`, payload);
    return data;
  },

  async logout() {
    const { data } = await http.post(`${API}/auth/logout`);
    return data;
  },

  async getCourses() {
    const { data } = await http.get(`${API}/courses`);
    return data.courses ?? data;
  },

  async getActivities(params) {
    const { data } = await http.get(`${API}/activities`, { params });
    return data.activities ?? data;
  },

  async createActivity(payload) {
    const { data } = await http.post(`${API}/activities`, payload);
    return data.activity ?? data;
  },

  async updateActivity(id, payload) {
    const { data } = await http.put(`${API}/activities/${id}`, payload);
    return data.activity ?? data;
  },

  async deleteActivity(id) {
    const { data } = await http.delete(`${API}/activities/${id}`);
    return data;
  },

  async publishActivity(id) {
    const { data } = await http.post(`${API}/activities/${id}/publish`);
    return data.activity ?? data;
  },

  async unpublishActivity(id) {
    const { data } = await http.post(`${API}/activities/${id}/unpublish`);
    return data.activity ?? data;
  },

  async getCourseStudents(courseId) {
    const { data } = await http.get(`${API}/courses/${courseId}/students`);
    return data.students ?? data;
  },

  async getGrades(activityId) {
    const { data } = await http.get(`${API}/activities/${activityId}/grades`);
    return data.grades ?? data;
  },

  async saveGrades(activityId, rows) {
    const { data } = await http.post(`${API}/activities/${activityId}/grades`, {
      rows,
    });
    return data.grades ?? data;
  },

  async publishGrades(activityId) {
    const { data } = await http.post(
      `${API}/activities/${activityId}/grades/publish`
    );
    return data;
  },

  async getAttendance(courseId, date) {
    const { data } = await http.get(`${API}/attendance/${courseId}`, {
      params: { date },
    });
    return data.attendances ?? data;
  },

  async saveAttendance(courseId, date, rows) {
    const { data } = await http.post(
      `${API}/attendance/${courseId}`,
      { rows },
      { params: { date } }
    );
    return data.attendances ?? data;
  },

  async getAttendanceMeta(courseId) {
    const { data } = await http.get(`${API}/attendance/${courseId}/meta`);
    return data.meta ?? data;
  },

  async isAttendanceAllowed(courseId, date) {
    const { data } = await http.get(`${API}/attendance/${courseId}/allowed`, {
      params: { date },
    });
    return data;
  },

  async getWeeklySchedule(range) {
    const { start, end } = range || {};
    const { data } = await http.get(`${API}/schedule/weekly`, {
      params: { start, end },
    });
    return data;
  },

  async getProfile() {
    const { data } = await http.get(`${API}/profile`);
    return data.teacher ?? data;
  },

  async updateProfile(payload) {
    const { data } = await http.put(`${API}/profile`, payload);
    return data.teacher ?? data;
  },

  async changePin(currentPin, newPin) {
    const { data } = await http.post(`${API}/profile/change-pin`, {
      currentPin,
      newPin,
    });
    return data;
  },

  async getStudentAttendances(courseId, studentId) {
    const { data } = await http.get(
      `/teacher/courses/${courseId}/students/${studentId}/attendances`
    );
    return data.attendances ?? data;
  },

  async getStudentGrades(courseId, studentId) {
    const { data } = await http.get(
      `/teacher/courses/${courseId}/students/${studentId}/grades`
    );
    return data.grades ?? data;
  },
};

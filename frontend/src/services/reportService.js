import http from "./http";

const API = "/reports";

export default {
  async getKpis(params) {
    const { data } = await http.get(`${API}/kpis`, { params });
    return data;
  },

  async getEnrollmentsOverTime(params) {
    const { data } = await http.get(`${API}/enrollments/over-time`, { params });
    return data;
  },

  async getEnrollmentsByModality(params) {
    const { data } = await http.get(`${API}/enrollments/modality`, { params });
    return data;
  },

  async getTopCourses(params) {
    const { data } = await http.get(`${API}/courses/top`, { params });
    return data;
  },

  async getGradesDistribution(params) {
    const { data } = await http.get(`${API}/grades/distribution`, { params });
    return data;
  },

  async enrollmentsByMonth(year) {
    const { data } = await http.get(`${API}/enrollments/month`, {
      params: { year },
    });
    return data;
  },
  async enrollmentsByWeek(weeks = 12) {
    const { data } = await http.get(`${API}/enrollments/week`, {
      params: { weeks },
    });
    return data;
  },
  async topCourses(year, limit = 5) {
    const { data } = await http.get(`${API}/courses/top`, {
      params: { year, limit },
    });
    return data;
  },
  async passRateByCourse(year) {
    const { data } = await http.get(`${API}/grades/passrate-by-course`, {
      params: { year },
    });
    return data;
  },
};

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/reports",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default {
  async getKpis(params) {
    const { data } = await api.get("/kpis", { params });
    return data;
  },
  async getEnrollmentsOverTime(params) {
    const { data } = await api.get("/enrollments/over-time", { params });
    return data;
  },
  async getEnrollmentsByModality(params) {
    const { data } = await api.get("/enrollments/modality", { params });
    return data;
  },
  async getTopCourses(params) {
    const { data } = await api.get("/courses/top", { params });
    return data;
  },
  async getGradesDistribution(params) {
    const { data } = await api.get("/grades/distribution", { params });
    return data;
  },

  async enrollmentsByMonth(year) {
    const { data } = await api.get("/enrollments/month", { params: { year } });
    return data;
  },
  async enrollmentsByWeek(weeks = 12) {
    const { data } = await api.get("/enrollments/week", { params: { weeks } });
    return data;
  },
  async enrollmentsByModality(year) {
    const { data } = await api.get("/enrollments/modality", {
      params: { year },
    });
    return data;
  },
  async topCourses(year, limit = 5) {
    const { data } = await api.get("/courses/top", { params: { year, limit } });
    return data;
  },
  async passRateByCourse(year) {
    const { data } = await api.get("/grades/passrate-by-course", {
      params: { year },
    });
    return data;
  },
};

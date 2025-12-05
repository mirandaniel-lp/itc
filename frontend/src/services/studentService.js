import http from "./http";

const API = "/students";
const COURSES_API = "/courses";

export default {
  async getAll(params) {
    const { data } = await http.get(API, { params });
    return data.students ?? data;
  },
  async getById(id) {
    const { data } = await http.get(`${API}/${id}`);
    return data.student ?? data;
  },
  async create(formData, onProgress) {
    const { data } = await http.post(API, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: onProgress
        ? (e) => onProgress(Math.round((e.loaded * 100) / (e.total || 1)))
        : undefined,
    });
    return data.student ?? data;
  },
  async update(id, formData, onProgress) {
    const { data } = await http.put(`${API}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: onProgress
        ? (e) => onProgress(Math.round((e.loaded * 100) / (e.total || 1)))
        : undefined,
    });
    return data.student ?? data;
  },
  async remove(id) {
    const { data } = await http.delete(`${API}/${id}`);
    return data.message ?? data;
  },
  async getByCourse(courseId) {
    const { data } = await http.get(`${COURSES_API}/${courseId}/students`);
    return data.students ?? data;
  },
};

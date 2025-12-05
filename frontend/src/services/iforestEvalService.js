import http from "./http";
const API = "/iforest-eval";

export default {
  async tuneCourse(courseId, policy = { mode: "max_f1" }, gridSize = 60) {
    const q = encodeURIComponent(JSON.stringify(policy));
    const { data } = await http.get(
      `${API}/tune/course/${courseId}?policy=${q}&grid_size=${gridSize}`
    );
    return data;
  },
  async applyThreshold(courseId, payload) {
    const { data } = await http.post(
      `${API}/tune/course/${courseId}/apply`,
      payload
    );
    return data;
  },
};

import http from "./http";

const API = "/profile";

export default {
  async me() {
    const { data } = await http.get(`${API}/me`);
    return data.user ?? data;
  },
  async updateEmail(email) {
    const { data } = await http.put(`${API}/email`, { email });
    return data.user ?? data;
  },
  async changePassword(payload) {
    const { data } = await http.post(`${API}/change-password`, payload);
    return data;
  },
};

import http from "./http";

const API = "/auth";

export default {
  async login(email, password) {
    const { data } = await http.post(`${API}/login`, { email, password });
    if (data?.token) localStorage.setItem("token", data.token);
    return data;
  },
  async register({ email, password, roleId = 2 }) {
    const { data } = await http.post(`${API}/register`, {
      email,
      password,
      roleId,
    });
    return data;
  },
  async getUser() {
    const { data } = await http.get(`${API}/user`);
    return data;
  },
  async logout() {
    const { data } = await http.post(`${API}/logout`);
    localStorage.removeItem("token");
    return data;
  },
  isAuthenticated() {
    return !!localStorage.getItem("token");
  },
};

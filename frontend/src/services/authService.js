import http from "./http";
import { decodeJwt } from "../utils/jwt";
import { connectWithUser, getSocket } from "../sockets/socket";
import notif from "../stores/notifications";

const API = "/auth";

export default {
  async login(email, password) {
    const { data } = await http.post(`${API}/login`, { email, password });
    if (data?.token) {
      localStorage.setItem("token", data.token);
      window.dispatchEvent(new Event("auth-changed"));
      const payload = decodeJwt(data.token);
      if (payload?.userId) {
        connectWithUser(payload.userId);
        notif.bindSocket();
        await notif.loadUnread();
      }
    }
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
    window.dispatchEvent(new Event("auth-changed"));
    try {
      const s = getSocket();
      if (s && s.connected) s.disconnect();
    } catch {}
    return data;
  },
  isAuthenticated() {
    return !!localStorage.getItem("token");
  },
};

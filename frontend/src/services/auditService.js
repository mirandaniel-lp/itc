import http from "./http";
const API = "/audit";

export default {
  async getEvents(params) {
    const { data } = await http.get(`${API}/events`, { params });
    return data;
  },
  async getEvent(id) {
    const { data } = await http.get(`${API}/events/${id}`);
    return data.event ?? data;
  },
  async createEvent(payload) {
    const { data } = await http.post(`${API}/events`, payload);
    return data.event ?? data;
  },
  async getSessions(params) {
    const { data } = await http.get(`${API}/sessions`, { params });
    return data;
  },
  async getSession(id) {
    const { data } = await http.get(`${API}/sessions/${id}`);
    return data.session ?? data;
  },
  async createSession(payload) {
    const { data } = await http.post(`${API}/sessions`, payload);
    return data.session ?? data;
  },
  async endSession(id) {
    const { data } = await http.put(`${API}/sessions/${id}/end`);
    return data.session ?? data;
  },
};

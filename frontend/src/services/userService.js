import http from "./http";

const API = "/users";

export default {
  async getUsers(params) {
    const { data } = await http.get(API, { params });
    return data.users ?? data;
  },
  async getUser(id) {
    const { data } = await http.get(`${API}/${id}`);
    return data.user ?? data;
  },
  async updateUser(id, payload) {
    const { data } = await http.put(`${API}/${id}`, payload);
    return data.user ?? data;
  },
  async deleteUser(id) {
    const { data } = await http.delete(`${API}/${id}`);
    return data.message ?? data;
  },
};

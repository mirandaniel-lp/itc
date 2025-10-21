import http from "./http";

const API = "/modalities";

export default {
  async getAll(params) {
    const { data } = await http.get(API, { params });
    return data.modalities ?? data;
  },
};

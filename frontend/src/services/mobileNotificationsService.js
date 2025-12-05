import http from "./http";

const API = "/mobile/notifications";

export default {
  sendToStudent(studentId, payload) {
    return http.post(`${API}/send-student/${studentId}`, payload);
  },
  registerToken(token, appUsername = null) {
    return http.post(`${API}/register-token`, { token, appUsername });
  },
};

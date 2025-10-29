import http from "./http";

export function apiGetMyNotifications({ unread = false, limit = 20 } = {}) {
  return http.get("/notifications/me", {
    params: { unread: unread ? 1 : 0, limit },
  });
}

export function apiGetUnreadCount() {
  return http.get("/notifications/me/unread");
}

export function apiRead(recId) {
  return http.post(`/notifications/me/${recId}/read`);
}

export function apiReadAll() {
  return http.post("/notifications/me/read-all");
}

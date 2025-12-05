import { reactive } from "vue";
import {
  apiGetMyNotifications,
  apiGetUnreadCount,
  apiRead,
  apiReadAll,
} from "../services/notifications";
import { initSocket, getSocket } from "../sockets/socket";

const state = reactive({
  items: [],
  unread: 0,
  ready: false,
  open: false,
});

function shapeSocketItem(payload) {
  return {
    id: Date.now(),
    readAt: null,
    notification: {
      id: payload.id,
      title: payload.title,
      message: payload.message,
      level: payload.level,
      data: payload.data,
      created_at: payload.created_at,
    },
  };
}

async function load({ limit = 20 } = {}) {
  try {
    const { data } = await apiGetMyNotifications({ limit });
    state.items = data.items || [];
    state.ready = true;
  } catch {
    state.items = [];
    state.ready = true;
  }
}

async function loadUnread() {
  try {
    const { data } = await apiGetUnreadCount();
    state.unread = data.unread ?? 0;
  } catch {
    state.unread = 0;
  }
}

async function markRead(recId) {
  await apiRead(recId);
  const it = state.items.find((x) => x.id === recId);
  if (it && !it.readAt) {
    it.readAt = new Date().toISOString();
    if (state.unread > 0) state.unread--;
  }
}

async function markAll() {
  await apiReadAll();
  state.items = state.items.map((x) => ({
    ...x,
    readAt: x.readAt || new Date().toISOString(),
  }));
  state.unread = 0;
}

function bindSocket() {
  const s = getSocket() || initSocket();
  s.off("notifications:new");
  s.on("notifications:new", (payload) => {
    state.items.unshift(shapeSocketItem(payload));
    state.unread++;
  });
}

export default { state, load, loadUnread, markRead, markAll, bindSocket };

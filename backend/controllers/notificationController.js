import {
  listMyNotifications,
  countMyUnread,
  markRead,
  markReadAll,
} from "../services/notificationService.js";
import { serialize } from "../utils/serializer.js";

export async function getMy(req, res, next) {
  try {
    const unread = String(req.query.unread || "0") === "1";
    const limit = Number(req.query.limit || 20);
    const items = await listMyNotifications(req.user.id, { unread, limit });
    res.json(serialize({ ok: true, items }));
  } catch (e) {
    next(e);
  }
}

export async function getMyUnreadCount(req, res, next) {
  try {
    const out = await countMyUnread(req.user.id);
    res.json(serialize({ ok: true, ...out }));
  } catch (e) {
    next(e);
  }
}

export async function postRead(req, res, next) {
  try {
    await markRead(req.user.id, req.params.recId);
    res.json(serialize({ ok: true }));
  } catch (e) {
    next(e);
  }
}

export async function postReadAll(req, res, next) {
  try {
    await markReadAll(req.user.id);
    res.json(serialize({ ok: true }));
  } catch (e) {
    next(e);
  }
}

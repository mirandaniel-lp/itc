import { tuneThresholdForCourse } from "../services/iforestEvalService.js";
import { PrismaClient } from "@prisma/client";
import { serialize } from "../utils/serializer.js";

const prisma = new PrismaClient();

export async function tuneCourse(req, res, next) {
  try {
    const { courseId } = req.params;
    const policy = req.query.policy
      ? JSON.parse(req.query.policy)
      : { mode: "max_f1" };
    const grid_size = Number(req.query.grid_size || 60);
    const out = await tuneThresholdForCourse(Number(courseId), {
      policy,
      grid_size,
    });
    res.json(out);
  } catch (err) {
    next(err);
  }
}

export async function applyThreshold(req, res, next) {
  try {
    const { courseId } = req.params;
    const { threshold, note } = req.body || {};
    if (threshold === undefined || threshold === null)
      return res.status(400).json({ ok: false, message: "threshold required" });
    const version = `IF-COURSE-${courseId}-${new Date()
      .toISOString()
      .replace(/[-:.TZ]/g, "")}`;
    const created = await prisma.iForestModel.create({
      data: {
        version,
        features: JSON.stringify([]),
        contamination: 0,
        threshold: Number(threshold),
      },
    });
    return res.json({
      ok: true,
      applied: true,
      threshold: Number(threshold),
      version,
      created: serialize(created),
    });
  } catch (err) {
    next(err);
  }
}

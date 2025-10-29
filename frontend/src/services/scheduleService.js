import http from "@/services/http";

const API = "/schedules";

export default {
  async getCalendar({ from, to, courseId, teacherId, programId } = {}) {
    const { data } = await http.get(`${API}/calendar`, {
      params: {
        from,
        to,
        courseId: courseId || undefined,
        teacherId: teacherId || undefined,
        programId: programId || undefined,
      },
    });
    if (!data?.ok) throw new Error(data?.error || "Error al cargar calendario");
    return data.events || [];
  },

  async listByCourse(courseId) {
    const { data } = await http.get(API, { params: { courseId } });
    if (!data?.ok) throw new Error(data?.error || "Error listando horarios");
    return data.items || [];
  },

  async create({ courseId, classroomId, weekday, start_time, end_time }) {
    const { data } = await http.post(API, {
      courseId: Number(courseId),
      classroomId: Number(classroomId),
      weekday,
      start_time,
      end_time,
    });
    if (!data?.ok)
      throw new Error(data?.error || "No se pudo crear el horario");
    return data.created;
  },

  async update(id, { classroomId, weekday, start_time, end_time }) {
    const { data } = await http.patch(`${API}/${id}`, {
      classroomId: Number(classroomId),
      weekday,
      start_time,
      end_time,
    });
    if (!data?.ok) throw new Error(data?.error || "No se pudo actualizar");
    return data.updated;
  },

  async remove(scheduleId) {
    const { data } = await http.delete(`${API}/${scheduleId}`);
    if (!data?.ok) throw new Error(data?.error || "No se pudo eliminar");
    return true;
  },
};

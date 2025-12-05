<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="text-2xl font-bold">Mis Cursos</div>
      <n-button quaternary @click="exportCSV">Exportar CSV</n-button>
    </div>
    <n-card>
      <div class="grid md:grid-cols-3 gap-3">
        <n-input v-model:value="query" placeholder="Buscar por nombre..." />
        <n-select
          v-model:value="modality"
          :options="modalityOptions"
          placeholder="Todas las modalidades"
          clearable
        />
        <n-select
          v-model:value="status"
          :options="statusOptions"
          placeholder="Todos los estados"
          clearable
        />
      </div>
    </n-card>
    <div class="grid md:grid-cols-3 gap-4">
      <n-card v-for="c in filtered" :key="c.id">
        <div class="flex items-start justify-between">
          <div class="text-lg font-semibold">{{ c.name }}</div>
          <n-tag type="success" v-if="c.status">Activo</n-tag>
          <n-tag type="default" v-else>Finalizado</n-tag>
        </div>
        <div class="text-xs text-gray-400 mt-1">
          {{ c.modality?.name || "-" }}
        </div>
        <div class="text-xs text-gray-400 mt-1">
          {{ formatDate(c.start_date) }} -
          {{ c.end_date ? formatDate(c.end_date) : "-" }}
        </div>
        <div class="text-xs text-gray-400 mt-1">
          {{ c.enrollments?.length || 0 }} estudiantes
        </div>
        <div class="grid grid-cols-3 gap-2 mt-4">
          <n-button secondary @click="openStudentsModal(c)"
            >Estudiantes</n-button
          >
          <n-button secondary @click="openActivitiesModal(c)"
            >Actividades</n-button
          >
          <n-button secondary @click="openAttendancesModal(c)"
            >Asistencias</n-button
          >
        </div>
      </n-card>
    </div>
    <div v-if="!filtered.length" class="text-gray-500">No hay cursos.</div>

    <n-modal
      v-model:show="studentsModal.show"
      preset="card"
      title="Estudiantes"
      style="width: 900px; max-width: 95%"
    >
      <div class="flex items-center gap-3 mb-4">
        <div class="text-lg font-bold">
          {{ studentsModal.course?.name }} ({{
            studentsModal.course?.parallel
          }})
        </div>
        <div class="ml-auto flex gap-2">
          <n-input
            v-model:value="studentsModal.q"
            placeholder="Buscar..."
            size="small"
            @input="filterStudents"
          />
          <n-button size="small" @click="exportStudentsCSV">Exportar</n-button>
        </div>
      </div>
      <div class="max-h-[60vh] overflow-auto">
        <table class="w-full text-sm">
          <thead class="text-left text-gray-400">
            <tr>
              <th class="py-2">Nombre</th>
              <th class="py-2">CI</th>
              <th class="py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="s in studentsModal.filtered"
              :key="s.id"
              class="border-t border-white/10"
            >
              <td class="py-2">{{ s.name }} {{ s.last_name }}</td>
              <td class="py-2">{{ s.ci || "-" }}</td>
              <td class="py-2 text-right">
                <div class="flex justify-end gap-2">
                  <n-button size="small" @click="viewStudentAttendances(s)"
                    >Asistencias</n-button
                  >
                  <n-button size="small" @click="viewStudentGrades(s)"
                    >Calificaciones</n-button
                  >
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="!studentsModal.filtered.length" class="text-gray-500 mt-4">
          No hay estudiantes.
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <n-button @click="studentsModal.show = false">Cerrar</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="activitiesModal.show"
      preset="card"
      title="Actividades"
      style="width: 1000px; max-width: 95%"
    >
      <div class="flex items-center gap-3 mb-4">
        <div class="text-lg font-bold">
          {{ activitiesModal.course?.name }} ({{
            activitiesModal.course?.parallel
          }})
        </div>
        <div class="ml-auto flex gap-2">
          <n-select
            size="small"
            v-model:value="activitiesModal.typeFilter"
            :options="activityTypeOptions"
            placeholder="Tipo"
            clearable
            @update:value="filterActivities"
          />
          <n-input
            v-model:value="activitiesModal.q"
            placeholder="Buscar..."
            size="small"
            @input="filterActivities"
          />
          <n-button size="small" @click="exportActivitiesCSV"
            >Exportar</n-button
          >
        </div>
      </div>
      <div class="max-h-[60vh] overflow-auto">
        <table class="w-full text-sm">
          <thead class="text-left text-gray-400">
            <tr>
              <th class="py-2">Título</th>
              <th class="py-2">Tipo</th>
              <th class="py-2">Fecha</th>
              <th class="py-2">Pond.</th>
              <th class="py-2">Estado</th>
              <th class="py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="a in activitiesModal.filtered"
              :key="a.id"
              class="border-t border-white/10"
            >
              <td class="py-2">{{ a.title }}</td>
              <td class="py-2">{{ a.type }}</td>
              <td class="py-2">
                {{ a.due_date ? formatDate(a.due_date) : "-" }}
              </td>
              <td class="py-2">{{ a.weight_pct ?? "-" }}</td>
              <td class="py-2">
                <n-tag type="success" v-if="a.is_published">Publicada</n-tag>
                <n-tag v-else>Borrador</n-tag>
              </td>
              <td class="py-2 text-right">
                <div class="flex justify-end gap-2">
                  <n-button size="small" @click="editActivity(a)"
                    >Editar</n-button
                  >
                  <n-button
                    size="small"
                    type="primary"
                    @click="openGradesModal(activitiesModal.course, a)"
                    >Ver calificaciones</n-button
                  >
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="!activitiesModal.filtered.length" class="text-gray-500 mt-4">
          No hay actividades.
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <n-button @click="activitiesModal.show = false">Cerrar</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="attendancesModal.show"
      preset="card"
      title="Asistencias"
      style="width: 1000px; max-width: 95%"
    >
      <div class="flex items-center gap-3 mb-4">
        <div class="text-lg font-bold">
          {{ attendancesModal.course?.name }} ({{
            attendancesModal.course?.parallel
          }})
        </div>
        <div class="ml-auto flex gap-2">
          <n-date-picker
            size="small"
            v-model:value="attendancesModal.date"
            type="date"
            @update:value="loadAttendances"
          />
          <n-select
            size="small"
            v-model:value="attendancesModal.statusFilter"
            :options="attendanceStatusOptions"
            placeholder="Filtrar estado"
            clearable
            @update:value="applyAttendanceFilter"
          />
          <n-button size="small" @click="exportAttendancesCSV"
            >Exportar</n-button
          >
        </div>
      </div>
      <div class="max-h-[60vh] overflow-auto">
        <table class="w-full text-sm">
          <thead class="text-left text-gray-400">
            <tr>
              <th class="py-2">Estudiante</th>
              <th class="py-2">CI</th>
              <th class="py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in attendancesModal.filtered"
              :key="r.studentId"
              class="border-t border-white/10"
            >
              <td class="py-2">
                {{ r.student?.name }} {{ r.student?.last_name }}
              </td>
              <td class="py-2">{{ r.student?.ci || "-" }}</td>
              <td class="py-2">{{ r.status }}</td>
            </tr>
          </tbody>
        </table>
        <div
          v-if="!attendancesModal.filtered.length"
          class="text-gray-500 mt-4"
        >
          No hay registros.
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <n-button @click="attendancesModal.show = false">Cerrar</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="gradesModal.show"
      preset="card"
      title="Calificaciones"
      style="width: 1000px; max-width: 95%"
    >
      <div class="flex items-center gap-3 mb-4">
        <div class="text-lg font-bold">
          {{ gradesModal.course?.name }} ({{ gradesModal.course?.parallel }})
        </div>
        <div class="ml-auto flex gap-2">
          <n-select
            size="small"
            v-model:value="gradesModal.activityId"
            :options="gradesModal.activityOptions"
            placeholder="Actividad"
            @update:value="loadGradesForModal"
          />
          <n-select
            size="small"
            v-model:value="gradesModal.publishedFilter"
            :options="gradesPublishedOptions"
            placeholder="Publicado"
            clearable
            @update:value="applyGradesFilter"
          />
          <n-button size="small" @click="exportGradesCSV">Exportar</n-button>
        </div>
      </div>
      <div class="max-h-[60vh] overflow-auto">
        <table class="w-full text-sm">
          <thead class="text-left text-gray-400">
            <tr>
              <th class="py-2">Estudiante</th>
              <th class="py-2">CI</th>
              <th class="py-2">Nota</th>
              <th class="py-2">Comentario</th>
              <th class="py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in gradesModal.filtered"
              :key="r.studentId"
              class="border-t border-white/10"
            >
              <td class="py-2">
                {{ r.student?.name }} {{ r.student?.last_name }}
              </td>
              <td class="py-2">{{ r.student?.ci || "-" }}</td>
              <td class="py-2">{{ r.score !== null ? r.score : "-" }}</td>
              <td class="py-2">{{ r.feedback || "-" }}</td>
              <td class="py-2">
                <n-tag type="success" v-if="r.is_published">Publicado</n-tag
                ><n-tag v-else>Pendiente</n-tag>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="!gradesModal.filtered.length" class="text-gray-500 mt-4">
          No hay calificaciones.
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <n-button @click="gradesModal.show = false">Cerrar</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import {
  NCard,
  NButton,
  NInput,
  NSelect,
  NTag,
  NModal,
  NDatePicker,
} from "naive-ui";
import TeacherSessionService from "@/services/teacherSessionService";

const router = useRouter();
const courses = ref([]);
const query = ref("");
const modality = ref(null);
const status = ref(null);

async function load() {
  courses.value = await TeacherSessionService.getCourses();
}

load();

const modalityOptions = computed(() => {
  const set = new Map();
  courses.value.forEach((c) => {
    if (c.modality) set.set(c.modality.id, c.modality.name);
  });
  return Array.from(set.entries()).map(([value, label]) => ({ label, value }));
});
const statusOptions = [
  { label: "Activos", value: "active" },
  { label: "Inactivos", value: "inactive" },
];

const filtered = computed(() => {
  return courses.value.filter((c) => {
    const byQ = (c.name || "")
      .toLowerCase()
      .includes((query.value || "").toLowerCase());
    const byM = modality.value
      ? c.modalityId?.toString() === modality.value.toString()
      : true;
    const byS =
      status.value === "active"
        ? c.status
        : status.value === "inactive"
        ? !c.status
        : true;
    return byQ && byM && byS;
  });
});

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return d;
  }
}

function exportCSV() {
  const rows = [
    ["Curso", "Modalidad", "Inicio", "Fin", "Estudiantes", "Estado"],
  ];
  courses.value.forEach((c) =>
    rows.push([
      c.name,
      c.modality?.name || "",
      formatDate(c.start_date),
      c.end_date ? formatDate(c.end_date) : "",
      (c.enrollments?.length || 0).toString(),
      c.status ? "Activo" : "Finalizado",
    ])
  );
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cursos.csv";
  a.click();
  URL.revokeObjectURL(url);
}

const studentsModal = ref({
  show: false,
  course: null,
  list: [],
  filtered: [],
  q: "",
});
const activitiesModal = ref({
  show: false,
  course: null,
  list: [],
  filtered: [],
  q: "",
  typeFilter: null,
});
const attendancesModal = ref({
  show: false,
  course: null,
  list: [],
  filtered: [],
  date: null,
  statusFilter: null,
});
const gradesModal = ref({
  show: false,
  course: null,
  list: [],
  filtered: [],
  activityId: null,
  activityOptions: [],
  publishedFilter: null,
});

const activityTypeOptions = [
  { label: "Examen", value: "EXAMEN" },
  { label: "Práctica", value: "PRACTICA" },
  { label: "Tarea", value: "TAREA" },
  { label: "Proyecto", value: "PROYECTO" },
  { label: "Otro", value: "OTRO" },
];

const attendanceStatusOptions = [
  { label: "Presente", value: "PRESENTE" },
  { label: "Ausente", value: "AUSENTE" },
  { label: "Tarde", value: "TARDE" },
  { label: "Licencia", value: "LICENCIA" },
];

const gradesPublishedOptions = [
  { label: "Publicado", value: true },
  { label: "Pendiente", value: false },
];

async function openStudentsModal(course) {
  studentsModal.value.course = course;
  studentsModal.value.show = true;
  studentsModal.value.q = "";
  try {
    const list = await TeacherSessionService.getCourseStudents(course.id);
    studentsModal.value.list = list;
    studentsModal.value.filtered = list;
  } catch {
    studentsModal.value.list = [];
    studentsModal.value.filtered = [];
  }
}

function filterStudents() {
  const q = (studentsModal.value.q || "").trim().toLowerCase();
  studentsModal.value.filtered = studentsModal.value.list.filter((s) => {
    const name = `${s.name} ${s.last_name}`.toLowerCase();
    const ci = (s.ci || "").toLowerCase();
    return !q || name.includes(q) || ci.includes(q);
  });
}

function exportStudentsCSV() {
  const rows = [["Nombre", "CI"]];
  studentsModal.value.filtered.forEach((s) =>
    rows.push([`${s.name} ${s.last_name}`, s.ci || ""])
  );
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `estudiantes_curso_${studentsModal.value.course?.id || "0"}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function openActivitiesModal(course) {
  activitiesModal.value.course = course;
  activitiesModal.value.show = true;
  activitiesModal.value.q = "";
  activitiesModal.value.typeFilter = null;
  try {
    const acts = await TeacherSessionService.getActivities({
      courseId: course.id,
    });
    activitiesModal.value.list = acts;
    activitiesModal.value.filtered = acts;
  } catch {
    activitiesModal.value.list = [];
    activitiesModal.value.filtered = [];
  }
}

function filterActivities() {
  const q = (activitiesModal.value.q || "").trim().toLowerCase();
  const type = activitiesModal.value.typeFilter;
  activitiesModal.value.filtered = activitiesModal.value.list.filter((a) => {
    const inType = !type || a.type === type;
    const inText = !q || (a.title || "").toLowerCase().includes(q);
    return inType && inText;
  });
}

function exportActivitiesCSV() {
  const rows = [["Título", "Tipo", "Fecha", "Pond.", "Estado"]];
  activitiesModal.value.filtered.forEach((a) =>
    rows.push([
      a.title,
      a.type || "",
      a.due_date ? formatDate(a.due_date) : "",
      a.weight_pct ?? "",
      a.is_published ? "Publicada" : "Borrador",
    ])
  );
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `actividades_curso_${
    activitiesModal.value.course?.id || "0"
  }.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function editActivity(a) {
  router.push({
    path: "/teacher/activities",
    query: { activityId: a.id, courseId: a.courseId },
  });
}

async function openAttendancesModal(course) {
  attendancesModal.value.course = course;
  attendancesModal.value.show = true;
  attendancesModal.value.date = new Date().toISOString().slice(0, 10);
  attendancesModal.value.statusFilter = null;
  await loadAttendances();
}

async function loadAttendances() {
  if (!attendancesModal.value.course || !attendancesModal.value.date) {
    attendancesModal.value.list = [];
    attendancesModal.value.filtered = [];
    return;
  }
  try {
    const records = await TeacherSessionService.getAttendance(
      attendancesModal.value.course.id,
      attendancesModal.value.date
    );
    attendancesModal.value.list = records;
    applyAttendanceFilter();
  } catch {
    attendancesModal.value.list = [];
    attendancesModal.value.filtered = [];
  }
}

function applyAttendanceFilter() {
  const f = attendancesModal.value.statusFilter;
  attendancesModal.value.filtered = (attendancesModal.value.list || []).filter(
    (r) => {
      return f ? r.status === f : true;
    }
  );
}

function exportAttendancesCSV() {
  const rows = [["Estudiante", "CI", "Estado"]];
  attendancesModal.value.filtered.forEach((r) =>
    rows.push([
      `${r.student?.name || ""} ${r.student?.last_name || ""}`,
      r.student?.ci || "",
      r.status,
    ])
  );
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `asistencias_curso_${attendancesModal.value.course?.id || "0"}_${
    attendancesModal.value.date || ""
  }.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function openGradesModal(course, activity = null) {
  gradesModal.value.course = course;
  gradesModal.value.show = true;
  gradesModal.value.activityId = activity ? Number(activity.id) : null;
  gradesModal.value.publishedFilter = null;
  try {
    const acts = await TeacherSessionService.getActivities({
      courseId: course.id,
    });
    gradesModal.value.activityOptions = acts.map((a) => ({
      label: a.title,
      value: Number(a.id),
    }));
    if (gradesModal.value.activityId) {
      await loadGradesForModal();
    } else {
      gradesModal.value.list = [];
      gradesModal.value.filtered = [];
    }
  } catch {
    gradesModal.value.activityOptions = [];
    gradesModal.value.list = [];
    gradesModal.value.filtered = [];
  }
}

async function loadGradesForModal() {
  if (!gradesModal.value.activityId) {
    gradesModal.value.list = [];
    gradesModal.value.filtered = [];
    return;
  }
  try {
    const list = await TeacherSessionService.getGrades(
      gradesModal.value.activityId
    );
    gradesModal.value.list = list;
    applyGradesFilter();
  } catch {
    gradesModal.value.list = [];
    gradesModal.value.filtered = [];
  }
}

function applyGradesFilter() {
  const f = gradesModal.value.publishedFilter;
  gradesModal.value.filtered = (gradesModal.value.list || []).filter((g) => {
    return f === null || f === undefined ? true : g.is_published === f;
  });
}

function exportGradesCSV() {
  const rows = [["Estudiante", "CI", "Nota", "Comentario", "Publicado"]];
  gradesModal.value.filtered.forEach((r) =>
    rows.push([
      `${r.student?.name || ""} ${r.student?.last_name || ""}`,
      r.student?.ci || "",
      r.score ?? "",
      r.feedback ?? "",
      r.is_published ? "Sí" : "No",
    ])
  );
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `calificaciones_curso_${gradesModal.value.course?.id || "0"}_${
    gradesModal.value.activityId || "0"
  }.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function viewStudentAttendances(student) {
  await openAttendancesModal(studentsModal.value.course);
  attendancesModal.value.filtered = attendancesModal.value.list.filter(
    (r) => Number(r.studentId) === Number(student.id)
  );
}

async function viewStudentGrades(student) {
  await openGradesModal(studentsModal.value.course);
  if (gradesModal.value.activityOptions.length) {
    gradesModal.value.activityId = gradesModal.value.activityOptions[0].value;
    await loadGradesForModal();
    gradesModal.value.filtered = gradesModal.value.list.filter(
      (g) => Number(g.studentId) === Number(student.id)
    );
  }
}
</script>

<style scoped></style>

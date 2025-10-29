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
        <div class="grid grid-cols-2 gap-2 mt-4">
          <n-button secondary @click="goStudents(c.id)">Estudiantes</n-button>
          <n-button secondary @click="goActivities(c.id)">Actividades</n-button>
          <n-button secondary @click="goAttendance(c.id)">Asistencias</n-button>
          <n-button type="primary" @click="goGrades(c.id)">Calificar</n-button>
        </div>
      </n-card>
    </div>
    <div v-if="!filtered.length" class="text-gray-500">No hay cursos.</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { NCard, NButton, NInput, NSelect, NTag } from "naive-ui";
import TeacherSessionService from "@/services/teacherSessionService";

const router = useRouter();
const courses = ref([]);
const query = ref("");
const modality = ref(null);
const status = ref(null);

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
    const byQ = c.name
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
function goActivities(courseId) {
  router.push({ path: "/teacher/activities", query: { courseId } });
}
function goStudents(courseId) {
  router.push({ path: "/teacher/students", query: { courseId } });
}
function goGrades(courseId) {
  router.push({ path: "/teacher/grades", query: { courseId } });
}
function goAttendance(courseId) {
  router.push({ path: "/teacher/attendances", query: { courseId } });
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

async function load() {
  courses.value = await TeacherSessionService.getCourses();
}
onMounted(load);
</script>

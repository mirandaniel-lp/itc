<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="text-2xl font-bold">Estudiantes</div>
      <n-button quaternary @click="exportCSV">Exportar CSV</n-button>
    </div>

    <n-card>
      <div class="grid md:grid-cols-3 gap-3">
        <n-input
          v-model:value="q"
          placeholder="Buscar por nombre o Carnet de Identidad..."
        />
        <n-select
          v-model:value="courseId"
          :options="courseOptions"
          placeholder="Todos los cursos"
          clearable
        />
        <n-select
          v-model:value="state"
          :options="stateOptions"
          placeholder="Todos los estados"
          clearable
        />
      </div>
    </n-card>

    <n-card>
      <table class="w-full text-sm">
        <thead class="text-left text-gray-400">
          <tr>
            <th class="py-2">Nombre</th>
            <th class="py-2">Carnet de Identidad</th>
            <th class="py-2">Curso</th>
            <th class="py-2">% Asistencia</th>
            <th class="py-2">Promedio</th>
            <th class="py-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="s in tableRows"
            :key="s.key"
            class="border-t border-white/10"
          >
            <td class="py-3 font-medium">{{ s.name }}</td>
            <td class="py-3">{{ s.ci || "-" }}</td>
            <td class="py-3">{{ s.courseName || "-" }}</td>
            <td class="py-3">{{ s.attendancePct ?? "-" }}</td>
            <td class="py-3">{{ s.average ?? "-" }}</td>
            <td class="py-3">
              <div class="flex justify-end gap-2">
                <n-button size="small" @click="goAttendance(s.courseId)"
                  >Ver asistencias</n-button
                >
                <n-button
                  size="small"
                  type="primary"
                  @click="goGrades(s.courseId)"
                  >Ver calificaciones</n-button
                >
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!tableRows.length" class="text-gray-500 mt-4">
        No hay estudiantes.
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { NCard, NButton, NInput, NSelect } from "naive-ui";
import TeacherSessionService from "@/services/teacherSessionService";

const router = useRouter();
const route = useRoute();
const q = ref("");
const state = ref(null);
const stateOptions = [
  { label: "Activos", value: "active" },
  { label: "Inactivos", value: "inactive" },
];
const courses = ref([]);
const courseId = ref(
  route.query.courseId ? Number(route.query.courseId) : null
);
const courseOptions = computed(() =>
  courses.value.map((c) => ({ label: c.name, value: Number(c.id) }))
);
const studentsByCourse = ref({});

const tableRows = computed(() => {
  const rows = [];
  Object.keys(studentsByCourse.value).forEach((cid) => {
    studentsByCourse.value[cid].forEach((s) =>
      rows.push({
        key: `${cid}-${s.id}`,
        name: `${s.name} ${s.last_name}`,
        ci: s.ci,
        courseId: Number(cid),
        courseName: courses.value.find((c) => Number(c.id) === Number(cid))
          ?.name,
        attendancePct: s.attendancePct,
        average: s.average,
      })
    );
  });
  return rows
    .filter((r) =>
      courseId.value ? Number(r.courseId) === Number(courseId.value) : true
    )
    .filter(
      (r) =>
        r.name.toLowerCase().includes(q.value.toLowerCase()) ||
        (r.ci || "").includes(q.value)
    )
    .filter((r) =>
      state.value === "active"
        ? true
        : state.value === "inactive"
        ? false
        : true
    );
});

function exportCSV() {
  const rows = [["Nombre", "CI", "Curso", "% Asistencia", "Promedio"]];
  tableRows.value.forEach((r) =>
    rows.push([
      r.name,
      r.ci || "",
      r.courseName || "",
      String(r.attendancePct || ""),
      String(r.average || ""),
    ])
  );
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "estudiantes.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function goGrades(cid) {
  router.push({ path: "/teacher/grades", query: { courseId: cid } });
}
function goAttendance(cid) {
  router.push({ path: "/teacher/attendances", query: { courseId: cid } });
}

async function load() {
  courses.value = await TeacherSessionService.getCourses();
  const map = {};
  for (const c of courses.value) {
    const list = await TeacherSessionService.getCourseStudents(c.id);
    map[c.id] = list.map((s) => ({
      ...s,
      attendancePct: s.attendancePct ?? null,
      average: s.average ?? null,
    }));
  }
  studentsByCourse.value = map;
}
onMounted(load);
</script>

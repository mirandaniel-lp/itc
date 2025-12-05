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
            <td class="py-3">% {{ s.attendancePct ?? "-" }}</td>
            <td class="py-3">{{ s.average ?? "-" }}</td>
            <td class="py-3">
              <div class="flex justify-end gap-2">
                <n-button size="small" @click="showAttendances(s)"
                  >Ver asistencias</n-button
                >
                <n-button size="small" type="primary" @click="showGrades(s)"
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

    <n-modal v-model:show="attendanceModal" :style="{ width: '640px' }">
      <n-card>
        <div class="flex items-start justify-between">
          <div>
            <div class="text-xl font-bold">Asistencias</div>
            <div class="text-sm text-gray-400 mt-1">{{ modalStudentName }}</div>
          </div>
          <div>
            <n-select
              v-model:value="attendanceFilter"
              :options="attendanceFilterOptions"
              placeholder="Filtrar"
            />
          </div>
        </div>

        <div class="mt-4">
          <table class="w-full text-sm">
            <thead class="text-gray-400">
              <tr>
                <th class="py-2">Fecha</th>
                <th class="py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="a in filteredAttendance"
                :key="a.id"
                class="border-t border-white/10"
              >
                <td class="py-2">{{ formatDate(a.date) }}</td>
                <td class="py-2">{{ a.status }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="!filteredAttendance.length" class="text-gray-500 mt-4">
            No hay registros.
          </div>
        </div>

        <div class="flex justify-end mt-4">
          <n-button @click="attendanceModal = false">Cerrar</n-button>
        </div>
      </n-card>
    </n-modal>

    <n-modal v-model:show="gradesModal" :style="{ width: '760px' }">
      <n-card>
        <div class="flex items-start justify-between">
          <div>
            <div class="text-xl font-bold">Calificaciones</div>
            <div class="text-sm text-gray-400 mt-1">{{ modalStudentName }}</div>
          </div>
          <div class="flex gap-2">
            <n-select
              v-model:value="gradesFilter"
              :options="gradesFilterOptions"
              placeholder="Filtrar por tipo"
            />
            <n-input
              v-model:value="gradesQ"
              placeholder="Buscar actividad..."
            />
          </div>
        </div>

        <div class="mt-4">
          <table class="w-full text-sm">
            <thead class="text-gray-400">
              <tr>
                <th class="py-2">Actividad</th>
                <th class="py-2">Tipo</th>
                <th class="py-2">Fecha</th>
                <th class="py-2">Nota</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="g in filteredGrades"
                :key="g.id"
                class="border-t border-white/10"
              >
                <td class="py-2">{{ g.activity.title }}</td>
                <td class="py-2">{{ g.activity.type }}</td>
                <td class="py-2">
                  {{ formatDate(g.created_at || g.activity.due_date) }}
                </td>
                <td class="py-2">{{ g.score }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="!filteredGrades.length" class="text-gray-500 mt-4">
            No hay calificaciones.
          </div>
        </div>

        <div class="flex justify-end mt-4">
          <n-button @click="gradesModal = false">Cerrar</n-button>
        </div>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { NCard, NButton, NInput, NSelect, NModal } from "naive-ui";
import TeacherSessionService from "@/services/teacherSessionService";

const q = ref("");
const gradesQ = ref("");
const state = ref(null);
const stateOptions = [
  { label: "Activos", value: "active" },
  { label: "Inactivos", value: "inactive" },
];
const courses = ref([]);
const courseId = ref(null);
const studentsByCourse = ref({});
const attendanceModal = ref(false);
const gradesModal = ref(false);
const attendanceList = ref([]);
const gradesList = ref([]);
const modalStudentName = ref("");
function formatDate(d) {
  if (!d) return "-";
  return new Date(d).toISOString().slice(0, 10);
}
const attendanceFilter = ref("ALL");
const attendanceFilterOptions = [
  { label: "Todas", value: "ALL" },
  { label: "Presentes", value: "PRESENTE" },
  { label: "Ausentes", value: "AUSENTE" },
  { label: "Tarde", value: "TARDE" },
  { label: "Licencia", value: "LICENCIA" },
];
const filteredAttendance = computed(() => {
  if (attendanceFilter.value === "ALL") return attendanceList.value;
  return attendanceList.value.filter(
    (a) => a.status === attendanceFilter.value
  );
});
const gradesFilter = ref("ALL");
const gradesFilterOptions = [
  { label: "Todas", value: "ALL" },
  { label: "EXAMEN", value: "EXAMEN" },
  { label: "PRACTICA", value: "PRACTICA" },
  { label: "TAREA", value: "TAREA" },
  { label: "PROYECTO", value: "PROYECTO" },
  { label: "OTRO", value: "OTRO" },
];
const filteredGrades = computed(() => {
  let list = gradesList.value;
  if (gradesFilter.value !== "ALL")
    list = list.filter(
      (g) => (g.activity?.type || "").toUpperCase() === gradesFilter.value
    );
  if (gradesQ.value)
    list = list.filter((g) =>
      (g.activity?.title || "")
        .toLowerCase()
        .includes(gradesQ.value.toLowerCase())
    );
  return list;
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
async function showAttendances(row) {
  modalStudentName.value = row.name;
  attendanceList.value = await TeacherSessionService.getStudentAttendances(
    row.courseId,
    row.id
  );
  attendanceFilter.value = "ALL";
  attendanceModal.value = true;
}
async function showGrades(row) {
  modalStudentName.value = row.name;
  gradesList.value = await TeacherSessionService.getStudentGrades(
    row.courseId,
    row.id
  );
  gradesFilter.value = "ALL";
  gradesQ.value = "";
  gradesModal.value = true;
}
const courseOptions = computed(() =>
  courses.value.map((c) => ({ label: c.name, value: Number(c.id) }))
);
const tableRows = computed(() => {
  const rows = [];
  Object.keys(studentsByCourse.value).forEach((cid) => {
    studentsByCourse.value[cid].forEach((s) =>
      rows.push({
        key: `${cid}-${s.id}`,
        id: s.id,
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

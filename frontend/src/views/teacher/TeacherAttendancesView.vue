<template>
  <div class="space-y-6">
    <div class="text-2xl font-bold">Asistencias</div>

    <n-card>
      <div class="grid md:grid-cols-2 gap-3">
        <n-select
          v-model:value="courseId"
          :options="courseOptions"
          placeholder="Curso"
        />
        <n-date-picker
          v-model:value="dateMs"
          type="date"
          :is-date-disabled="disableDate"
          placeholder="Selecciona fecha"
        />
      </div>
      <div class="grid md:grid-cols-5 gap-3 mt-4">
        <n-card size="small">
          <div class="text-xs text-gray-400">Presentes</div>
          <div class="text-2xl font-bold mt-1">{{ summary.presentes }}</div>
        </n-card>
        <n-card size="small">
          <div class="text-xs text-gray-400">Ausentes</div>
          <div class="text-2xl font-bold mt-1">{{ summary.ausentes }}</div>
        </n-card>
        <n-card size="small">
          <div class="text-xs text-gray-400">Tarde</div>
          <div class="text-2xl font-bold mt-1">{{ summary.tarde }}</div>
        </n-card>
        <n-card size="small">
          <div class="text-xs text-gray-400">Licencia</div>
          <div class="text-2xl font-bold mt-1">{{ summary.licencia }}</div>
        </n-card>
        <n-card size="small">
          <div class="text-xs text-gray-400">% Asistencia</div>
          <div class="text-2xl font-bold mt-1">{{ pctAttendance }}</div>
        </n-card>
      </div>
    </n-card>

    <div class="flex flex-wrap items-center gap-2">
      <n-button :disabled="!courseId" @click="markAll('PRESENTE')"
        >Marcar Todos Presente</n-button
      >
      <n-button :disabled="!courseId" @click="markAll('AUSENTE')"
        >Marcar Todos Ausente</n-button
      >
      <n-button :disabled="!courseId" @click="markAll('TARDE')"
        >Marcar Todos Tarde</n-button
      >
      <n-button :disabled="!courseId" @click="markAll('LICENCIA')"
        >Marcar Todos Licencia</n-button
      >
      <n-button type="primary" :disabled="!canSave" @click="save"
        >Guardar</n-button
      >
      <n-button quaternary @click="exportCSV">Exportar CSV</n-button>
    </div>

    <n-card>
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
            v-for="r in rows"
            :key="r.studentId"
            class="border-t border-white/10"
          >
            <td class="py-2 font-medium">{{ r.studentName }}</td>
            <td class="py-2">{{ r.ci || "-" }}</td>
            <td class="py-2">
              <n-select
                v-model:value="r.status"
                :options="statusOptions"
                class="w-48"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!rows.length" class="text-gray-500 mt-4">
        Selecciona curso y fecha.
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { NCard, NButton, NSelect, NDatePicker, useMessage } from "naive-ui";
import TeacherSessionService from "@/services/teacherSessionService";

const message = useMessage();
const route = useRoute();

const courses = ref([]);
const courseId = ref(
  route.query.courseId ? Number(route.query.courseId) : null
);
const courseOptions = computed(() =>
  courses.value.map((c) => ({ label: c.name, value: Number(c.id) }))
);

const dateMs = ref(Date.now());
const rows = ref([]);

const statusOptions = [
  { label: "Presente", value: "PRESENTE" },
  { label: "Ausente", value: "AUSENTE" },
  { label: "Tarde", value: "TARDE" },
  { label: "Licencia", value: "LICENCIA" },
];

const meta = ref({
  start_date: null,
  end_date: null,
  weekdays: [],
  holidays: [],
});

const summary = computed(() => {
  const s = { presentes: 0, ausentes: 0, tarde: 0, licencia: 0 };
  rows.value.forEach((r) => {
    if (r.status === "PRESENTE") s.presentes++;
    else if (r.status === "AUSENTE") s.ausentes++;
    else if (r.status === "TARDE") s.tarde++;
    else if (r.status === "LICENCIA") s.licencia++;
  });
  return s;
});
const pctAttendance = computed(() => {
  const total = rows.value.length || 1;
  const pres = summary.value.presentes;
  return `${Math.round((pres / total) * 100)}%`;
});

const disableDate = (ts) => {
  if (!courseId.value || !meta.value.start_date) return false;
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  const sd = new Date(meta.value.start_date);
  sd.setHours(0, 0, 0, 0);
  const ed = meta.value.end_date ? new Date(meta.value.end_date) : null;
  if (d < sd) return true;
  if (ed && d > ed) return true;
  const days = [
    "DOMINGO",
    "LUNES",
    "MARTES",
    "MIERCOLES",
    "JUEVES",
    "VIERNES",
    "SABADO",
  ];
  const w = days[d.getDay()];
  if (!meta.value.weekdays.includes(w)) return true;
  const key = d.toISOString().slice(0, 10);
  if ((meta.value.holidays || []).includes(key)) return true;
  return false;
};

const canSave = computed(() => {
  if (!courseId.value || !dateMs.value) return false;
  return !disableDate(dateMs.value);
});

watch(courseId, async () => {
  await loadMeta();
  await load();
});

watch(dateMs, async () => {
  await load();
});

function markAll(st) {
  if (!courseId.value) return;
  rows.value = rows.value.map((r) => ({ ...r, status: st }));
  message.success("Se marcó el estado para todos.");
}

function fmtDateParam() {
  return new Date(dateMs.value).toISOString().substring(0, 10);
}

function exportCSV() {
  const rowsOut = [["Estudiante", "CI", "Estado"]];
  rows.value.forEach((r) =>
    rowsOut.push([r.studentName, r.ci || "", r.status])
  );
  const csv = rowsOut.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "asistencias.csv";
  a.click();
  URL.revokeObjectURL(url);
}

async function loadMeta() {
  if (!courseId.value) {
    meta.value = {
      start_date: null,
      end_date: null,
      weekdays: [],
      holidays: [],
    };
    return;
  }
  meta.value = await TeacherSessionService.getAttendanceMeta(courseId.value);
}

async function load() {
  courses.value = courses.value.length
    ? courses.value
    : await TeacherSessionService.getCourses();
  if (!courseId.value || !dateMs.value) {
    rows.value = [];
    return;
  }
  if (disableDate(dateMs.value)) {
    rows.value = [];
    message.warning("Fecha no habilitada para tomar asistencia.");
    return;
  }
  const list = await TeacherSessionService.getCourseStudents(courseId.value);
  const regs = await TeacherSessionService.getAttendance(
    courseId.value,
    fmtDateParam()
  );
  const map = new Map(regs.map((r) => [Number(r.studentId), r]));
  rows.value = list.map((s) => ({
    studentId: s.id,
    studentName: `${s.name} ${s.last_name}`,
    ci: s.ci || "",
    status: map.get(Number(s.id))?.status || "PRESENTE",
  }));
}

async function save() {
  if (!canSave.value) {
    message.warning("Fecha no habilitada para tomar asistencia.");
    return;
  }
  await TeacherSessionService.saveAttendance(
    courseId.value,
    fmtDateParam(),
    rows.value.map((r) => ({ studentId: r.studentId, status: r.status }))
  );
  message.success("Asistencia guardada.");
  await load();
}

onMounted(load);
</script>

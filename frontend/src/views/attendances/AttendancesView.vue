<template>
  <app-layout>
    <div class="mx-auto max-w-6xl p-6 md:p-8 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl md:text-4xl font-extrabold">Asistencias</h1>
          <p class="text-sm text-white/60">{{ formattedDate }}</p>
        </div>
        <div class="flex gap-3">
          <n-select
            v-model:value="courseId"
            :options="courseOptions"
            placeholder="Seleccionar curso"
            class="w-72"
            size="small"
            virtual-scroll
          />
          <n-date-picker
            v-model:formatted-value="date"
            value-format="yyyy-MM-dd"
            type="date"
            size="small"
            clearable
            placeholder="Selecciona una fecha"
            :disabled="!courseId || !dateMin"
            :is-date-disabled="isOutOfRange"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div class="text-xs uppercase tracking-widest text-white/60">
            Total
          </div>
          <div class="mt-1 text-3xl font-extrabold">{{ totals.total }}</div>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div class="text-xs uppercase tracking-widest text-white/60">
            Presentes
          </div>
          <div class="mt-1 text-3xl font-extrabold text-emerald-400">
            {{ totals.presentes }}
          </div>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div class="text-xs uppercase tracking-widest text-white/60">
            Faltas
          </div>
          <div class="mt-1 text-3xl font-extrabold text-rose-400">
            {{ totals.faltas }}
          </div>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div class="text-xs uppercase tracking-widest text-white/60">
            Licencias
          </div>
          <div class="mt-1 text-3xl font-extrabold text-sky-400">
            {{ totals.licencias }}
          </div>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div class="text-xs uppercase tracking-widest text-white/60">
            Sin marcar
          </div>
          <div class="mt-1 text-3xl font-extrabold text-yellow-300">
            {{ totals.sinMarcar }}
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div class="flex items-center gap-3">
          <n-select
            v-model:value="massStatus"
            :options="statusOptions"
            placeholder="Selecciona un estado..."
            class="w-64"
            size="small"
            :disabled="!courseId || !date"
          />
          <n-button
            size="small"
            :disabled="!massStatus || !courseId || !date"
            @click="applyMass"
            >Aplicar a todos</n-button
          >
        </div>
      </div>

      <div class="rounded-2xl border border-white/10 bg-white/5">
        <div
          class="p-4 border-b border-white/10 text-sm uppercase tracking-widest text-white/70"
        >
          Lista de Estudiantes
        </div>
        <div class="divide-y divide-white/10">
          <div
            v-for="r in roster"
            :key="r.studentId"
            class="flex items-center justify-between px-4 py-3"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold"
              >
                {{ r.order }}
              </div>
              <div class="font-semibold">{{ r.fullName }}</div>
            </div>
            <div class="flex items-center gap-2">
              <n-tag
                :type="r.status === 'PRESENTE' ? 'success' : 'default'"
                round
                v-if="r.status === 'PRESENTE'"
                >Presente</n-tag
              >
              <n-tag
                :type="r.status === 'AUSENTE' ? 'error' : 'default'"
                round
                v-else-if="r.status === 'AUSENTE'"
                >Falta</n-tag
              >
              <n-tag
                :type="r.status === 'LICENCIA' ? 'info' : 'default'"
                round
                v-else-if="r.status === 'LICENCIA'"
                >Licencia</n-tag
              >
              <n-tag
                :type="r.status === 'TARDE' ? 'warning' : 'default'"
                round
                v-else-if="r.status === 'TARDE'"
                >Tarde</n-tag
              >
              <n-tag v-else round>Sin marcar</n-tag>
              <div class="w-px h-5 bg-white/10 mx-2"></div>
              <n-button
                tertiary
                size="small"
                :type="r.status === 'PRESENTE' ? 'success' : 'default'"
                @click="setStatusFor(r.studentId, 'PRESENTE')"
                >Presente</n-button
              >
              <n-button
                tertiary
                size="small"
                :type="r.status === 'AUSENTE' ? 'error' : 'default'"
                @click="setStatusFor(r.studentId, 'AUSENTE')"
                >Falta</n-button
              >
              <n-button
                tertiary
                size="small"
                :type="r.status === 'LICENCIA' ? 'info' : 'default'"
                @click="setStatusFor(r.studentId, 'LICENCIA')"
                >Licencia</n-button
              >
              <n-button
                tertiary
                size="small"
                :type="r.status === 'TARDE' ? 'warning' : 'default'"
                @click="setStatusFor(r.studentId, 'TARDE')"
                >Tarde</n-button
              >
            </div>
          </div>
        </div>
        <div class="p-4 border-t border-white/10 flex justify-end">
          <n-button
            type="primary"
            :loading="saving"
            :disabled="!courseId || !date"
            @click="save"
            >Guardar</n-button
          >
        </div>
      </div>
    </div>
  </app-layout>
</template>

<script setup>
import AppLayout from "@/layouts/AppLayout.vue";
import { ref, computed, onMounted, watch } from "vue";
import axios from "axios";
import attendanceService from "@/services/attendanceService";

const courseId = ref(null);
const date = ref(null);
const loading = ref(false);
const saving = ref(false);
const roster = ref([]);
const courseOptions = ref([]);
const massStatus = ref(null);
const dateMin = ref(null);
const dateMax = ref(null);

const statusOptions = [
  { label: "Presente", value: "PRESENTE" },
  { label: "Falta", value: "AUSENTE" },
  { label: "Licencia", value: "LICENCIA" },
  { label: "Tarde", value: "TARDE" },
];

const totals = computed(() => ({
  total: roster.value.length,
  presentes: roster.value.filter((r) => r.status === "PRESENTE").length,
  faltas: roster.value.filter((r) => r.status === "AUSENTE").length,
  licencias: roster.value.filter((r) => r.status === "LICENCIA").length,
  sinMarcar: roster.value.filter((r) => !r.status).length,
}));

const formattedDate = computed(() => {
  if (!date.value) return "Selecciona una fecha";
  const d = new Date(date.value);
  if (Number.isNaN(d.getTime())) return "Selecciona una fecha";
  return d.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

async function loadCourses() {
  const token = localStorage.getItem("token");
  const res = await axios.get("http://localhost:3000/api/courses", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const raw = res.data;
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.courses)
    ? raw.courses
    : Array.isArray(raw?.items)
    ? raw.items
    : Array.isArray(raw?.data)
    ? raw.data
    : [];
  courseOptions.value = list.map((c) => ({
    label: `${c.name}${c.parallel ? " - " + c.parallel : ""}`,
    value: String(c.id),
  }));
}

async function loadCourseDates() {
  dateMin.value = null;
  dateMax.value = null;
  date.value = null;
  if (!courseId.value) return;
  const info = await attendanceService.getCourseDates(courseId.value);
  const start = new Date(info.start_date);
  start.setHours(0, 0, 0, 0);
  dateMin.value = start.getTime();
  if (info.end_date) {
    const end = new Date(info.end_date);
    end.setHours(0, 0, 0, 0);
    dateMax.value = end.getTime();
  } else {
    dateMax.value = null;
  }
}

function isOutOfRange(ts) {
  if (!dateMin.value) return true;
  if (dateMax.value && ts > dateMax.value) return true;
  if (ts < dateMin.value) return true;
  return false;
}

async function loadRoster() {
  if (!courseId.value || !date.value) return;
  loading.value = true;
  try {
    const dataResp = await attendanceService.getRoster(
      courseId.value,
      date.value
    );
    roster.value = dataResp.roster.map((r) => ({
      order: r.order,
      studentId: String(r.studentId),
      fullName: r.fullName,
      status: r.status,
      attendanceId: r.attendanceId ? String(r.attendanceId) : null,
      checkinAt: r.checkinAt,
      checkoutAt: r.checkoutAt,
      justification: r.justification,
    }));
  } finally {
    loading.value = false;
  }
}

function setStatusFor(id, s) {
  const i = roster.value.findIndex((r) => r.studentId === id);
  if (i >= 0) roster.value[i].status = s;
}

function applyMass() {
  if (!massStatus.value) return;
  roster.value = roster.value.map((r) => ({ ...r, status: massStatus.value }));
}

async function save() {
  if (!courseId.value || !date.value) return;
  saving.value = true;
  try {
    const rows = roster.value.map((r) => ({
      studentId: r.studentId,
      status: r.status ?? "AUSENTE",
      checkinAt: r.checkinAt,
      checkoutAt: r.checkoutAt,
      justification: r.justification,
    }));
    await attendanceService.saveGrid(courseId.value, date.value, rows);
    await loadRoster();
  } finally {
    saving.value = false;
  }
}

const autoLoad = debounce(loadRoster, 250);

watch(courseId, async () => {
  await loadCourseDates();
});
watch(date, () => autoLoad());

onMounted(async () => {
  await loadCourses();
});
</script>

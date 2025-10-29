<template>
  <app-layout>
    <div class="min-h-screen bg-[#0f172a] p-10 text-white flex justify-center">
      <div
        class="w-full max-w-6xl bg-[#1e293b]/90 border border-[#334155] rounded-2xl p-10 shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
      >
        <h1 class="text-4xl font-extrabold text-center mb-8">
          Registrar Cursos
        </h1>
        <n-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-placement="top"
          require-mark-placement="right-hanging"
        >
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <n-form-item label="Nombre del Curso" path="name">
              <n-input
                v-model:value="form.name"
                size="large"
                clearable
                placeholder="Ej: Administración I"
              />
            </n-form-item>

            <n-form-item label="Paralelos" path="parallels">
              <n-select
                v-model:value="form.parallels"
                :options="parallelOptions"
                multiple
                max-tag-count="responsive"
                size="large"
                placeholder="Seleccione paralelos"
                @update:value="ensureParallels"
              />
            </n-form-item>

            <n-form-item label="Docente" path="teacherId">
              <n-select
                v-model:value="form.teacherId"
                :options="teacherOptions"
                filterable
                clearable
                size="large"
                placeholder="Seleccione docente"
              />
            </n-form-item>

            <n-form-item label="Modalidad" path="modalityId">
              <n-select
                v-model:value="form.modalityId"
                :options="modalityOptions"
                filterable
                clearable
                size="large"
                placeholder="Seleccione modalidad"
              />
            </n-form-item>

            <n-form-item label="Programa" path="programId">
              <n-select
                v-model:value="form.programId"
                :options="programOptions"
                filterable
                clearable
                size="large"
                placeholder="Seleccione programa"
              />
            </n-form-item>

            <n-form-item label="Periodo Académico" path="termId">
              <n-select
                v-model:value="form.termId"
                :options="termOptions"
                filterable
                clearable
                size="large"
                placeholder="Seleccione periodo"
              />
            </n-form-item>

            <n-form-item label="Turno" path="shift">
              <n-select
                v-model:value="form.shift"
                :options="shiftOptions"
                size="large"
                placeholder="Seleccione turno"
              />
            </n-form-item>

            <n-form-item label="Cupo Máximo" path="max_capacity">
              <n-input-number
                v-model:value="form.max_capacity"
                :min="1"
                size="large"
                placeholder="Ej: 30"
              />
            </n-form-item>

            <n-form-item label="Rango (3–12 meses)" path="range" :span="2">
              <n-date-picker
                v-model:value="form.range"
                type="daterange"
                size="large"
                start-placeholder="Inicio"
                end-placeholder="Fin"
                :is-date-disabled="disableRangeDate"
                clearable
              />
            </n-form-item>

            <n-form-item label="Costo (Bs.)" path="cost">
              <n-input-number
                v-model:value="form.cost"
                :min="0"
                :precision="1"
                :step="1"
                size="large"
                placeholder="Ej: 300.0"
              />
            </n-form-item>

            <n-form-item label="Descripción">
              <n-input
                v-model:value="form.description"
                type="textarea"
                autosize
                size="large"
                placeholder="Descripción opcional"
              />
            </n-form-item>
          </div>

          <div class="mt-10">
            <div class="text-xl font-extrabold mb-4">Horarios por Paralelo</div>

            <n-tabs type="segment">
              <n-tab-pane
                v-for="p in form.parallels"
                :key="p"
                :name="p"
                :tab="`Paralelo ${p}`"
              >
                <div class="flex flex-wrap gap-2 mb-4">
                  <n-button
                    size="small"
                    quaternary
                    @click="
                      selectDays(p, [
                        'LUNES',
                        'MARTES',
                        'MIERCOLES',
                        'JUEVES',
                        'VIERNES',
                      ])
                    "
                    >Lunes a Viernes</n-button
                  >
                  <n-button
                    size="small"
                    quaternary
                    @click="selectDays(p, ['SABADO', 'DOMINGO'])"
                    >Sábado y Domingo</n-button
                  >
                  <n-button
                    size="small"
                    quaternary
                    @click="
                      selectDays(
                        p,
                        weekdays.map((d) => d.value)
                      )
                    "
                    >Todos</n-button
                  >
                  <n-button size="small" quaternary @click="selectDays(p, [])"
                    >Ninguno</n-button
                  >
                  <n-button size="small" @click="copyFirstFilledToAll(p)"
                    >Copiar primera hora a seleccionados</n-button
                  >
                </div>

                <div
                  class="rounded-xl border border-[#334155] p-4 bg-[#0f172a]/50"
                >
                  <div
                    class="grid grid-cols-12 gap-3 text-sm font-bold text-gray-300 mb-2"
                  >
                    <div class="col-span-3">Día</div>
                    <div class="col-span-3">Aula</div>
                    <div class="col-span-3">Inicio</div>
                    <div class="col-span-3">Fin</div>
                  </div>

                  <div
                    v-for="d in weekdays"
                    :key="d.value"
                    class="grid grid-cols-12 gap-3 items-center mb-2"
                  >
                    <div class="col-span-3 flex items-center gap-3">
                      <n-checkbox
                        v-model:checked="scheduleMap[p][d.value].enabled"
                        >{{ d.label }}</n-checkbox
                      >
                    </div>
                    <div class="col-span-3">
                      <n-select
                        v-model:value="scheduleMap[p][d.value].classroomId"
                        :options="classroomOptions"
                        :disabled="!scheduleMap[p][d.value].enabled"
                        filterable
                        placeholder="Aula"
                      />
                    </div>
                    <div class="col-span-3">
                      <n-time-picker
                        v-model:value="scheduleMap[p][d.value].start"
                        format="HH:mm"
                        :disabled="!scheduleMap[p][d.value].enabled"
                      />
                    </div>
                    <div class="col-span-3">
                      <n-time-picker
                        v-model:value="scheduleMap[p][d.value].end"
                        format="HH:mm"
                        :disabled="!scheduleMap[p][d.value].enabled"
                      />
                    </div>
                  </div>
                </div>
              </n-tab-pane>
            </n-tabs>
          </div>

          <div class="mt-8 flex justify-center gap-3">
            <n-button
              secondary
              strong
              size="large"
              @click="$router.push('/courses')"
              >Volver</n-button
            >
            <n-button
              type="primary"
              strong
              size="large"
              :loading="saving"
              @click="submit"
              >Guardar</n-button
            >
          </div>
        </n-form>

        <n-modal
          v-model:show="openResult"
          preset="card"
          title="Cursos creados"
          class="font-extrabold"
          :style="{ width: '720px' }"
        >
          <div class="space-y-3">
            <div
              v-for="c in created"
              :key="c.id"
              class="rounded-lg border border-[#334155] p-3"
            >
              <div class="font-extrabold">{{ c.name }} ({{ c.parallel }})</div>
              <div class="text-sm text-gray-300">
                {{ c.teacher?.name }} {{ c.teacher?.last_name || "" }}
              </div>
              <div class="mt-2">
                <div
                  v-for="s in c.schedules"
                  :key="s.id"
                  class="text-sm text-gray-300"
                >
                  {{ s.weekday }} • {{ s.start_time }} - {{ s.end_time }} •
                  {{ s.classroom?.name }}
                </div>
              </div>
            </div>
            <div v-if="!created.length" class="text-gray-400">Sin datos</div>
          </div>
          <template #footer>
            <div class="flex justify-end">
              <n-button type="primary" @click="closeResult">Aceptar</n-button>
            </div>
          </template>
        </n-modal>
      </div>
    </div>
  </app-layout>
</template>

<script setup>
import {
  NForm,
  NFormItem,
  NInput,
  NButton,
  NInputNumber,
  NDatePicker,
  NSelect,
  NTimePicker,
  NTabs,
  NTabPane,
  NModal,
  NCheckbox,
  useMessage,
} from "naive-ui";
import { ref, reactive, onMounted } from "vue";
import AppLayout from "@/layouts/AppLayout.vue";
import CourseService from "@/services/courseService";
import ClassroomService from "@/services/classroomService";
import TeacherService from "@/services/teacherService";
import ModalityService from "@/services/modalityService";
import ProgramService from "@/services/programService";
import TermService from "@/services/termService";

const message = useMessage();
const formRef = ref(null);
const saving = ref(false);
const openResult = ref(false);
const created = ref([]);

const form = reactive({
  name: "",
  description: "",
  cost: 0,
  range: null,
  shift: null,
  max_capacity: null,
  teacherId: null,
  modalityId: null,
  termId: null,
  programId: null,
  parallels: [],
});

const parallelOptions = [
  { label: "A", value: "A" },
  { label: "B", value: "B" },
  { label: "C", value: "C" },
  { label: "D", value: "D" },
];

const weekdays = [
  { label: "Lunes", value: "LUNES" },
  { label: "Martes", value: "MARTES" },
  { label: "Miércoles", value: "MIERCOLES" },
  { label: "Jueves", value: "JUEVES" },
  { label: "Viernes", value: "VIERNES" },
  { label: "Sábado", value: "SABADO" },
  { label: "Domingo", value: "DOMINGO" },
];

const shiftOptions = [
  { label: "Mañana", value: "MAÑANA" },
  { label: "Tarde", value: "TARDE" },
  { label: "Noche", value: "NOCHE" },
];

const teacherOptions = ref([]);
const modalityOptions = ref([]);
const programOptions = ref([]);
const termOptions = ref([]);
const classroomOptions = ref([]);

const scheduleMap = reactive({});

const addMonths = (ts, months) => {
  const d = new Date(ts);
  d.setMonth(d.getMonth() + months);
  return +d;
};
const disableRangeDate = (ts) => {
  const v = form.range || [];
  const [s, e] = v;
  if (s && !e) {
    const minEnd = addMonths(s, 3);
    const maxEnd = addMonths(s, 12);
    return ts < minEnd || ts > maxEnd;
  }
  if (!s && e) {
    const minStart = addMonths(e, -12);
    const maxStart = addMonths(e, -3);
    return ts < minStart || ts > maxStart;
  }
  return false;
};

const rules = {
  name: [{ required: true, message: "Nombre requerido", trigger: "blur" }],
  parallels: [
    {
      trigger: ["change", "blur"],
      validator: (_, v) =>
        Array.isArray(v) && v.length > 0
          ? true
          : new Error("Seleccione al menos un paralelo"),
    },
  ],
  teacherId: [
    { required: true, message: "Seleccione docente", trigger: "change" },
  ],
  modalityId: [
    { required: true, message: "Seleccione modalidad", trigger: "change" },
  ],
  programId: [
    { required: true, message: "Seleccione programa", trigger: "change" },
  ],
  termId: [
    { required: true, message: "Seleccione periodo", trigger: "change" },
  ],
  shift: [{ required: true, message: "Seleccione turno", trigger: "change" }],
  range: [
    {
      trigger: ["change", "blur"],
      validator: (_, v) => {
        if (!Array.isArray(v) || v.length !== 2 || v[0] == null || v[1] == null)
          return new Error("Seleccione inicio y fin");
        const [s, e] = v;
        if (e < s) return new Error("Fin no puede ser menor al inicio");
        const min = addMonths(s, 3);
        const max = addMonths(s, 12);
        return e >= min && e <= max ? true : new Error("Duración 3–12 meses");
      },
    },
  ],
};

const toHHMM = (ms) => {
  if (ms == null) return null;
  const d = new Date(ms);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

const ensureParallels = () => {
  for (const p of form.parallels) {
    if (!scheduleMap[p]) {
      scheduleMap[p] = {};
      for (const d of weekdays) {
        scheduleMap[p][d.value] = {
          enabled: false,
          classroomId: null,
          start: null,
          end: null,
        };
      }
    }
  }
  for (const k of Object.keys(scheduleMap)) {
    if (!form.parallels.includes(k)) delete scheduleMap[k];
  }
};

const selectDays = (p, days) => {
  ensureParallels();
  const set = new Set(days);
  for (const d of weekdays) {
    scheduleMap[p][d.value].enabled = set.has(d.value);
  }
};

const copyFirstFilledToAll = (p) => {
  ensureParallels();
  let base = null;
  for (const d of weekdays) {
    const row = scheduleMap[p][d.value];
    if (
      row.enabled &&
      row.classroomId &&
      row.start != null &&
      row.end != null
    ) {
      base = { classroomId: row.classroomId, start: row.start, end: row.end };
      break;
    }
  }
  if (!base) {
    message.error("Complete un día para copiar.");
    return;
  }
  for (const d of weekdays) {
    const row = scheduleMap[p][d.value];
    if (row.enabled) {
      row.classroomId = row.classroomId || base.classroomId;
      row.start = row.start ?? base.start;
      row.end = row.end ?? base.end;
    }
  }
};

const validateOverlaps = () => {
  for (const p of form.parallels) {
    const rows = [];
    for (const d of weekdays) {
      const r = scheduleMap[p][d.value];
      if (r?.enabled) {
        const sm =
          r.start == null
            ? null
            : new Date(r.start).getHours() * 60 +
              new Date(r.start).getMinutes();
        const em =
          r.end == null
            ? null
            : new Date(r.end).getHours() * 60 + new Date(r.end).getMinutes();
        if (!r.classroomId || sm == null || em == null || sm >= em)
          return false;
        rows.push({ weekday: d.value, classroomId: r.classroomId, sm, em });
      }
    }
    for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        if (rows[i].weekday !== rows[j].weekday) continue;
        if (rows[i].classroomId !== rows[j].classroomId) continue;
        if (Math.max(rows[i].sm, rows[j].sm) < Math.min(rows[i].em, rows[j].em))
          return false;
      }
    }
  }
  for (let a = 0; a < form.parallels.length; a++) {
    for (let b = a + 1; b < form.parallels.length; b++) {
      const pa = form.parallels[a];
      const pb = form.parallels[b];
      for (const d of weekdays) {
        const ra = scheduleMap[pa][d.value];
        const rb = scheduleMap[pb][d.value];
        if (!(ra?.enabled && rb?.enabled)) continue;
        if (ra.classroomId !== rb.classroomId) continue;
        const aSm =
          new Date(ra.start).getHours() * 60 + new Date(ra.start).getMinutes();
        const aEm =
          new Date(ra.end).getHours() * 60 + new Date(ra.end).getMinutes();
        const bSm =
          new Date(rb.start).getHours() * 60 + new Date(rb.start).getMinutes();
        const bEm =
          new Date(rb.end).getHours() * 60 + new Date(rb.end).getMinutes();
        if (Math.max(aSm, bSm) < Math.min(aEm, bEm)) return false;
      }
    }
  }
  return true;
};

const loadCatalogs = async () => {
  const [teachers, classrooms, modalities, programs, terms] = await Promise.all(
    [
      TeacherService.getAll(),
      ClassroomService.getAll(),
      ModalityService.getAll(),
      ProgramService.getAll(),
      TermService.getAll(),
    ]
  );

  teacherOptions.value = (teachers || []).map((t) => ({
    label: `${t.name} ${t.last_name ?? ""} ${t.second_last_name ?? ""}`.trim(),
    value: t.id,
  }));
  classroomOptions.value = (classrooms || []).map((c) => ({
    label: `${c.name} (${c.code})`,
    value: c.id,
  }));
  modalityOptions.value = (modalities || []).map((m) => ({
    label: m.name,
    value: m.id,
  }));
  programOptions.value = (programs || []).map((p) => ({
    label: p.name,
    value: p.id,
  }));
  termOptions.value = (terms || []).map((t) => ({
    label: t.name,
    value: t.id,
  }));
};

const submit = async () => {
  try {
    await formRef.value?.validate();
  } catch {
    message.error("Corrija los campos requeridos.");
    return;
  }
  ensureParallels();
  for (const p of form.parallels) {
    const anyDay = weekdays.some((d) => scheduleMap[p][d.value]?.enabled);
    if (!anyDay) {
      message.error(`Seleccione días para el paralelo ${p}`);
      return;
    }
  }
  if (!validateOverlaps()) {
    message.error("Solapamiento de horarios en la misma aula.");
    return;
  }
  saving.value = true;
  try {
    const [sTs, eTs] = form.range || [];
    const schedules = [];
    for (const p of form.parallels) {
      for (const d of weekdays) {
        const r = scheduleMap[p][d.value];
        if (r?.enabled) {
          schedules.push({
            parallel: p,
            weekday: d.value,
            classroomId: r.classroomId,
            start_time: toHHMM(r.start),
            end_time: toHHMM(r.end),
          });
        }
      }
    }
    const payload = {
      name: form.name,
      description: form.description,
      cost: form.cost == null ? "0.0" : Number(form.cost).toFixed(1),
      start_date: sTs ? new Date(sTs).toISOString() : null,
      end_date: eTs ? new Date(eTs).toISOString() : null,
      shift: form.shift,
      max_capacity: form.max_capacity ?? null,
      teacherId: form.teacherId,
      modalityId: form.modalityId,
      termId: form.termId,
      programId: form.programId,
      parallels: form.parallels,
      schedules,
    };
    const createdCourses = await CourseService.createBulkWithSchedules(payload);
    created.value = createdCourses || [];
    openResult.value = true;
  } catch (err) {
    const msg = err?.response?.data?.error || "Error al crear cursos.";
    message.error(msg);
  } finally {
    saving.value = false;
  }
};

const closeResult = () => {
  openResult.value = false;
  created.value = [];
  window.location.assign("/courses");
};

onMounted(async () => {
  await loadCatalogs();
});
</script>

<template>
  <app-layout>
    <div class="min-h-screen bg-[#0f172a] p-10 text-white flex justify-center">
      <div
        class="w-full max-w-5xl bg-[#1e293b]/90 border border-[#334155] rounded-2xl p-10 shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
      >
        <h1 class="text-4xl font-extrabold text-center mb-10 tracking-tight">
          Editar Curso
        </h1>

        <n-config-provider :theme-overrides="theme">
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
                  placeholder="Ej: Administración I"
                  clearable
                />
              </n-form-item>

              <n-form-item label="Paralelo" path="parallel">
                <n-select
                  v-model:value="form.parallel"
                  :options="parallelOptions"
                  size="large"
                  placeholder="Seleccione paralelo"
                  clearable
                />
              </n-form-item>

              <n-form-item label="Docente Asignado" path="teacherId">
                <n-select
                  v-model:value="form.teacherId"
                  :options="teacherOptions"
                  :loading="loadingCats"
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
                  :loading="loadingCats"
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
                  :loading="loadingCats"
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
                  :loading="loadingCats"
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
                  :loading="loadingCats"
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

              <n-form-item label="Periodo (3–12 meses)" path="range" :span="2">
                <n-date-picker
                  v-model:value="form.range"
                  type="daterange"
                  size="large"
                  start-placeholder="Fecha de inicio"
                  end-placeholder="Fecha de finalización"
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
            </div>

            <n-form-item label="Descripción">
              <n-input
                v-model:value="form.description"
                type="textarea"
                autosize
                size="large"
                placeholder="Descripción opcional"
              />
            </n-form-item>

            <div class="mt-8 flex justify-center gap-3">
              <n-button
                secondary
                strong
                size="large"
                @click="router.push('/courses')"
                >Volver</n-button
              >
              <n-button
                type="primary"
                strong
                size="large"
                :loading="submitting"
                :disabled="submitting"
                @click="submit"
                >Actualizar</n-button
              >
            </div>
          </n-form>
        </n-config-provider>
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
  NConfigProvider,
  useMessage,
} from "naive-ui";
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import AppLayout from "@/layouts/AppLayout.vue";
import CourseService from "@/services/courseService";

const router = useRouter();
const route = useRoute();
const courseId = computed(() => route.params.id);
const message = useMessage();
const formRef = ref(null);
const submitting = ref(false);
const loadingCats = ref(true);

const form = reactive({
  name: "",
  parallel: null,
  description: "",
  cost: 100,
  range: null,
  teacherId: null,
  modalityId: null,
  programId: null,
  termId: null,
  shift: null,
  max_capacity: null,
});

const parallelOptions = [
  { label: "A", value: "A" },
  { label: "B", value: "B" },
  { label: "C", value: "C" },
];

const teacherOptions = ref([]);
const modalityOptions = ref([]);
const programOptions = ref([]);
const termOptions = ref([]);
const shiftOptions = ref([]);

const theme = {
  common: { primaryColor: "#2563eb" },
  Input: {
    color: "rgba(15,23,42,0.7)",
    textColor: "#e5e7eb",
    placeholderColor: "#94a3b8",
    borderColor: "#334155",
    borderColorHover: "#3b82f6",
    borderRadius: "12px",
    heightLarge: "44px",
  },
  InputNumber: {
    peers: {
      Input: {
        color: "rgba(15,23,42,0.7)",
        textColor: "#e5e7eb",
        placeholderColor: "#94a3b8",
        borderColor: "#334155",
        borderColorHover: "#3b82f6",
        borderRadius: "12px",
        heightLarge: "44px",
      },
    },
  },
  Select: {
    peers: {
      InternalSelection: {
        color: "rgba(15,23,42,0.7)",
        textColor: "#e5e7eb",
        placeholderColor: "#94a3b8",
        borderColor: "#334155",
        borderColorHover: "#3b82f6",
        borderRadius: "12px",
        heightLarge: "44px",
      },
    },
  },
  DatePicker: {
    peers: {
      Input: {
        color: "rgba(15,23,42,0.7)",
        textColor: "#e5e7eb",
        placeholderColor: "#94a3b8",
        borderColor: "#334155",
        borderColorHover: "#3b82f6",
        borderRadius: "12px",
        heightLarge: "44px",
      },
    },
  },
  Button: { textColor: "#ffffff" },
};

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
  parallel: [
    { required: true, message: "Paralelo requerido", trigger: "change" },
  ],
  teacherId: [
    { required: true, message: "Seleccione un docente", trigger: "change" },
  ],
  modalityId: [
    { required: true, message: "Seleccione una modalidad", trigger: "change" },
  ],
  programId: [
    { required: true, message: "Seleccione un programa", trigger: "change" },
  ],
  termId: [
    { required: true, message: "Seleccione un periodo", trigger: "change" },
  ],
  shift: [
    { required: true, message: "Seleccione un turno", trigger: "change" },
  ],
  max_capacity: [
    {
      type: "number",
      min: 1,
      message: "Ingrese un cupo válido",
      trigger: "blur",
    },
  ],
  range: [
    {
      trigger: ["change", "blur"],
      validator: (_, v) => {
        if (!Array.isArray(v) || v.length !== 2 || v[0] == null || v[1] == null)
          return new Error("Seleccione inicio y fin");
        const [s, e] = v;
        if (e < s)
          return new Error("La fecha final no puede ser menor al inicio");
        const min = addMonths(s, 3);
        const max = addMonths(s, 12);
        return e >= min && e <= max
          ? true
          : new Error("La duración debe ser entre 3 y 12 meses");
      },
    },
  ],
};

const loadCatalogs = async () => {
  try {
    loadingCats.value = true;
    const c = await CourseService.getCatalogs();

    teacherOptions.value = (c.teachers || []).map((t) => ({
      label: `${t.name} ${t.last_name ?? ""} ${
        t.second_last_name ?? ""
      }`.trim(),
      value: String(t.id),
    }));

    modalityOptions.value = (c.modalities || []).map((m) => ({
      label: m.name,
      value: String(m.id),
    }));

    programOptions.value = (c.programs || []).map((p) => ({
      label: p.name,
      value: String(p.id),
    }));

    termOptions.value = (c.terms || []).map((t) => ({
      label: t.name,
      value: String(t.id),
    }));

    shiftOptions.value = (c.shifts || ["MAÑANA", "TARDE", "NOCHE"]).map(
      (s) => ({
        label: s.charAt(0) + s.slice(1).toLowerCase(),
        value: s,
      })
    );
  } catch {
    message.error("Error al cargar catálogos.");
  } finally {
    loadingCats.value = false;
  }
};

const fetchCourse = async () => {
  try {
    const course = await CourseService.getById(courseId.value);
    const s = course.start_date ? new Date(course.start_date).getTime() : null;
    const e = course.end_date ? new Date(course.end_date).getTime() : null;

    form.name = course.name || "";
    form.parallel = course.parallel || null;
    form.description = course.description || "";
    form.cost = course.cost != null ? Number(course.cost) : 100;
    form.range = s && e ? [s, e] : null;

    form.teacherId = course.teacherId != null ? String(course.teacherId) : null;
    form.modalityId =
      course.modalityId != null ? String(course.modalityId) : null;
    form.programId = course.programId != null ? String(course.programId) : null;
    form.termId = course.termId != null ? String(course.termId) : null;
    form.shift = course.shift ?? null;
    form.max_capacity = course.max_capacity ?? null;
  } catch {
    message.error("Curso no encontrado.");
    router.push("/courses");
  }
};

const validateOrToast = async () => {
  try {
    await formRef.value?.validate();
    return true;
  } catch (errs) {
    const first = Array.isArray(errs) ? errs[0] : null;
    message.error(first?.message || "Corrige los campos resaltados");
    return false;
  }
};

const submit = async () => {
  if (submitting.value) return;
  const ok = await validateOrToast();
  if (!ok) return;
  submitting.value = true;
  try {
    const [startTs, endTs] = form.range || [];
    const payload = {
      name: form.name,
      parallel: form.parallel,
      description: form.description,
      cost: form.cost == null ? "0.0" : Number(form.cost).toFixed(1),
      start_date: startTs ? new Date(startTs).toISOString() : null,
      end_date: endTs ? new Date(endTs).toISOString() : null,
      teacherId: form.teacherId,
      modalityId: form.modalityId,
      programId: form.programId,
      termId: form.termId,
      shift: form.shift,
      max_capacity: form.max_capacity ?? null,
    };
    await CourseService.update(courseId.value, payload);
    message.success("Curso actualizado.");
    router.push("/courses");
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.data?.message ||
      err?.message ||
      "Error al actualizar curso.";
    message.error(msg);
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  await loadCatalogs();
  await fetchCourse();
});
</script>

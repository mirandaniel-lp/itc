<template>
  <app-layout>
    <div class="min-h-screen bg-[#0f172a] p-10 text-white flex justify-center">
      <div
        class="w-full max-w-5xl bg-[#1e293b]/90 border border-[#334155] rounded-2xl p-10 shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
      >
        <h1 class="text-4xl font-extrabold text-center mb-10 tracking-tight">
          Registrar Curso
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
                  :min="100"
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
                @click="$router.push('/courses')"
                >Volver</n-button
              >
              <n-button type="primary" strong size="large" @click="submit"
                >Guardar</n-button
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
import { ref, reactive, onMounted } from "vue";
import AppLayout from "@/layouts/AppLayout.vue";
import CourseService from "@/services/courseService";
import TeacherService from "@/services/teacherService";
import axios from "axios";

const message = useMessage();
const formRef = ref(null);

const form = reactive({
  name: "",
  parallel: null,
  description: "",
  cost: 100,
  range: null,
  teacherId: null,
  modalityId: null,
});

const parallelOptions = [
  { label: "A", value: "A" },
  { label: "B", value: "B" },
  { label: "C", value: "C" },
];

const teacherOptions = ref([]);
const modalityOptions = ref([]);

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
  range: [
    {
      trigger: ["change", "blur"],
      validator: (_, v) => {
        if (
          !Array.isArray(v) ||
          v.length !== 2 ||
          v[0] == null ||
          v[1] == null
        ) {
          return new Error("Seleccione inicio y fin");
        }
        const [s, e] = v;
        if (e < s)
          return new Error("La fecha final no puede ser menor al inicio");
        const min = addMonths(s, 3);
        const max = addMonths(s, 12);
        return e >= min && e <= max
          ? true
          : new Error(
              "La duración debe ser entre 3 y 12 meses desde el inicio"
            );
      },
    },
  ],
};

const loadSelects = async () => {
  try {
    const teachers = await TeacherService.getAll();
    teacherOptions.value = (teachers || []).map((t) => ({
      label: `${t.name} ${t.last_name ?? ""} ${
        t.second_last_name ?? ""
      }`.trim(),
      value: t.id,
    }));
    const res = await axios.get("http://localhost:3000/api/modalities", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      withCredentials: true,
    });
    modalityOptions.value = (res.data.modalities || []).map((m) => ({
      label: m.name,
      value: m.id,
    }));
  } catch {
    message?.error("Error al cargar docentes o modalidades.");
  }
};

const submit = async () => {
  try {
    await formRef.value?.validate();
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
    };
    await CourseService.create(payload);
    message.success("Curso creado exitosamente.");
    window.location.assign("/courses");
  } catch {
    message.error("Error al registrar curso.");
  }
};

onMounted(loadSelects);
</script>

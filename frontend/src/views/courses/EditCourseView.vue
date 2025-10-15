<template>
  <app-layout>
    <div class="min-h-screen bg-[#0f172a] p-10 text-white flex justify-center">
      <div
        class="w-full max-w-5xl bg-[#1e293b]/90 border border-[#334155] shadow-[0_8px_30px_rgba(0,0,0,0.6)] rounded-2xl p-10 backdrop-blur-sm"
      >
        <h1 class="text-4xl font-extrabold text-center mb-10 tracking-tight">
          Editar Curso
        </h1>

        <n-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-placement="top"
        >
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <n-form-item label="Nombre del Curso" path="name">
              <n-input
                v-model:value="form.name"
                placeholder="Ej: Administración I"
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-4 py-2 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 placeholder:text-gray-400"
              />
            </n-form-item>

            <!-- Paralelo como SELECT -->
            <n-form-item label="Paralelo" path="parallel">
              <n-select
                v-model:value="form.parallel"
                :options="parallelOptions"
                placeholder="Seleccione paralelo"
                size="large"
                clearable
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-2 py-1 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 text-gray-100"
              />
            </n-form-item>

            <!-- Costo con 1 decimal (muestra 0.0 / envía '20.0') -->
            <n-form-item label="Costo (Bs.)" path="cost">
              <n-input-number
                v-model:value="form.cost"
                :min="0"
                :precision="1"
                :step="1"
                placeholder="Ej: 300"
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-2 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300"
              />
            </n-form-item>

            <n-form-item label="Modalidad" path="modalityId">
              <n-select
                v-model:value="form.modalityId"
                :options="modalityOptions"
                placeholder="Seleccione modalidad"
                filterable
                clearable
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-2 py-1 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 text-gray-100"
              />
            </n-form-item>

            <n-form-item label="Docente Asignado" path="teacherId">
              <n-select
                v-model:value="form.teacherId"
                :options="teacherOptions"
                placeholder="Seleccione docente"
                filterable
                clearable
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-2 py-1 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 text-gray-100"
              />
            </n-form-item>

            <n-form-item label="Fecha de Inicio" path="start_date">
              <n-date-picker
                v-model:value="form.start_date"
                type="date"
                placeholder="Seleccione fecha"
                :input-readonly="true"
                clearable
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-4 py-2 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 placeholder:text-gray-400"
              />
            </n-form-item>

            <n-form-item label="Fecha de Finalización" path="end_date">
              <n-date-picker
                v-model:value="form.end_date"
                type="date"
                placeholder="Opcional"
                :input-readonly="true"
                clearable
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-4 py-2 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 placeholder:text-gray-400"
              />
            </n-form-item>
          </div>

          <n-form-item label="Descripción">
            <n-input
              v-model:value="form.description"
              type="textarea"
              placeholder="Descripción opcional"
              autosize
              size="large"
              class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-4 py-2 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 placeholder:text-gray-400"
            />
          </n-form-item>

          <div class="mt-10 flex justify-center gap-4">
            <n-button
              type="default"
              class="bg-[#1e293b] border border-[#334155] text-gray-300 font-bold px-10 py-3 rounded-xl hover:bg-[#334155] hover:text-white hover:scale-105 active:scale-95 transition-all duration-300"
              @click="$router.push('/courses')"
            >
              Volver
            </n-button>

            <n-button
              type="primary"
              class="bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white font-extrabold px-10 py-3 rounded-xl shadow-[0_0_25px_rgba(37,99,235,0.6)] hover:shadow-[0_0_40px_rgba(37,99,235,0.9)] hover:scale-105 active:scale-95 transition-all duration-300"
              @click="submit"
            >
              Actualizar Curso
            </n-button>
          </div>
        </n-form>
      </div>
    </div>
  </app-layout>
</template>

<script>
import {
  NForm,
  NFormItem,
  NInput,
  NButton,
  NInputNumber,
  NDatePicker,
  NSelect,
  useMessage,
} from "naive-ui";
import AppLayout from "@/layouts/AppLayout.vue";
import CourseService from "@/services/courseService";
import TeacherService from "@/services/teacherService";
import axios from "axios";

export default {
  name: "EditCourseView",
  components: {
    AppLayout,
    NForm,
    NFormItem,
    NInput,
    NButton,
    NInputNumber,
    NDatePicker,
    NSelect,
  },
  data() {
    return {
      formRef: null,
      message: null,
      form: {
        name: "",
        parallel: null,
        description: "",
        cost: 0.0,
        start_date: null,
        end_date: null,
        teacherId: null,
        modalityId: null,
      },
      parallelOptions: [
        { label: "A", value: "A" },
        { label: "B", value: "B" },
        { label: "C", value: "C" },
      ],
      teacherOptions: [],
      modalityOptions: [],
      rules: {
        name: { required: true, message: "Nombre requerido", trigger: "blur" },
        parallel: {
          required: true,
          message: "Paralelo requerido",
          trigger: "change",
        },
        teacherId: {
          required: true,
          message: "Seleccione un docente",
          trigger: "change",
        },
        modalityId: {
          required: true,
          message: "Seleccione una modalidad",
          trigger: "change",
        },
      },
    };
  },
  methods: {
    async fetchCourse() {
      try {
        const course = await CourseService.getById(this.$route.params.id);

        // Adaptar datos al formulario (timestamps para date pickers, string para selects)
        const start = course.start_date ? new Date(course.start_date) : null;
        const end = course.end_date ? new Date(course.end_date) : null;

        this.form = {
          name: course.name || "",
          parallel: course.parallel || null,
          description: course.description || "",
          cost:
            course.cost != null
              ? Number(course.cost) // NInputNumber maneja número; luego forzamos 1 decimal al enviar
              : 0.0,
          start_date: start ? start.getTime() : null,
          end_date: end ? end.getTime() : null,
          teacherId: course.teacherId ?? null,
          modalityId: course.modalityId ?? null,
        };
      } catch {
        this.message?.error?.("Curso no encontrado.");
        this.$router.push("/courses");
      }
    },
    async loadSelects() {
      try {
        const teachers = await TeacherService.getAll();
        this.teacherOptions = (teachers || []).map((t) => ({
          label: `${t.name} ${t.last_name ?? ""} ${
            t.second_last_name ?? ""
          }`.trim(),
          value: t.id,
        }));

        const res = await axios.get("http://localhost:3000/api/modalities", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        this.modalityOptions = (res.data.modalities || []).map((m) => ({
          label: m.name,
          value: m.id,
        }));
      } catch {
        this.message?.error?.("Error al cargar docentes o modalidades.");
      }
    },
    async submit() {
      try {
        await this.formRef?.validate();
        const payload = {
          ...this.form,
          cost:
            this.form.cost == null ? "0.0" : Number(this.form.cost).toFixed(1),
          start_date: this.form.start_date
            ? new Date(this.form.start_date).toISOString()
            : null,
          end_date: this.form.end_date
            ? new Date(this.form.end_date).toISOString()
            : null,
        };
        await CourseService.update(this.$route.params.id, payload);
        this.message?.success?.("Curso actualizado.");
        this.$router.push("/courses");
      } catch {
        this.message?.error?.("Error al actualizar curso.");
      }
    },
  },
  created() {
    this.message = useMessage();
    this.loadSelects();
    this.fetchCourse();
  },
};
</script>

<style></style>

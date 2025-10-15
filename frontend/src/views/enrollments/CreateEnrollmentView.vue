<template>
  <app-layout>
    <div class="min-h-screen bg-[#0f172a] p-8 text-white flex justify-center">
      <div
        class="w-full max-w-5xl bg-[#1e293b]/90 border border-[#334155] shadow-[0_8px_30px_rgba(0,0,0,0.6)] rounded-2xl p-8 backdrop-blur-sm"
      >
        <h1 class="text-4xl font-extrabold text-center mb-6 tracking-tight">
          Registrar Inscripción
        </h1>

        <n-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-placement="top"
          :show-feedback="false"
        >
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <n-form-item label="Estudiante" path="studentId">
              <n-select
                v-model:value="form.studentId"
                :options="studentOptions"
                placeholder="Seleccione estudiante"
                filterable
                clearable
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-2 py-1 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 text-gray-100"
              />
            </n-form-item>

            <n-form-item label="Curso" path="courseId">
              <n-select
                v-model:value="form.courseId"
                :options="courseOptions"
                placeholder="Seleccione curso"
                filterable
                clearable
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-2 py-1 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 text-gray-100"
              />
            </n-form-item>

            <n-form-item label="Fecha de Inscripción" path="enrollment_date">
              <n-date-picker
                v-model:value="form.enrollment_date"
                type="date"
                placeholder="Seleccione fecha"
                :input-readonly="true"
                clearable
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-4 py-2 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 placeholder:text-gray-400"
              />
            </n-form-item>

            <n-form-item label="Tipo de Pago" path="payment_type">
              <n-select
                v-model:value="form.payment_type"
                :options="paymentOptions"
                placeholder="Seleccione tipo de pago"
                filterable
                clearable
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-2 py-1 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 text-gray-100"
              />
            </n-form-item>
          </div>

          <div class="mt-6 flex justify-center gap-4">
            <n-button
              type="default"
              class="bg-[#1e293b] border border-[#334155] text-gray-300 font-bold px-8 py-3 rounded-xl hover:bg-[#334155] hover:text-white hover:scale-105 active:scale-95 transition-all duration-300"
              @click="$router.push('/enrollments')"
            >
              Volver
            </n-button>

            <n-button
              type="primary"
              class="bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white font-extrabold px-8 py-3 rounded-xl shadow-[0_0_18px_rgba(37,99,235,0.6)] hover:shadow-[0_0_28px_rgba(37,99,235,0.9)] hover:scale-105 active:scale-95 transition-all duration-300"
              @click="submit"
            >
              Guardar Inscripción
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
  NSelect,
  NDatePicker,
  NButton,
  useMessage,
} from "naive-ui";
import AppLayout from "@/layouts/AppLayout.vue";
import EnrollmentService from "@/services/enrollmentService";
import StudentService from "@/services/studentService";
import CourseService from "@/services/courseService";

export default {
  name: "CreateEnrollmentView",
  components: {
    AppLayout,
    NForm,
    NFormItem,
    NSelect,
    NDatePicker,
    NButton,
  },
  data() {
    return {
      formRef: null,
      message: null,
      form: {
        studentId: null,
        courseId: null,
        enrollment_date: null,
        payment_type: null,
      },
      paymentOptions: [
        { label: "CONTADO", value: "CONTADO" },
        { label: "MENSUAL", value: "MENSUAL" },
      ],
      studentOptions: [],
      courseOptions: [],
      rules: {
        studentId: {
          required: true,
          message: "Seleccione estudiante",
          trigger: "change",
        },
        courseId: {
          required: true,
          message: "Seleccione curso",
          trigger: "change",
        },
        enrollment_date: {
          required: true,
          message: "Seleccione fecha válida",
          trigger: "change",
        },
        payment_type: {
          required: true,
          message: "Seleccione tipo de pago",
          trigger: "change",
        },
      },
    };
  },
  methods: {
    async loadOptions() {
      try {
        const students = await StudentService.getAll();
        this.studentOptions = (students || []).map((s) => ({
          label: `${s.name} ${s.last_name ?? ""} ${
            s.second_last_name ?? ""
          }`.trim(),
          value: s.id,
        }));

        const courses = await CourseService.getAll();
        this.courseOptions = (courses || []).map((c) => ({
          label: `${c.name} (${c.parallel})`,
          value: c.id,
        }));
      } catch {
        this.message?.error?.("Error al cargar datos.");
      }
    },
    async submit() {
      try {
        await this.formRef?.validate();
        const payload = {
          ...this.form,
          enrollment_date: this.form.enrollment_date
            ? new Date(this.form.enrollment_date).toISOString()
            : null,
        };
        await EnrollmentService.create(payload);
        this.message.success("Inscripción registrada correctamente.");
        this.$router.push("/enrollments");
      } catch {
        this.message.error("Error al registrar inscripción.");
      }
    },
  },
  created() {
    this.message = useMessage();
    this.loadOptions();
  },
};
</script>

<style scoped>
:deep(.n-form-item) {
  margin-bottom: 10px;
}
</style>

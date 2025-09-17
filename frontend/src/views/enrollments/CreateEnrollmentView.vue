<template>
  <app-layout>
    <div class="min-h-screen">
      <n-card title="Registrar Inscripción" size="large">
        <n-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-placement="top"
        >
          <n-form-item label="Estudiante" path="studentId">
            <n-select
              v-model:value="form.studentId"
              :options="studentOptions"
              placeholder="Seleccione estudiante"
              filterable
            />
          </n-form-item>

          <n-form-item label="Curso" path="courseId">
            <n-select
              v-model:value="form.courseId"
              :options="courseOptions"
              placeholder="Seleccione curso"
              filterable
            />
          </n-form-item>

          <n-form-item label="Fecha de Inscripción" path="enrollment_date">
            <n-date-picker
              v-model:value="form.enrollment_date"
              type="date"
              placeholder="Seleccione fecha"
            />
          </n-form-item>

          <n-form-item label="Tipo de Pago" path="payment_type">
            <n-select
              v-model:value="form.payment_type"
              :options="[
                { label: 'CONTADO', value: 'CONTADO' },
                { label: 'MENSUAL', value: 'MENSUAL' },
              ]"
              placeholder="Seleccione tipo de pago"
              filterable
            />
          </n-form-item>

          <div class="mt-4">
            <n-button type="primary" @click="submit">Guardar</n-button>
          </div>
        </n-form>
      </n-card>
    </div>
  </app-layout>
</template>

<script>
import {
  NCard,
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
    NCard,
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
        this.studentOptions = students.map((s) => ({
          label: `${s.name} ${s.last_name} ${s.second_last_name}`,
          value: String(s.id),
        }));

        const courses = await CourseService.getAll();
        this.courseOptions = courses.map((c) => ({
          label: `${c.name} (${c.parallel})`,
          value: String(c.id),
        }));
      } catch (err) {
        this.message.error("Error al cargar datos.");
      }
    },

    async submit() {
      try {
        await this.formRef?.validate();

        const payload = {
          ...this.form,
          enrollment_date: new Date(this.form.enrollment_date).toISOString(),
        };

        await EnrollmentService.create(payload);
        this.message.success("Inscripción registrada correctamente.");
        this.$router.push("/enrollments");
      } catch (err) {
        console.error(err);
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

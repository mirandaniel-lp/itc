<template>
  <app-layout>
    <div class="min-h-screen">
      <n-card title="Editar Curso" size="large">
        <n-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-placement="top"
        >
          <n-form-item label="Nombre del Curso" path="name">
            <n-input v-model:value="form.name" />
          </n-form-item>

          <n-form-item label="Paralelo" path="parallel">
            <n-input v-model:value="form.parallel" />
          </n-form-item>

          <n-form-item label="Descripción">
            <n-input
              type="textarea"
              v-model:value="form.description"
              autosize
            />
          </n-form-item>

          <n-form-item label="Costo (Bs.)" path="cost">
            <n-input-number v-model:value="form.cost" :min="0" :precision="2" />
          </n-form-item>

          <n-form-item label="Fecha de Inicio" path="start_date">
            <n-date-picker
              v-model:value="form.start_date"
              type="date"
              value-format="timestamp"
            />
          </n-form-item>

          <n-form-item label="Fecha de Finalización">
            <n-date-picker
              v-model:value="form.end_date"
              type="date"
              value-format="timestamp"
            />
          </n-form-item>

          <n-form-item label="Docente Asignado" path="teacherId">
            <n-select
              v-model:value="form.teacherId"
              :options="teacherOptions"
              filterable
            />
          </n-form-item>

          <n-form-item label="Modalidad" path="modalityId">
            <n-select
              v-model:value="form.modalityId"
              :options="modalityOptions"
              filterable
            />
          </n-form-item>

          <div class="mt-4">
            <n-button type="primary" @click="submit">Actualizar</n-button>
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
    NCard,
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
        parallel: "",
        description: "",
        cost: 0,
        start_date: null,
        end_date: null,
        teacherId: null,
        modalityId: null,
      },
      teacherOptions: [],
      modalityOptions: [],
      rules: {
        name: {
          required: true,
          message: "Nombre requerido",
          trigger: "blur",
        },
        parallel: {
          required: true,
          message: "Paralelo requerido",
          trigger: "blur",
        },
        cost: {
          required: true,
          message: "Costo requerido",
          trigger: "blur",
        },
        start_date: {
          required: true,
          message: "Fecha de inicio requerida",
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
        const parsedStart = new Date(course.start_date);
        const parsedEnd = course.end_date ? new Date(course.end_date) : null;

        this.form = {
          ...course,
          start_date: !isNaN(parsedStart) ? parsedStart.getTime() : null,
          end_date: parsedEnd && !isNaN(parsedEnd) ? parsedEnd.getTime() : null,
        };
      } catch (err) {
        this.message.error("Curso no encontrado.");
        this.$router.push("/courses");
      }
    },
    async loadSelects() {
      const teachers = await TeacherService.getAll();
      this.teacherOptions = teachers.map((t) => ({
        label: `${t.name} ${t.last_name} ${t.second_last_name}`,
        value: t.id,
      }));

      const res = await axios.get("http://localhost:3000/api/modalities", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        withCredentials: true,
      });

      this.modalityOptions = res.data.modalities.map((m) => ({
        label: m.name,
        value: m.id,
      }));
    },
    async submit() {
      try {
        await this.formRef?.validate();

        const data = {
          ...this.form,
          start_date: this.form.start_date
            ? new Date(this.form.start_date).toISOString()
            : null,
          end_date: this.form.end_date
            ? new Date(this.form.end_date).toISOString()
            : null,
        };

        await CourseService.update(this.$route.params.id, data);
        this.message.success("Curso actualizado.");
        this.$router.push("/courses");
      } catch (err) {
        this.message.error("Error al actualizar curso.");
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

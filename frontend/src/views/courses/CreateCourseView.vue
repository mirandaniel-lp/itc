<template>
  <app-layout>
    <div class="min-h-screen">
      <n-card title="Registrar Curso" size="large">
        <n-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-placement="top"
        >
          <n-form-item label="Nombre del Curso" path="name">
            <n-input
              v-model:value="form.name"
              placeholder="Ej: Administración I"
            />
          </n-form-item>

          <n-form-item label="Paralelo" path="parallel">
            <n-input v-model:value="form.parallel" placeholder="Ej: A, B, C" />
          </n-form-item>

          <n-form-item label="Descripción">
            <n-input
              type="textarea"
              v-model:value="form.description"
              placeholder="Descripción opcional"
              autosize
            />
          </n-form-item>

          <n-form-item label="Costo (Bs.)" path="cost">
            <n-input-number
              v-model:value="form.cost"
              placeholder="Ej: 300"
              :min="0"
              :precision="2"
            />
          </n-form-item>

          <n-form-item label="Fecha de Inicio" path="start_date">
            <n-date-picker
              v-model:value="form.start_date"
              type="date"
              placeholder="Seleccione fecha"
            />
          </n-form-item>

          <n-form-item label="Fecha de Finalización" path="end_date">
            <n-date-picker
              v-model:value="form.end_date"
              type="date"
              placeholder="Opcional"
            />
          </n-form-item>

          <n-form-item label="Docente Asignado" path="teacherId">
            <n-select
              v-model:value="form.teacherId"
              :options="teacherOptions"
              placeholder="Seleccione docente"
              filterable
            />
          </n-form-item>

          <n-form-item label="Modalidad" path="modalityId">
            <n-select
              v-model:value="form.modalityId"
              :options="modalityOptions"
              placeholder="Seleccione modalidad"
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
  name: "CreateCourseView",
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
    async loadSelects() {
      try {
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
      } catch (err) {
        this.message.error("Error al cargar docentes o modalidades.");
      }
    },
    async submit() {
      try {
        await this.formRef?.validate();

        const payload = {
          ...this.form,
          start_date: this.form.start_date
            ? new Date(this.form.start_date).toISOString()
            : null,
          end_date: this.form.end_date
            ? new Date(this.form.end_date).toISOString()
            : null,
        };

        await CourseService.create(payload);
        this.message.success("Curso creado exitosamente.");
        this.$router.push("/courses");
      } catch (err) {
        console.error(err);
        this.message.error("Error al registrar curso.");
      }
    },
  },
  created() {
    this.message = useMessage();
    this.loadSelects();
  },
};
</script>

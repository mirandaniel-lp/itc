<template>
  <app-layout>
    <div class="min-h-screen">
      <n-card title="Editar Docente" size="large">
        <n-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-placement="top"
        >
          <n-form-item label="Nombre" path="name">
            <n-input v-model:value="form.name" />
          </n-form-item>

          <n-form-item label="Apellido Paterno" path="last_name">
            <n-input v-model:value="form.last_name" />
          </n-form-item>

          <n-form-item label="Apellido Materno" path="second_last_name">
            <n-input v-model:value="form.second_last_name" />
          </n-form-item>

          <n-form-item label="CI">
            <n-input v-model:value="form.ci" />
          </n-form-item>

          <n-form-item label="Fecha de Nacimiento" path="dateofbirth">
            <n-date-picker
              v-model:value="form.dateofbirth"
              type="date"
              value-format="timestamp"
            />
          </n-form-item>

          <n-form-item label="Lugar de Nacimiento">
            <n-input v-model:value="form.placeofbirth" />
          </n-form-item>

          <n-form-item label="Teléfono" path="phone">
            <n-input v-model:value="form.phone" />
          </n-form-item>

          <n-form-item label="Género" path="gender">
            <n-select
              v-model:value="form.gender"
              :options="genderOptions"
              clearable
            />
          </n-form-item>

          <n-form-item label="Especialidad">
            <n-input v-model:value="form.specialty" />
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
  NSelect,
  NDatePicker,
  useMessage,
} from "naive-ui";
import AppLayout from "@/layouts/AppLayout.vue";
import TeacherService from "@/services/teacherService";

export default {
  name: "EditTeacherView",
  components: {
    AppLayout,
    NCard,
    NForm,
    NFormItem,
    NInput,
    NButton,
    NSelect,
    NDatePicker,
  },
  data() {
    return {
      formRef: null,
      message: null,
      form: {
        name: "",
        last_name: "",
        second_last_name: "",
        ci: "",
        dateofbirth: null,
        placeofbirth: "",
        phone: "",
        gender: "",
        specialty: "",
      },
      genderOptions: [
        { label: "MASCULINO", value: "MASCULINO" },
        { label: "FEMENINO", value: "FEMENINO" },
        { label: "OTRO", value: "OTRO" },
      ],
      rules: {
        name: {
          required: true,
          message: "Nombre requerido",
          trigger: "blur",
          validator: (_, val) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val),
        },
        last_name: {
          required: true,
          message: "Apellido paterno requerido",
          trigger: "blur",
          validator: (_, val) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val),
        },
        second_last_name: {
          required: true,
          message: "Apellido materno requerido",
          trigger: "blur",
          validator: (_, val) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val),
        },
        phone: {
          required: true,
          message: "Teléfono requerido",
          trigger: "blur",
          validator: (_, val) => /^[67]\d{7}$/.test(val),
        },
        gender: {
          required: true,
          message: "Seleccione género",
          trigger: "change",
        },
        dateofbirth: {
          required: true,
          message: "Fecha inválida",
          trigger: "change",
          validator: (_, val) => {
            const dob = new Date(val);
            const age = new Date().getFullYear() - dob.getFullYear();
            return age >= 21 && age <= 75;
          },
        },
      },
    };
  },
  methods: {
    async fetchTeacher() {
      try {
        const teacher = await TeacherService.getById(this.$route.params.id);
        const timestamp = new Date(teacher.dateofbirth).getTime();
        this.form = { ...teacher, dateofbirth: timestamp };
      } catch (err) {
        this.message.error("Docente no encontrado.");
        this.$router.push("/teachers");
      }
    },
    async submit() {
      try {
        await this.formRef?.validate();
        const data = {
          ...this.form,
          dateofbirth: new Date(this.form.dateofbirth).toISOString(),
        };
        await TeacherService.update(this.$route.params.id, data);
        this.message.success("Docente actualizado.");
        this.$router.push("/teachers");
      } catch (err) {
        this.message.error("Error al actualizar docente.");
      }
    },
  },
  created() {
    this.message = useMessage();
    this.fetchTeacher();
  },
};
</script>

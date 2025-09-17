<template>
  <app-layout>
    <div class="min-h-screen">
      <n-card title="Registrar Docente" size="large">
        <n-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-placement="top"
        >
          <n-form-item label="Nombre" path="name">
            <n-input v-model:value="form.name" placeholder="Ingrese nombre" />
          </n-form-item>

          <n-form-item label="Apellido Paterno" path="last_name">
            <n-input
              v-model:value="form.last_name"
              placeholder="Ingrese apellido paterno"
            />
          </n-form-item>

          <n-form-item label="Apellido Materno" path="second_last_name">
            <n-input
              v-model:value="form.second_last_name"
              placeholder="Ingrese apellido materno"
            />
          </n-form-item>

          <n-form-item label="CI (Carnet de Identidad)">
            <n-input v-model:value="form.ci" placeholder="Opcional" />
          </n-form-item>

          <n-form-item label="Fecha de Nacimiento" path="dateofbirth">
            <n-date-picker
              v-model:value="form.dateofbirth"
              type="date"
              placeholder="Seleccione fecha"
            />
          </n-form-item>

          <n-form-item label="Lugar de Nacimiento">
            <n-input
              v-model:value="form.placeofbirth"
              placeholder="Ciudad o departamento"
            />
          </n-form-item>

          <n-form-item label="Teléfono" path="phone">
            <n-input v-model:value="form.phone" placeholder="Ej: 71234567" />
          </n-form-item>

          <n-form-item label="Género" path="gender">
            <n-select
              v-model:value="form.gender"
              :options="genderOptions"
              placeholder="Seleccione género"
              clearable
            />
          </n-form-item>

          <n-form-item label="Especialidad (opcional)">
            <n-input
              v-model:value="form.specialty"
              placeholder="Ej: Matemáticas, Diseño gráfico..."
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
  NSelect,
  NDatePicker,
  useMessage,
} from "naive-ui";
import AppLayout from "@/layouts/AppLayout.vue";
import TeacherService from "@/services/teacherService";

export default {
  name: "CreateTeacherView",
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
        gender: null,
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
    async submit() {
      try {
        await this.formRef?.validate();

        const data = {
          ...this.form,
          dateofbirth: new Date(this.form.dateofbirth).toISOString(),
        };

        await TeacherService.create(data);
        this.message.success("Docente registrado exitosamente.");
        this.$router.push("/teachers");
      } catch (err) {
        console.error(err);
        this.message.error("Error al registrar docente.");
      }
    },
  },
  created() {
    this.message = useMessage();
  },
};
</script>

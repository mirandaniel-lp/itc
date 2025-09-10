<template>
  <app-layout>
    <div class="min-h-screen">
      <n-card title="Registrar Estudiante" size="large">
        <n-form
          :model="form"
          :rules="rules"
          ref="formRef"
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
            <n-date-picker v-model:value="form.dateofbirth" type="date" />
          </n-form-item>
          <n-form-item label="Lugar de Nacimiento">
            <n-input v-model:value="form.placeofbirth" />
          </n-form-item>
          <n-form-item label="Teléfono" path="phone">
            <n-input v-model:value="form.phone" />
          </n-form-item>
          <n-form-item label="Género" path="gender">
            <n-select v-model:value="form.gender" :options="genderOptions" />
          </n-form-item>
          <n-form-item label="Imagen">
            <input type="file" @change="onImageChange" accept="image/*" />
          </n-form-item>
          <n-button type="primary" @click="submit">Guardar</n-button>
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
import StudentService from "@/services/studentService";

export default {
  name: "CreateStudentView",
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
      message: null,
      formRef: null,
      form: {
        name: "",
        last_name: "",
        second_last_name: "",
        ci: "",
        phone: "",
        gender: null,
        dateofbirth: null,
        placeofbirth: "",
        image: null,
      },
      genderOptions: [
        { label: "MASCULINO", value: "MASCULINO" },
        { label: "FEMENINO", value: "FEMENINO" },
        { label: "OTRO", value: "OTRO" },
      ],
      rules: {
        name: { required: true, message: "Nombre requerido", trigger: "blur" },
        last_name: {
          required: true,
          message: "Apellido requerido",
          trigger: "blur",
        },
        second_last_name: {
          required: true,
          message: "Apellido requerido",
          trigger: "blur",
        },
        phone: {
          required: true,
          message: "Teléfono requerido",
          trigger: "blur",
        },
        gender: {
          required: true,
          message: "Seleccione un género",
          trigger: "change",
        },
        dateofbirth: {
          required: true,
          message: "Seleccione fecha",
          trigger: "change",
        },
      },
    };
  },
  methods: {
    onImageChange(e) {
      const file = e.target.files[0];
      if (file) this.form.image = file;
    },
    async submit() {
      try {
        const formData = new FormData();
        for (const key in this.form) {
          if (this.form[key]) formData.append(key, this.form[key]);
        }
        await StudentService.create(formData);
        this.message.success("Estudiante registrado.");
        this.$router.push("/students");
      } catch {
        this.message.error("Error al registrar estudiante.");
      }
    },
  },
  created() {
    this.message = useMessage();
  },
};
</script>

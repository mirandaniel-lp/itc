<template>
  <app-layout>
    <div class="min-h-screen">
      <n-card title="Registrar Estudiante" size="large">
        <n-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-placement="top"
        >
          <n-form-item label="Nombre" path="name">
            <n-input
              v-model:value="form.name"
              placeholder="Ingrese nombre"
              clearable
            />
          </n-form-item>

          <n-form-item label="Apellido Paterno" path="last_name">
            <n-input
              v-model:value="form.last_name"
              placeholder="Ingrese apellido paterno"
              clearable
            />
          </n-form-item>

          <n-form-item label="Apellido Materno" path="second_last_name">
            <n-input
              v-model:value="form.second_last_name"
              placeholder="Ingrese apellido materno"
              clearable
            />
          </n-form-item>

          <n-form-item label="CI (Carnet de Identidad)">
            <n-input v-model:value="form.ci" placeholder="Opcional" clearable />
          </n-form-item>

          <n-form-item label="Fecha de Nacimiento" path="dateofbirth">
            <n-date-picker
              v-model:value="form.dateofbirth"
              type="date"
              placeholder="Seleccione fecha"
              clearable
            />
          </n-form-item>

          <n-form-item label="Lugar de Nacimiento">
            <n-input
              v-model:value="form.placeofbirth"
              placeholder="Ingrese ciudad o departamento"
              clearable
            />
          </n-form-item>

          <n-form-item label="Teléfono" path="phone">
            <n-input
              v-model:value="form.phone"
              placeholder="Ej: 71234567"
              clearable
            />
          </n-form-item>

          <n-form-item label="Género" path="gender">
            <n-select
              v-model:value="form.gender"
              placeholder="Seleccione género"
              :options="genderOptions"
              clearable
            />
          </n-form-item>

          <n-form-item label="Imagen (foto)">
            <input type="file" accept="image/*" @change="onImageChange" />
            <div v-if="imagePreview" class="mt-2">
              <img
                :src="imagePreview"
                alt="Preview"
                class="w-24 h-24 object-cover rounded border mt-2"
              />
            </div>
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
      formRef: null,
      message: null,
      imagePreview: null,
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
          message: "Seleccione fecha válida",
          trigger: "change",
          validator: (_, val) => {
            if (!val) return false;
            const dob = new Date(val);
            const today = new Date();
            const age = today.getFullYear() - dob.getFullYear();
            return age >= 12 && age <= 70;
          },
        },
      },
    };
  },
  methods: {
    onImageChange(e) {
      const file = e.target.files[0];
      if (file) {
        this.form.image = file;
        this.imagePreview = URL.createObjectURL(file);
      }
    },
    async submit() {
      try {
        await this.formRef?.validate();

        const formData = new FormData();
        for (const key in this.form) {
          if (this.form[key] !== null && this.form[key] !== "") {
            if (key === "dateofbirth") {
              const isoDate = new Date(this.form[key]).toISOString();
              formData.append("dateofbirth", isoDate);
            } else {
              formData.append(key, this.form[key]);
            }
          }
        }
        await StudentService.create(formData);
        this.message.success("Estudiante registrado exitosamente.");
        this.$router.push("/students");
      } catch (err) {
        console.error(err);
        this.message.error("Error al registrar estudiante.");
      }
    },
  },
  created() {
    this.message = useMessage();
  },
};
</script>

<style scoped>
input[type="file"] {
  padding: 0.5rem 0;
}
</style>

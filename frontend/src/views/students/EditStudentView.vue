<template>
  <app-layout>
    <div class="min-h-screen">
      <n-card title="Editar Estudiante" size="large">
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
              value-format="timestamp"
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

          <n-form-item label="Imagen actual">
            <img
              v-if="form.image && !imagePreview"
              :src="`http://localhost:3000${form.image}`"
              class="w-24 h-24 object-cover border rounded"
            />
          </n-form-item>

          <n-form-item label="Nueva imagen">
            <input type="file" accept="image/*" @change="onImageChange" />
            <div v-if="imagePreview" class="mt-2">
              <img
                :src="imagePreview"
                alt="Preview"
                class="w-24 h-24 object-cover border rounded"
              />
            </div>
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
import StudentService from "@/services/studentService";

export default {
  name: "EditStudentView",
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
        gender: "",
        dateofbirth: null,
        placeofbirth: "",
        image: null,
      },
      newImage: null,
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
          message: "Apellido requerido",
          trigger: "blur",
          validator: (_, val) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val),
        },
        second_last_name: {
          required: true,
          message: "Apellido requerido",
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
          message: "Seleccione un género",
          trigger: "change",
        },
        dateofbirth: {
          required: true,
          message: "Seleccione una fecha válida",
          trigger: "change",
          validator: (_, val) => {
            const dob = new Date(val);
            const age = new Date().getFullYear() - dob.getFullYear();
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
        this.newImage = file;
        this.imagePreview = URL.createObjectURL(file);
      }
    },
    async fetchStudent() {
      try {
        const student = await StudentService.getById(this.$route.params.id);
        const rawDate = student.dateofbirth;
        const timestamp =
          typeof rawDate === "number" ? rawDate : new Date(rawDate).getTime();
        this.form = {
          ...student,
          dateofbirth: timestamp,
        };
      } catch (err) {
        this.message.error("Estudiante no encontrado.");
        this.$router.push("/students");
      }
    },
    async submit() {
      try {
        await this.formRef?.validate();
        const formData = new FormData();
        for (const key in this.form) {
          if (this.form[key] && key !== "image") {
            if (key === "dateofbirth") {
              const dateObj = new Date(this.form[key]);
              if (!isNaN(dateObj)) {
                formData.append(key, dateObj.toISOString());
              }
            } else {
              formData.append(key, this.form[key]);
            }
          }
        }
        if (this.newImage) {
          formData.append("image", this.newImage);
        }

        await StudentService.update(this.$route.params.id, formData);
        this.message.success("Estudiante actualizado.");
        this.$router.push("/students");
      } catch {
        this.message.error("Error al actualizar estudiante.");
      }
    },
  },
  created() {
    this.message = useMessage();
    this.fetchStudent();
  },
};
</script>

<style scoped>
input[type="file"] {
  padding: 0.5rem 0;
}
</style>

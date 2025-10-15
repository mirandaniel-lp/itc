<template>
  <app-layout>
    <div class="min-h-screen bg-[#0f172a] p-10 text-white flex justify-center">
      <div
        class="w-full max-w-5xl bg-[#1e293b]/90 border border-[#334155] shadow-[0_8px_30px_rgba(0,0,0,0.6)] rounded-2xl p-10 backdrop-blur-sm"
      >
        <h1 class="text-4xl font-extrabold text-center mb-10 tracking-tight">
          Editar Estudiante
        </h1>

        <n-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-placement="top"
        >
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <n-form-item label="Nombre" path="name">
              <n-input
                v-model:value="form.name"
                placeholder="Ingrese nombre"
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-4 py-2 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 placeholder:text-gray-400"
                clearable
              />
            </n-form-item>

            <n-form-item label="Apellido Paterno" path="last_name">
              <n-input
                v-model:value="form.last_name"
                placeholder="Ingrese apellido paterno"
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-4 py-2 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 placeholder:text-gray-400"
                clearable
              />
            </n-form-item>

            <n-form-item label="Apellido Materno" path="second_last_name">
              <n-input
                v-model:value="form.second_last_name"
                placeholder="Ingrese apellido materno"
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-4 py-2 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 placeholder:text-gray-400"
                clearable
              />
            </n-form-item>

            <n-form-item label="Carnet de Identidad">
              <n-input
                v-model:value="form.ci"
                placeholder="Opcional"
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-4 py-2 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 placeholder:text-gray-400"
                clearable
              />
            </n-form-item>

            <n-form-item label="Fecha de Nacimiento" path="dateofbirth">
              <n-date-picker
                v-model:value="form.dateofbirth"
                value-format="timestamp"
                type="date"
                placeholder="Seleccione fecha"
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-4 py-2 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 placeholder:text-gray-400"
                :theme-overrides="naiveInputTheme"
                clearable
              />
            </n-form-item>

            <n-form-item label="Lugar de Nacimiento">
              <n-input
                v-model:value="form.placeofbirth"
                placeholder="Ingrese ciudad o departamento"
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-4 py-2 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 placeholder:text-gray-400"
                clearable
              />
            </n-form-item>

            <n-form-item label="Teléfono" path="phone">
              <n-input
                v-model:value="form.phone"
                placeholder="Ej: 71234567"
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-4 py-2 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 placeholder:text-gray-400"
                clearable
              />
            </n-form-item>

            <n-form-item label="Género" path="gender">
              <n-select
                v-model:value="form.gender"
                placeholder="Seleccione género"
                :options="genderOptions"
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-4 py-2 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 text-gray-100"
                :theme-overrides="naiveInputTheme"
                clearable
              />
            </n-form-item>
          </div>

          <n-form-item label="Fotografía" class="mt-6">
            <div
              class="relative w-full flex flex-col items-center justify-center border border-[#334155] rounded-2xl p-6 bg-[#0f172a]/60 hover:border-[#3b82f6] transition-all duration-300 overflow-hidden group"
            >
              <input
                type="file"
                accept="image/*"
                class="absolute inset-0 opacity-0 cursor-pointer"
                @change="onImageChange"
              />
              <div v-if="imagePreview" class="mt-3 flex flex-col items-center">
                <img
                  :src="imagePreview"
                  alt="Preview"
                  class="w-28 h-28 rounded-full border-2 border-[#3b82f6]/60 shadow-[0_0_20px_rgba(37,99,235,0.4)] object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <p class="text-xs text-gray-400 mt-2">Haz clic para cambiar</p>
              </div>
              <div
                v-else-if="form.image"
                class="mt-3 flex flex-col items-center"
              >
                <img
                  :src="`http://localhost:3000${form.image}`"
                  class="w-28 h-28 rounded-full border-2 border-[#3b82f6]/60 shadow-[0_0_20px_rgba(37,99,235,0.4)] object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <p class="text-xs text-gray-400 mt-2">Haz clic para cambiar</p>
              </div>
              <div
                v-else
                class="text-gray-400 text-sm flex flex-col items-center group-hover:text-[#60a5fa]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-10 h-10 text-[#3b82f6] mb-1"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 16.5v-9m0 0l-3 3m3-3l3 3M4.5 12a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z"
                  />
                </svg>
                <span>Haz clic para subir imagen</span>
              </div>
            </div>
          </n-form-item>

          <div class="mt-10 flex justify-center gap-4">
            <n-button
              type="default"
              class="bg-[#1e293b] border border-[#334155] text-gray-300 font-bold px-10 py-3 rounded-xl hover:bg-[#334155] hover:text-white hover:scale-105 active:scale-95 transition-all duration-300"
              @click="$router.push('/students')"
            >
              Volver
            </n-button>

            <n-button
              type="primary"
              class="bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white font-extrabold px-10 py-3 rounded-xl shadow-[0_0_25px_rgba(37,99,235,0.6)] hover:shadow-[0_0_40px_rgba(37,99,235,0.9)] hover:scale-105 active:scale-95 transition-all duration-300"
              @click="submit"
            >
              Actualizar
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
      newImage: null,
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
        this.form = { ...student, dateofbirth: timestamp };
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
              if (!isNaN(dateObj)) formData.append(key, dateObj.toISOString());
            } else {
              formData.append(key, this.form[key]);
            }
          }
        }
        if (this.newImage) formData.append("image", this.newImage);
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

<template>
  <app-layout>
    <div class="min-h-screen bg-[#0f172a] p-10 text-white flex justify-center">
      <div
        class="w-full max-w-5xl bg-[#1e293b]/90 border border-[#334155] shadow-[0_8px_30px_rgba(0,0,0,0.6)] rounded-2xl p-10 backdrop-blur-sm"
      >
        <h1 class="text-4xl font-extrabold text-center mb-10 tracking-tight">
          Registrar Docente
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
              />
            </n-form-item>

            <n-form-item label="Apellido Paterno" path="last_name">
              <n-input
                v-model:value="form.last_name"
                placeholder="Ingrese apellido paterno"
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-4 py-2 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 placeholder:text-gray-400"
              />
            </n-form-item>

            <n-form-item label="Apellido Materno" path="second_last_name">
              <n-input
                v-model:value="form.second_last_name"
                placeholder="Ingrese apellido materno"
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-4 py-2 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 placeholder:text-gray-400"
              />
            </n-form-item>

            <n-form-item label="Correo electrónico" path="email">
              <n-input
                v-model:value="form.email"
                type="email"
                placeholder="Ingrese correo electrónico"
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-4 py-2 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 placeholder:text-gray-400"
              />
            </n-form-item>

            <n-form-item label="Carnet de Identidad" path="ci">
              <n-input
                v-model:value="form.ci"
                placeholder="Ingrese carnet de identidad"
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-4 py-2 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 placeholder:text-gray-400"
              />
            </n-form-item>

            <n-form-item label="Fecha de Nacimiento" path="dateofbirth">
              <n-date-picker
                v-model:value="form.dateofbirth"
                type="date"
                placeholder="Seleccione fecha"
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-4 py-2 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 placeholder:text-gray-400"
                :theme-overrides="naiveInputTheme"
                :input-readonly="true"
                clearable
              />
            </n-form-item>

            <n-form-item label="Lugar de Nacimiento" path="placeofbirth">
              <n-input
                v-model:value="form.placeofbirth"
                placeholder="Ciudad o departamento"
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-4 py-2 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 placeholder:text-gray-400"
              />
            </n-form-item>

            <n-form-item label="Teléfono" path="phone">
              <n-input
                v-model:value="form.phone"
                placeholder="Ej: 71234567"
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-4 py-2 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 placeholder:text-gray-400"
              />
            </n-form-item>

            <n-form-item label="Género" path="gender">
              <n-select
                v-model:value="form.gender"
                :options="genderOptions"
                placeholder="Seleccione género"
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-4 py-2 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 text-gray-100"
                :theme-overrides="naiveInputTheme"
                clearable
              />
            </n-form-item>

            <n-form-item label="Especialidad" path="specialty">
              <n-input
                v-model:value="form.specialty"
                placeholder="Ej: Matemáticas, Diseño gráfico..."
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-4 py-2 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 placeholder:text-gray-400"
              />
            </n-form-item>
          </div>

          <div class="mt-10 flex justify-center gap-4">
            <n-button
              type="default"
              class="bg-[#1e293b] border border-[#334155] text-gray-300 font-bold px-10 py-3 rounded-xl hover:bg-[#334155] hover:text-white hover:scale-105 active:scale-95 transition-all duration-300"
              @click="$router.push('/teachers')"
            >
              Volver
            </n-button>

            <n-button
              type="primary"
              class="bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white font-extrabold px-10 py-3 rounded-xl shadow-[0_0_25px_rgba(37,99,235,0.6)] hover:shadow-[0_0_40px_rgba(37,99,235,0.9)] hover:scale-105 active:scale-95 transition-all duration-300"
              @click="modalShow = true"
            >
              Registrar
            </n-button>
          </div>
        </n-form>
      </div>

      <n-modal
        :show="modalShow"
        :auto-focus="false"
        @mask-click="modalShow = false"
      >
        <div
          class="w-[520px] max-w-[92vw] bg-[#111827] text-white rounded-2xl border border-[#334155] p-6 shadow-2xl"
        >
          <h3 class="text-xl font-semibold mb-3">Confirmar registro</h3>
          <p class="text-gray-300">
            Se enviará un correo electrónico al docente con sus credenciales de
            acceso (Carnet de Identidad y PIN). ¿Desea continuar?
          </p>
          <div class="mt-6 flex justify-end gap-3">
            <n-button quaternary @click="modalShow = false">Cancelar</n-button>
            <n-button type="primary" @click="handleConfirm">Registrar</n-button>
          </div>
        </div>
      </n-modal>
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
  NModal,
} from "naive-ui";
import AppLayout from "@/layouts/AppLayout.vue";
import TeacherService from "@/services/teacherService";

export default {
  name: "CreateTeacherView",
  components: {
    AppLayout,
    NForm,
    NFormItem,
    NInput,
    NButton,
    NSelect,
    NDatePicker,
    NModal,
  },
  data() {
    return {
      formRef: null,
      modalShow: false,
      submitting: false,
      form: {
        name: "",
        last_name: "",
        second_last_name: "",
        email: "",
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
        name: { required: true, message: "Nombre requerido", trigger: "blur" },
        last_name: {
          required: true,
          message: "Apellido paterno requerido",
          trigger: "blur",
        },
        second_last_name: {
          required: true,
          message: "Apellido materno requerido",
          trigger: "blur",
        },
        email: [
          { required: true, message: "Correo requerido", trigger: "blur" },
          { type: "email", message: "Correo no válido", trigger: "blur" },
        ],
        ci: {
          required: true,
          message: "Carnet de Identidad requerido",
          trigger: "blur",
        },
        phone: {
          required: true,
          message: "Teléfono requerido",
          trigger: "blur",
        },
        gender: {
          required: true,
          message: "Seleccione género",
          trigger: "change",
        },
      },
    };
  },
  methods: {
    async handleConfirm() {
      if (this.submitting) return;
      await this.formRef?.validate();
      this.submitting = true;
      try {
        const payload = {
          ...this.form,
          dateofbirth: this.form.dateofbirth
            ? new Date(this.form.dateofbirth).toISOString()
            : null,
        };
        await TeacherService.create(payload);
        this.modalShow = false;
        this.$router.push("/teachers");
      } catch (e) {
        console.error(e);
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style></style>

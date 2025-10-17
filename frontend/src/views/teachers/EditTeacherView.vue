<template>
  <app-layout>
    <div class="min-h-screen bg-[#0f172a] p-10 text-white flex justify-center">
      <div
        class="w-full max-w-5xl bg-[#1e293b]/90 border border-[#334155] rounded-2xl p-10 shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
      >
        <h1 class="text-4xl font-extrabold text-center mb-10 tracking-tight">
          Editar Docente
        </h1>

        <n-config-provider :theme-overrides="theme">
          <n-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-placement="top"
            require-mark-placement="right-hanging"
          >
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <n-form-item label="Nombre" path="name">
                <n-input
                  v-model:value="form.name"
                  @update:value="form.name = onlyLetters($event)"
                  size="large"
                  placeholder="Ingrese nombre"
                  clearable
                />
              </n-form-item>

              <n-form-item label="Apellido Paterno" path="last_name">
                <n-input
                  v-model:value="form.last_name"
                  @update:value="form.last_name = onlyLetters($event)"
                  size="large"
                  placeholder="Ingrese apellido paterno"
                  clearable
                />
              </n-form-item>

              <n-form-item label="Apellido Materno" path="second_last_name">
                <n-input
                  v-model:value="form.second_last_name"
                  @update:value="form.second_last_name = onlyLetters($event)"
                  size="large"
                  placeholder="Ingrese apellido materno"
                  clearable
                />
              </n-form-item>

              <n-form-item label="Correo electrónico" path="email">
                <n-input
                  v-model:value="form.email"
                  size="large"
                  placeholder="ejemplo@correo.com"
                  clearable
                />
              </n-form-item>

              <n-form-item label="Carnet de Identidad" path="ci">
                <n-input
                  v-model:value="form.ci"
                  @update:value="form.ci = onlyDigits($event, 12)"
                  size="large"
                  maxlength="12"
                  placeholder="Solo números"
                  clearable
                />
              </n-form-item>

              <n-form-item
                label="Lugar de Nacimiento"
                path="placeofbirth_department"
              >
                <n-select
                  v-model:value="form.placeofbirth_department"
                  :options="departmentsOptions"
                  size="large"
                  placeholder="Seleccione departamento o Extranjero"
                  @update:value="onChangeDepartment"
                  clearable
                />
              </n-form-item>

              <n-form-item
                v-if="form.placeofbirth_department === 'EXTRANJERO'"
                label="País / Ciudad"
                path="placeofbirth_other"
              >
                <n-input
                  v-model:value="form.placeofbirth_other"
                  size="large"
                  placeholder="Ej: Perú, Lima"
                  clearable
                />
              </n-form-item>

              <n-form-item label="Teléfono" path="phone">
                <n-input
                  v-model:value="form.phone"
                  @update:value="form.phone = onlyDigits($event, 8)"
                  size="large"
                  maxlength="8"
                  placeholder="Ej: 71234567"
                  clearable
                />
              </n-form-item>

              <n-form-item label="Género" path="gender">
                <n-select
                  v-model:value="form.gender"
                  :options="genderOptions"
                  size="large"
                  placeholder="Seleccione género"
                  clearable
                />
              </n-form-item>

              <n-form-item label="Especialidad" path="specialty">
                <n-select
                  v-model:value="form.specialty"
                  :options="specialtyOptions"
                  filterable
                  clearable
                  size="large"
                  placeholder="Seleccione especialidad"
                />
              </n-form-item>

              <n-form-item label="Fecha de Nacimiento" path="dateofbirth">
                <n-date-picker
                  v-model:value="form.dateofbirth"
                  type="date"
                  size="large"
                  :is-date-disabled="(ts) => ts > Date.now()"
                  placeholder="Seleccione fecha"
                />
              </n-form-item>
            </div>

            <div class="mt-8 flex justify-center gap-3">
              <n-button
                secondary
                strong
                size="large"
                @click="$router.push('/teachers')"
                >Volver</n-button
              >
              <n-button
                type="primary"
                strong
                size="large"
                :loading="submitting"
                :disabled="submitting"
                @click="submit"
                >Actualizar</n-button
              >
            </div>
          </n-form>
        </n-config-provider>
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
  NConfigProvider,
  useMessage,
} from "naive-ui";
import AppLayout from "@/layouts/AppLayout.vue";
import TeacherService from "@/services/teacherService";

const DEPARTMENTS = [
  "LA PAZ",
  "SANTA CRUZ",
  "COCHABAMBA",
  "ORURO",
  "POTOSÍ",
  "TARIJA",
  "CHUQUISACA",
  "BENI",
  "PANDO",
];

export default {
  name: "EditTeacherView",
  components: {
    AppLayout,
    NForm,
    NFormItem,
    NInput,
    NButton,
    NSelect,
    NDatePicker,
    NConfigProvider,
  },
  data() {
    return {
      formRef: null,
      message: null,
      submitting: false,
      form: {
        name: "",
        last_name: "",
        second_last_name: "",
        email: "",
        ci: "",
        dateofbirth: null,
        placeofbirth_department: null,
        placeofbirth_other: "",
        phone: "",
        gender: null,
        specialty: null,
      },
      genderOptions: [
        { label: "MASCULINO", value: "MASCULINO" },
        { label: "FEMENINO", value: "FEMENINO" },
        { label: "OTRO", value: "OTRO" },
      ],
      specialtyOptions: [
        { label: "Matemáticas", value: "MATEMATICAS" },
        { label: "Lengua y Literatura", value: "LENGUA" },
        { label: "Física", value: "FISICA" },
        { label: "Química", value: "QUIMICA" },
        { label: "Biología", value: "BIOLOGIA" },
        { label: "Ciencias Sociales", value: "SOCIALES" },
        { label: "Historia", value: "HISTORIA" },
        { label: "Geografía", value: "GEOGRAFIA" },
        { label: "Informática", value: "INFORMATICA" },
        { label: "Programación", value: "PROGRAMACION" },
        { label: "Inglés", value: "INGLES" },
        { label: "Educación Física", value: "ED_FISICA" },
        { label: "Música", value: "MUSICA" },
        { label: "Artes Plásticas", value: "ARTES" },
        { label: "Filosofía", value: "FILOSOFIA" },
        { label: "Economía", value: "ECONOMIA" },
        { label: "Contabilidad", value: "CONTABILIDAD" },
      ],
      departmentsOptions: [
        { label: "La Paz", value: "LA PAZ" },
        { label: "Santa Cruz", value: "SANTA CRUZ" },
        { label: "Cochabamba", value: "COCHABAMBA" },
        { label: "Oruro", value: "ORURO" },
        { label: "Potosí", value: "POTOSÍ" },
        { label: "Tarija", value: "TARIJA" },
        { label: "Chuquisaca", value: "CHUQUISACA" },
        { label: "Beni", value: "BENI" },
        { label: "Pando", value: "PANDO" },
        { label: "Extranjero", value: "EXTRANJERO" },
      ],
      theme: {
        common: { primaryColor: "#2563eb" },
        Input: {
          color: "rgba(15,23,42,0.7)",
          textColor: "#e5e7eb",
          placeholderColor: "#94a3b8",
          borderColor: "#334155",
          borderColorHover: "#3b82f6",
          borderRadius: "12px",
          heightLarge: "44px",
        },
        Select: {
          peers: {
            InternalSelection: {
              color: "rgba(15,23,42,0.7)",
              textColor: "#e5e7eb",
              placeholderColor: "#94a3b8",
              borderColor: "#334155",
              borderColorHover: "#3b82f6",
              borderRadius: "12px",
              heightLarge: "44px",
            },
          },
        },
        DatePicker: {
          peers: {
            Input: {
              color: "rgba(15,23,42,0.7)",
              textColor: "#e5e7eb",
              placeholderColor: "#94a3b8",
              borderColor: "#334155",
              borderColorHover: "#3b82f6",
              borderRadius: "12px",
              heightLarge: "44px",
            },
          },
        },
        Button: { textColor: "#ffffff" },
      },
      rules: {
        name: [
          { required: true, message: "Nombre requerido", trigger: "blur" },
          {
            pattern: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/,
            message: "Solo letras",
            trigger: ["blur", "input"],
          },
        ],
        last_name: [
          {
            required: true,
            message: "Apellido paterno requerido",
            trigger: "blur",
          },
          {
            pattern: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/,
            message: "Solo letras",
            trigger: ["blur", "input"],
          },
        ],
        second_last_name: [
          {
            required: true,
            message: "Apellido materno requerido",
            trigger: "blur",
          },
          {
            pattern: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/,
            message: "Solo letras",
            trigger: ["blur", "input"],
          },
        ],
        email: [
          { required: true, message: "Correo requerido", trigger: "blur" },
          { type: "email", message: "Correo no válido", trigger: "blur" },
        ],
        ci: [
          {
            required: true,
            message: "Carnet de Identidad requerido",
            trigger: "blur",
          },
          {
            pattern: /^\d{5,12}$/,
            message: "Solo números (5–12)",
            trigger: ["blur", "input"],
          },
        ],
        phone: [
          { required: true, message: "Teléfono requerido", trigger: "blur" },
          {
            pattern: /^[67]\d{7}$/,
            message: "8 dígitos, inicia 6/7",
            trigger: ["blur", "input"],
          },
        ],
        gender: [
          { required: true, message: "Seleccione género", trigger: "change" },
        ],
        specialty: [
          {
            required: true,
            message: "Seleccione especialidad",
            trigger: "change",
          },
        ],
        dateofbirth: [
          {
            required: true,
            message: "Seleccione fecha válida",
            trigger: "change",
          },
        ],
        placeofbirth_department: [
          {
            required: true,
            message: "Seleccione lugar de nacimiento",
            trigger: "change",
          },
        ],
        placeofbirth_other: [
          {
            validator: (r, v) =>
              this.form.placeofbirth_department === "EXTRANJERO"
                ? !!(v && v.trim())
                : true,
            message: "Ingrese país/ciudad",
            trigger: ["blur", "input", "change"],
          },
        ],
      },
    };
  },
  methods: {
    onlyLetters(v) {
      return (v || "").replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]/g, "");
    },
    onlyDigits(v, max) {
      const s = (v || "").replace(/\D/g, "");
      return max ? s.slice(0, max) : s;
    },
    onChangeDepartment(v) {
      this.form.placeofbirth_department = v;
      if (v !== "EXTRANJERO") this.form.placeofbirth_other = "";
      this.$nextTick(() => this.formRef?.validate(["placeofbirth_other"]));
    },
    normalizeDate(v) {
      return typeof v === "number" ? v : v ? new Date(v).getTime() : null;
    },
    async fetchTeacher() {
      const t = await TeacherService.getById(this.$route.params.id);
      const pob = (t.placeofbirth || "").toUpperCase();
      const isDept = DEPARTMENTS.includes(pob);
      this.form = {
        name: t.name || "",
        last_name: t.last_name || "",
        second_last_name: t.second_last_name || "",
        email: t.email || "",
        ci: t.ci || "",
        dateofbirth: this.normalizeDate(t.dateofbirth),
        placeofbirth_department: isDept ? pob : "EXTRANJERO",
        placeofbirth_other: isDept ? "" : t.placeofbirth || "",
        phone: t.phone || "",
        gender: t.gender || null,
        specialty: t.specialty || null,
      };
    },
    async submit() {
      if (this.submitting) return;
      await this.formRef?.validate();
      this.submitting = true;
      try {
        const payload = {
          name: this.form.name,
          last_name: this.form.last_name,
          second_last_name: this.form.second_last_name,
          email: this.form.email,
          ci: this.form.ci,
          dateofbirth: this.form.dateofbirth
            ? new Date(this.form.dateofbirth).toISOString()
            : null,
          placeofbirth:
            this.form.placeofbirth_department === "EXTRANJERO"
              ? this.form.placeofbirth_other
              : this.form.placeofbirth_department,
          phone: this.form.phone,
          gender: this.form.gender,
          specialty: this.form.specialty,
        };
        await TeacherService.update(this.$route.params.id, payload);
        this.$router.push("/teachers");
      } finally {
        this.submitting = false;
      }
    },
  },
  created() {
    this.message = useMessage();
    this.fetchTeacher();
  },
};
</script>

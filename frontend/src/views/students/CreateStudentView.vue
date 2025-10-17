<template>
  <app-layout>
    <div class="min-h-screen bg-[#0f172a] p-10 text-white flex justify-center">
      <div
        class="w-full max-w-5xl bg-[#1e293b]/90 border border-[#334155] rounded-2xl p-10 shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
      >
        <h1 class="text-4xl font-extrabold text-center mb-10 tracking-tight">
          Registrar Estudiante
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

              <n-form-item label="Carnet de Identidad" path="ci">
                <n-input
                  v-model:value="form.ci"
                  @update:value="form.ci = onlyDigits($event, 12)"
                  size="large"
                  maxlength="12"
                  placeholder="Ingrese Carnet de Identidad"
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
                />
              </n-form-item>
              <n-form-item label="Fecha de Nacimiento" path="dateofbirth">
                <n-date-picker
                  v-model:value="form.dateofbirth"
                  type="date"
                  size="large"
                  class="w-100"
                  :is-date-disabled="(ts) => ts > Date.now()"
                  placeholder="Fecha de Nacimiento"
                />
              </n-form-item>
            </div>

            <n-form-item label="Fotografía">
              <n-upload
                :file-list="fileList"
                :max="1"
                accept="image/png,image/jpeg"
                :default-upload="false"
                :on-before-upload="beforeUpload"
                @change="onUploadChange"
              >
                <n-upload-dragger>
                  <div class="text-center">
                    <div class="text-sm text-gray-300">
                      Haz clic o arrastra una imagen (JPG/PNG, máx. 1)
                    </div>
                  </div>
                </n-upload-dragger>
              </n-upload>
            </n-form-item>

            <div class="mt-8 flex justify-center gap-3">
              <n-button
                secondary
                strong
                size="large"
                @click="$router.push('/students')"
                >Volver</n-button
              >
              <n-button type="primary" strong size="large" @click="submit"
                >Guardar</n-button
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
  NUpload,
  NUploadDragger,
  NConfigProvider,
  useMessage,
} from "naive-ui";
import AppLayout from "@/layouts/AppLayout.vue";
import StudentService from "@/services/studentService";

export default {
  name: "CreateStudentView",
  components: {
    AppLayout,
    NForm,
    NFormItem,
    NInput,
    NButton,
    NSelect,
    NDatePicker,
    NUpload,
    NUploadDragger,
    NConfigProvider,
  },
  data() {
    return {
      formRef: null,
      message: null,
      fileList: [],
      form: {
        name: "",
        last_name: "",
        second_last_name: "",
        ci: "",
        phone: "",
        gender: null,
        dateofbirth: null,
        placeofbirth_department: null,
        placeofbirth_other: "",
      },
      genderOptions: [
        { label: "Masculino", value: "MASCULINO" },
        { label: "Femenino", value: "FEMENINO" },
        { label: "Otro", value: "OTRO" },
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
        Upload: {
          draggerBorder: "1px solid #334155",
          draggerBorderHover: "1px solid #3b82f6",
          draggerColor: "rgba(15,23,42,0.6)",
          itemColorHover: "rgba(30,41,59,0.9)",
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
    beforeUpload({ file }) {
      const ok = ["image/jpeg", "image/png"].includes(file.type);
      if (!ok) this.message?.error("Solo imágenes JPG o PNG");
      return ok;
    },
    onUploadChange({ fileList }) {
      this.fileList = fileList;
    },
    async submit() {
      try {
        await this.formRef?.validate();
        const form = new FormData();
        form.append("name", this.form.name);
        form.append("last_name", this.form.last_name);
        form.append("second_last_name", this.form.second_last_name);
        form.append("ci", this.form.ci);
        form.append("phone", this.form.phone);
        form.append("gender", this.form.gender);
        if (this.form.dateofbirth)
          form.append(
            "dateofbirth",
            new Date(this.form.dateofbirth).toISOString()
          );
        const placeOfBirth =
          this.form.placeofbirth_department === "EXTRANJERO"
            ? this.form.placeofbirth_other
            : this.form.placeofbirth_department;
        form.append("placeofbirth", placeOfBirth || "");
        const file = this.fileList[0]?.file;
        if (file) form.append("image", file);
        await StudentService.create(form);
        this.message.success("Estudiante registrado exitosamente.");
        this.$router.push("/students");
      } catch {
        this.message?.error("Error al registrar estudiante.");
      }
    },
  },
  created() {
    this.message = useMessage();
  },
};
</script>

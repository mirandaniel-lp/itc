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

              <n-form-item label="Correo Electrónico" path="email">
                <n-input
                  v-model:value="form.email"
                  size="large"
                  placeholder="Ingrese correo electrónico"
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
            </div>

            <n-form-item label="Fotografía">
              <div
                class="grid gap-6 lg:grid-cols-[200px,1fr] items-start w-full"
              >
                <div class="flex justify-center">
                  <div
                    class="relative w-48 h-48 rounded-xl overflow-hidden ring-1 ring-[#334155] bg-[#0b1220] flex items-center justify-center"
                  >
                    <img
                      v-if="previewUrl"
                      :src="previewUrl"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="text-slate-400">Sin imagen</div>
                    <div
                      v-if="uploading"
                      class="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-end"
                    >
                      <div class="w-full h-1.5 bg-white/10">
                        <div
                          class="h-1.5 bg-[#3b82f6] transition-all"
                          :style="{ width: uploadPct + '%' }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <n-upload
                    :file-list="fileList"
                    :max="1"
                    accept="image/png,image/jpeg"
                    :default-upload="false"
                    :show-file-list="false"
                    :on-before-upload="beforeUpload"
                    :on-remove="onRemoveImage"
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
                  <div class="mt-3 flex gap-2">
                    <n-button
                      size="small"
                      tertiary
                      @click="onRemoveImage"
                      v-if="fileList.length || previewUrl"
                      >Quitar</n-button
                    >
                  </div>
                </div>
              </div>
            </n-form-item>

            <div class="mt-8 flex justify-center gap-3">
              <n-button
                secondary
                strong
                size="large"
                @click="$router.push('/students')"
                >Volver</n-button
              >
              <n-button
                type="primary"
                strong
                size="large"
                @click="submit"
                :loading="uploading"
                >Guardar</n-button
              >
            </div>
          </n-form>
        </n-config-provider>
      </div>
    </div>
  </app-layout>
</template>

<script setup>
import {
  NForm,
  NFormItem,
  NInput,
  NButton,
  NDatePicker,
  NSelect,
  NUpload,
  NUploadDragger,
  NConfigProvider,
  useMessage,
} from "naive-ui";
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import AppLayout from "@/layouts/AppLayout.vue";
import StudentService from "@/services/studentService";

const router = useRouter();
const message = useMessage();
const formRef = ref(null);
const fileList = ref([]);
const previewUrl = ref(null);
const uploading = ref(false);
const uploadPct = ref(0);

const genderOptions = [
  { label: "Masculino", value: "MASCULINO" },
  { label: "Femenino", value: "FEMENINO" },
  { label: "Otro", value: "OTRO" },
];

const departmentsOptions = [
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
];

const theme = {
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
  },
  Button: { textColor: "#ffffff" },
};

const form = reactive({
  name: "",
  last_name: "",
  second_last_name: "",
  ci: "",
  email: "",
  phone: "",
  gender: null,
  dateofbirth: null,
  placeofbirth_department: null,
  placeofbirth_other: "",
});

const rules = {
  name: [
    { required: true, message: "Nombre requerido", trigger: "blur" },
    {
      pattern: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/,
      message: "Solo letras",
      trigger: ["blur", "input"],
    },
  ],
  last_name: [
    { required: true, message: "Apellido paterno requerido", trigger: "blur" },
    {
      pattern: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/,
      message: "Solo letras",
      trigger: ["blur", "input"],
    },
  ],
  second_last_name: [
    { required: true, message: "Apellido materno requerido", trigger: "blur" },
    {
      pattern: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/,
      message: "Solo letras",
      trigger: ["blur", "input"],
    },
  ],
  ci: [
    {
      validator: (_, v) => !v || /^\d{5,12}$/.test(v),
      message: "Solo números (5–12)",
      trigger: ["blur", "input"],
    },
  ],
  email: [
    {
      validator: (_, v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: "Correo inválido",
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
  gender: [{ required: true, message: "Seleccione género", trigger: "change" }],
  placeofbirth_department: [
    {
      required: true,
      message: "Seleccione lugar de nacimiento",
      trigger: "change",
    },
  ],
  placeofbirth_other: [
    {
      validator: () =>
        form.placeofbirth_department === "EXTRANJERO"
          ? !!(form.placeofbirth_other && form.placeofbirth_other.trim())
          : true,
      message: "Ingrese país/ciudad",
      trigger: ["blur", "input", "change"],
    },
  ],
};

const onlyLetters = (v) =>
  (v || "").replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]/g, "");
const onlyDigits = (v, max) => {
  const s = (v || "").replace(/\D/g, "");
  return max ? s.slice(0, max) : s;
};
const onChangeDepartment = (v) => {
  form.placeofbirth_department = v;
  if (v !== "EXTRANJERO") form.placeofbirth_other = "";
};
const beforeUpload = ({ file }) =>
  ["image/jpeg", "image/png"].includes(file.type);
const onUploadChange = ({ fileList: fl }) => {
  fileList.value = fl;
  const f = fl[0]?.file;
  previewUrl.value = f ? URL.createObjectURL(f) : previewUrl.value;
  uploadPct.value = 0;
};
const onRemoveImage = () => {
  fileList.value = [];
  previewUrl.value = null;
  uploadPct.value = 0;
};

const submit = async () => {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }
  const fd = new FormData();
  fd.append("name", form.name);
  fd.append("last_name", form.last_name);
  fd.append("second_last_name", form.second_last_name);
  if (form.ci) fd.append("ci", form.ci);
  if (form.email) fd.append("email", form.email);
  fd.append("phone", form.phone);
  fd.append("gender", form.gender);
  fd.append("dateofbirth", new Date(form.dateofbirth).toISOString());
  const pob =
    form.placeofbirth_department === "EXTRANJERO"
      ? form.placeofbirth_other
      : form.placeofbirth_department;
  fd.append("placeofbirth", pob || "");
  const file = fileList.value[0]?.file;
  if (file) fd.append("image", file);
  uploading.value = true;
  await StudentService.create(fd, (p) => (uploadPct.value = p));
  uploading.value = false;
  message.success("Estudiante registrado.");
  router.push("/students");
};
</script>

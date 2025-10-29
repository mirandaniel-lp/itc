<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <div class="text-2xl font-bold">Perfil</div>
        <div class="text-sm text-gray-400">
          Gestiona tu información personal
        </div>
      </div>
      <n-button strong secondary round @click="openPin = true">
        <template #icon
          ><n-icon><LockClosedOutline /></n-icon
        ></template>
        Cambiar PIN
      </n-button>
    </div>

    <n-card>
      <template #header>
        <div class="flex items-center gap-3">
          <n-avatar size="large">{{ initials }}</n-avatar>
          <div>
            <div class="font-semibold">{{ fullName || "Docente" }}</div>
            <div class="text-xs text-gray-400">
              {{ form.email || "sin correo" }}
            </div>
          </div>
          <div class="ml-auto">
            <n-tag type="info" round size="small">Docente</n-tag>
          </div>
        </div>
      </template>

      <n-form ref="formRef" :model="form" :rules="rules" label-placement="top">
        <div class="grid md:grid-cols-2 gap-4">
          <n-form-item label="Nombre" path="name">
            <n-input v-model:value="form.name">
              <template #prefix
                ><n-icon><PersonCircleOutline /></n-icon
              ></template>
            </n-input>
          </n-form-item>
          <n-form-item label="Apellido" path="last_name">
            <n-input v-model:value="form.last_name">
              <template #prefix
                ><n-icon><PersonCircleOutline /></n-icon
              ></template>
            </n-input>
          </n-form-item>
          <n-form-item label="Segundo Apellido" path="second_last_name">
            <n-input v-model:value="form.second_last_name">
              <template #prefix
                ><n-icon><PersonCircleOutline /></n-icon
              ></template>
            </n-input>
          </n-form-item>
          <n-form-item label="CI">
            <n-input v-model:value="form.ci" disabled>
              <template #prefix
                ><n-icon><CardOutline /></n-icon
              ></template>
            </n-input>
          </n-form-item>
          <n-form-item label="Correo" path="email">
            <n-input v-model:value="form.email">
              <template #prefix
                ><n-icon><MailOutline /></n-icon
              ></template>
            </n-input>
          </n-form-item>
          <n-form-item label="Teléfono" path="phone">
            <n-input v-model:value="form.phone">
              <template #prefix
                ><n-icon><CallOutline /></n-icon
              ></template>
            </n-input>
          </n-form-item>
          <n-form-item label="Especialidad" path="specialty">
            <n-input v-model:value="form.specialty">
              <template #prefix
                ><n-icon><RibbonOutline /></n-icon
              ></template>
            </n-input>
          </n-form-item>
          <n-form-item label="Lugar de Nacimiento" path="placeofbirth">
            <n-input v-model:value="form.placeofbirth">
              <template #prefix
                ><n-icon><PinOutline /></n-icon
              ></template>
            </n-input>
          </n-form-item>
        </div>
      </n-form>

      <div class="flex justify-end mt-2">
        <n-button tertiary @click="load">Restablecer</n-button>
        <n-button class="ml-2" type="primary" :loading="saving" @click="save">
          <template #icon
            ><n-icon><CreateOutline /></n-icon
          ></template>
          Guardar cambios
        </n-button>
      </div>
    </n-card>

    <n-modal
      v-model:show="openPin"
      preset="card"
      title="Cambiar PIN"
      :style="{ width: '420px' }"
    >
      <n-form
        ref="pinFormRef"
        :model="pinForm"
        :rules="pinRules"
        label-placement="top"
      >
        <div class="grid gap-3">
          <n-form-item label="PIN Actual" path="currentPin">
            <n-input
              v-model:value="pinForm.currentPin"
              type="password"
              show-password-on="mousedown"
            >
              <template #prefix
                ><n-icon><LockClosedOutline /></n-icon
              ></template>
            </n-input>
          </n-form-item>
          <n-form-item label="Nuevo PIN" path="newPin">
            <n-input
              v-model:value="pinForm.newPin"
              type="password"
              show-password-on="mousedown"
              maxlength="6"
            />
          </n-form-item>
          <n-form-item label="Confirmar Nuevo PIN" path="confirmPin">
            <n-input
              v-model:value="pinForm.confirmPin"
              type="password"
              show-password-on="mousedown"
              maxlength="6"
            />
          </n-form-item>
        </div>
      </n-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button :disabled="savingPin" @click="openPin = false"
            >Cancelar</n-button
          >
          <n-button type="primary" :loading="savingPin" @click="changePin"
            >Cambiar PIN</n-button
          >
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  NCard,
  NButton,
  NInput,
  NModal,
  NForm,
  NFormItem,
  NIcon,
  NAvatar,
  NTag,
  useMessage,
} from "naive-ui";
import {
  PersonCircleOutline,
  CardOutline,
  MailOutline,
  CallOutline,
  RibbonOutline,
  PinOutline,
  LockClosedOutline,
  CreateOutline,
} from "@vicons/ionicons5";
import TeacherSessionService from "@/services/teacherSessionService";

const message = useMessage();

const formRef = ref(null);
const pinFormRef = ref(null);

const form = ref({
  name: "",
  last_name: "",
  second_last_name: "",
  ci: "",
  email: "",
  phone: "",
  specialty: "",
  placeofbirth: "",
});
const saving = ref(false);

const openPin = ref(false);
const pinForm = ref({ currentPin: "", newPin: "", confirmPin: "" });
const savingPin = ref(false);

const fullName = computed(() =>
  [form.value.name, form.value.last_name].filter(Boolean).join(" ")
);
const initials = computed(() => {
  const a = (form.value.name || "").trim()[0] || "D";
  const b = (form.value.last_name || "").trim()[0] || "";
  return (a + b).toUpperCase();
});

const emailValidator = (_r, v) => {
  if (!v) return true;
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  return ok || new Error("Correo inválido");
};
const phoneValidator = (_r, v) => {
  if (!v) return true;
  const ok = /^[0-9\-+\s]{6,15}$/.test(v);
  return ok || new Error("Teléfono inválido");
};

const rules = {
  name: [{ required: true, message: "Ingrese su nombre" }],
  last_name: [{ required: true, message: "Ingrese su apellido" }],
  email: [{ validator: emailValidator, trigger: ["blur", "input"] }],
  phone: [{ validator: phoneValidator, trigger: ["blur", "input"] }],
};

const pinRules = {
  currentPin: [{ required: true, message: "Ingrese su PIN actual" }],
  newPin: [
    { required: true, message: "Ingrese el nuevo PIN" },
    {
      validator: (_r, v) =>
        /^\d{4,6}$/.test(v) ? true : new Error("El PIN debe tener 4–6 dígitos"),
      trigger: ["input", "blur"],
    },
  ],
  confirmPin: [
    { required: true, message: "Confirme el nuevo PIN" },
    {
      validator: (_r, v) =>
        v === pinForm.value.newPin ? true : new Error("Los PIN no coinciden"),
      trigger: ["input", "blur"],
    },
  ],
};

async function load() {
  try {
    const t = await TeacherSessionService.getProfile();
    form.value = {
      name: t.name || "",
      last_name: t.last_name || "",
      second_last_name: t.second_last_name || "",
      ci: t.ci || "",
      email: t.email || "",
      phone: t.phone || "",
      specialty: t.specialty || "",
      placeofbirth: t.placeofbirth || "",
    };
  } catch (e) {
    message.error(e?.response?.data?.error || "No se pudo cargar el perfil");
  }
}

async function save() {
  try {
    await formRef.value?.validate();
  } catch {
    message.warning("Revise los campos del formulario");
    return;
  }
  saving.value = true;
  try {
    const updated = await TeacherSessionService.updateProfile(form.value);
    const teacherLS =
      JSON.parse(localStorage.getItem("teacher") || "null") || {};
    localStorage.setItem(
      "teacher",
      JSON.stringify({ ...teacherLS, ...updated })
    );
    message.success("Se guardaron los cambios");
  } catch (e) {
    message.error(e?.response?.data?.error || "No se pudo guardar");
  } finally {
    saving.value = false;
  }
}

async function changePin() {
  try {
    await pinFormRef.value?.validate();
  } catch {
    return;
  }
  savingPin.value = true;
  try {
    await TeacherSessionService.changePin(
      pinForm.value.currentPin,
      pinForm.value.newPin
    );
    message.success("PIN actualizado correctamente");
    openPin.value = false;
    pinForm.value = { currentPin: "", newPin: "", confirmPin: "" };
  } catch (e) {
    message.error(e?.response?.data?.error || "No se pudo cambiar el PIN");
  } finally {
    savingPin.value = false;
  }
}

onMounted(load);
</script>

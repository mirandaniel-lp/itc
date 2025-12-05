<template>
  <app-layout>
    <div class="mx-auto max-w-6xl p-6 md:p-8 space-y-6">
      <div>
        <h1 class="text-3xl md:text-4xl font-extrabold">Mi Perfil</h1>
        <p class="text-sm text-white/60">
          Administra tu información y seguridad
        </p>
      </div>

      <n-card
        class="bg-gradient-to-br from-[#0b1220] to-[#0f1b33] border border-white/10"
      >
        <div class="flex items-center gap-4">
          <div
            class="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-xl font-extrabold"
          >
            {{ initials }}
          </div>
          <div class="min-w-0">
            <div class="text-xl font-extrabold truncate">
              {{ user?.email || "-" }}
            </div>
            <div class="text-sm text-white/70">
              {{ user?.role?.name || "-" }}
            </div>
            <div class="mt-1">
              <n-tag
                v-if="user?.email_verified_at"
                size="small"
                type="success"
                round
                >Email verificado</n-tag
              >
              <n-tag v-else size="small" type="warning" round
                >Sin verificar</n-tag
              >
              <n-tag
                class="ml-2"
                size="small"
                :type="user?.status ? 'success' : 'error'"
                round
                >{{ user?.status ? "Activo" : "Inactivo" }}</n-tag
              >
            </div>
          </div>
        </div>
      </n-card>

      <n-card class="border border-white/10 bg-white/5">
        <n-tabs
          v-model:value="tab"
          type="line"
          justify-content="start"
          size="large"
        >
          <n-tab-pane name="email" tab="Actualizar Email">
            <div class="max-w-2xl">
              <div class="text-sm text-white/70 mb-2">Nuevo Email</div>
              <n-input
                v-model:value="emailForm.email"
                placeholder="nuevo@email.com"
                size="large"
              />
              <n-button
                class="mt-4 w-full md:w-auto md:min-w-[260px]"
                type="primary"
                size="large"
                :loading="savingEmail"
                @click="saveEmail"
                >Actualizar Email</n-button
              >
            </div>
          </n-tab-pane>
          <n-tab-pane name="password" tab="Cambiar Contraseña">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
              <n-input
                type="password"
                show-password-on="mousedown"
                v-model:value="passForm.current_password"
                placeholder="Actual"
                size="large"
              />
              <n-input
                type="password"
                show-password-on="mousedown"
                v-model:value="passForm.new_password"
                placeholder="Nueva"
                size="large"
              />
              <n-input
                type="password"
                show-password-on="mousedown"
                v-model:value="passForm.confirm"
                placeholder="Confirmar"
                size="large"
              />
            </div>
            <div class="mt-4 flex justify-end">
              <n-button
                type="primary"
                size="large"
                :loading="savingPass"
                @click="savePass"
                >Actualizar contraseña</n-button
              >
            </div>
          </n-tab-pane>
        </n-tabs>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <n-card
            class="bg-white/5 border border-white/10"
            content-style="padding:0"
          >
            <div class="p-5">
              <div class="text-lg font-extrabold mb-4">
                Información de Sesión
              </div>
              <div class="space-y-3 text-sm">
                <div>
                  <div class="text-white/60">Inicio de Sesión</div>
                  <div class="font-semibold">{{ sessionInfo.iat || "-" }}</div>
                </div>
                <div>
                  <div class="text-white/60">Expira En</div>
                  <div class="font-semibold">{{ sessionInfo.exp || "-" }}</div>
                </div>
              </div>
            </div>
          </n-card>
          <n-card
            class="bg-white/5 border border-white/10"
            content-style="padding:0"
          >
            <div class="p-5">
              <div class="text-lg font-extrabold mb-4">
                Información del Dispositivo
              </div>
              <div class="space-y-3 text-sm">
                <div>
                  <div class="text-white/60">Sistema Operativo</div>
                  <div class="font-semibold">{{ device.os }}</div>
                </div>
                <div>
                  <div class="text-white/60">Navegador</div>
                  <div class="font-semibold">{{ device.browser }}</div>
                </div>
              </div>
            </div>
          </n-card>
        </div>
      </n-card>
    </div>
  </app-layout>
</template>

<script setup>
import AppLayout from "@/layouts/AppLayout.vue";
import { ref, computed, onMounted } from "vue";
import {
  useMessage,
  NCard,
  NButton,
  NInput,
  NTabs,
  NTabPane,
  NTag,
} from "naive-ui";
import profileService from "@/services/profileService";

const message = useMessage();
const user = ref(null);
const tab = ref("email");
const emailForm = ref({ email: "" });
const passForm = ref({ current_password: "", new_password: "", confirm: "" });
const savingEmail = ref(false);
const savingPass = ref(false);

const initials = computed(() => {
  const e = user.value?.email || "";
  const n = e.split("@")[0] || "";
  const parts = n
    .replace(/[^a-zA-Z0-9]/g, " ")
    .trim()
    .split(/\s+/);
  const a = (parts[0] || "U")[0];
  const b = (parts[1] || "")[0] || "";
  return (a + b).toUpperCase();
});

function fmt(ts) {
  if (!ts) return null;
  const d = new Date(ts * 1000);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("es-BO");
}
function decodeJWT(t) {
  try {
    const p = t.split(".")[1];
    const b = atob(p.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(b)));
  } catch {
    return {};
  }
}
const sessionInfo = computed(() => {
  const t =
    (document.cookie.match(/(?:^|;\s*)token=([^;]+)/) || [])[1] ||
    localStorage.getItem("token") ||
    "";
  const d = decodeJWT(t);
  return { iat: fmt(d.iat) || "-", exp: fmt(d.exp) || "-" };
});

function parseUA() {
  const ua = navigator.userAgent;
  let os = "Desconocido",
    browser = "Desconocido";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS X/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Linux/i.test(ua)) os = "Linux";
  const m = ua.match(/(Chrome|Firefox|Safari|Edg|Opera|OPR)\/([\d.]+)/);
  if (m) {
    const map = { Edg: "Edge", OPR: "Opera" };
    browser = `${map[m[1]] || m[1]} ${m[2].split(".")[0]}`;
  }
  return { os, browser };
}
const device = ref(parseUA());

async function loadMe() {
  const u = await profileService.me();
  user.value = u;
  emailForm.value.email = u?.email || "";
}

async function saveEmail() {
  if (!emailForm.value.email || !/.+@.+\..+/.test(emailForm.value.email))
    return message.error("Correo inválido");
  savingEmail.value = true;
  try {
    const u = await profileService.updateEmail(emailForm.value.email);
    user.value = u;
    message.success("Correo actualizado");
  } catch (e) {
    message.error(e?.response?.data?.error || "Error al actualizar correo");
  } finally {
    savingEmail.value = false;
  }
}

async function savePass() {
  if (!passForm.value.current_password || !passForm.value.new_password)
    return message.error("Complete los campos");
  if (passForm.value.new_password.length < 8)
    return message.error(
      "La nueva contraseña debe tener al menos 8 caracteres"
    );
  if (passForm.value.new_password !== passForm.value.confirm)
    return message.error("La confirmación no coincide");
  savingPass.value = true;
  try {
    await profileService.changePassword({
      current_password: passForm.value.current_password,
      new_password: passForm.value.new_password,
    });
    passForm.value = { current_password: "", new_password: "", confirm: "" };
    message.success("Contraseña actualizada");
  } catch (e) {
    message.error(e?.response?.data?.error || "Error al actualizar contraseña");
  } finally {
    savingPass.value = false;
  }
}

onMounted(loadMe);
</script>

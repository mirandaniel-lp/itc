<template>
  <app-layout>
    <div class="bg-[#0f172a] p-10 text-white flex justify-center">
      <div
        class="w-full max-w-5xl bg-[#1e293b]/90 border border-[#334155] rounded-2xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
        v-if="loaded"
      >
        <div class="flex items-center justify-between mb-8">
          <h1 class="text-3xl lg:text-4xl font-extrabold tracking-tight">
            Editar Usuario
          </h1>
          <div
            :class="[
              'px-3 py-1 rounded-full text-xs font-bold',
              user.status
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-600/40'
                : 'bg-rose-600/20 text-rose-300 border border-rose-600/40',
            ]"
          >
            {{ user.status ? "ACTIVO" : "INACTIVO" }}
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div
            class="col-span-2 rounded-xl border border-[#334155] bg-[#0b1220]/40 p-5"
          >
            <div class="text-xs uppercase tracking-widest text-white/60 mb-3">
              Identificación
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div class="text-xs text-white/60">ID</div>
                <div class="text-lg font-semibold">{{ user.id || "—" }}</div>
              </div>
              <div>
                <div class="text-xs text-white/60">Email</div>
                <div class="text-lg font-semibold break-all">
                  {{ user.email || "—" }}
                </div>
              </div>
              <div>
                <div class="text-xs text-white/60">Correo verificado</div>
                <div class="text-lg font-semibold">
                  {{
                    user.email_verified_at
                      ? formatDate(user.email_verified_at)
                      : "No"
                  }}
                </div>
              </div>
              <div>
                <div class="text-xs text-white/60">Rol actual</div>
                <div class="text-lg font-semibold">{{ currentRoleName }}</div>
              </div>
            </div>
          </div>

          <div class="rounded-xl border border-[#334155] bg-[#0b1220]/40 p-5">
            <div class="text-xs uppercase tracking-widest text-white/60 mb-3">
              Trazabilidad
            </div>
            <div class="space-y-3">
              <div>
                <div class="text-xs text-white/60">Creado</div>
                <div class="text-sm font-medium">
                  {{ user.created_at ? formatDateTime(user.created_at) : "—" }}
                </div>
              </div>
              <div>
                <div class="text-xs text-white/60">Actualizado</div>
                <div class="text-sm font-medium">
                  {{ user.updated_at ? formatDateTime(user.updated_at) : "—" }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <n-config-provider :theme-overrides="theme">
          <n-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-placement="top"
            require-mark-placement="right-hanging"
          >
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <n-form-item label="Email" path="email">
                <n-input v-model:value="form.email" size="large" disabled />
              </n-form-item>
              <n-form-item label="Rol del usuario" path="roleId">
                <n-select
                  v-model:value="form.roleId"
                  :options="roleOptions"
                  size="large"
                  placeholder="Selecciona un rol"
                />
              </n-form-item>
            </div>

            <div class="mt-8 flex justify-center gap-3">
              <n-button
                secondary
                strong
                size="large"
                @click="$router.push('/users')"
                >Volver</n-button
              >
              <n-button
                type="primary"
                strong
                size="large"
                :loading="saving"
                @click="submit"
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
import AppLayout from "@/layouts/AppLayout.vue";
import {
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NButton,
  NConfigProvider,
  useMessage,
} from "naive-ui";
import UserService from "@/services/userService";

export default {
  name: "EditUserView",
  components: {
    AppLayout,
    NForm,
    NFormItem,
    NInput,
    NSelect,
    NButton,
    NConfigProvider,
  },
  data() {
    return {
      message: null,
      saving: false,
      loaded: false,
      user: {
        id: null,
        email: "",
        email_verified_at: null,
        roleId: null,
        role: { name: "" },
        created_at: null,
        updated_at: null,
        status: true,
      },
      form: {
        email: "",
        roleId: null,
      },
      roleOptions: [
        { label: "ADMINISTRADOR", value: 1 },
        { label: "GERENTE", value: 2 },
        { label: "SECRETARÍA", value: 3 },
        { label: "USUARIO", value: 4 },
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
        Button: { textColor: "#ffffff" },
      },
    };
  },
  computed: {
    currentRoleName() {
      const r = this.roleOptions.find((x) => x.value === this.user.roleId);
      return r ? r.label : this.user.role?.name || "—";
    },
  },
  methods: {
    formatDate(v) {
      const d = new Date(v);
      return isNaN(d)
        ? "—"
        : d.toLocaleDateString("es-BO", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
    },
    formatDateTime(v) {
      const d = new Date(v);
      return isNaN(d)
        ? "—"
        : d.toLocaleString("es-BO", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
    },
    async fetchUser() {
      try {
        const id = parseInt(this.$route.params.id);
        const user = await UserService.getUser(id);
        this.user = user;
        this.form.email = user.email;
        this.form.roleId = user.roleId;
        this.loaded = true;
      } catch {
        this.message.error("Usuario no encontrado.");
        this.$router.push("/users");
      }
    },
    async submit() {
      try {
        this.saving = true;
        const id = parseInt(this.$route.params.id);
        await UserService.updateUser(id, { roleId: this.form.roleId });
        this.message.success("Rol actualizado.");
        this.$router.push("/users");
      } catch {
        this.message.error("Error al actualizar.");
      } finally {
        this.saving = false;
      }
    },
  },
  created() {
    this.message = useMessage();
    this.fetchUser();
  },
};
</script>

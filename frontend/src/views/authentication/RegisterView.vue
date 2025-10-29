<template>
  <auth-card title="Registrar">
    <n-form :model="formData" :rules="rules" ref="formRef">
      <TextInput
        v-model="formData.email"
        label="Correo Electrónico"
        type="email"
        placeholder="Ingresar Correo Electrónico"
        class="my-5"
      />

      <TextInput
        v-model="formData.password"
        label="Contraseña"
        type="password"
        placeholder="Ingresar Contraseña"
        class="my-5"
      />

      <TextInput
        v-model="formData.confirmPassword"
        label="Confirmar Contraseña"
        type="password"
        placeholder="Confirmar Contraseña"
        class="my-5"
      />

      <PrimaryButton
        :loading="isLoading"
        @click="handleRegister"
        class="mt-3"
        :disabled="isLoading"
      >
        Registrar
      </PrimaryButton>

      <div class="text-center mt-5 space-y-2">
        <p class="text-white font-extrabold">
          ¿Ya registrado?
          <n-button
            text
            @click="goToLogin"
            class="text-[#3b82f6] font-extrabold hover:underline transition-colors duration-200"
          >
            Iniciar Sesión
          </n-button>
        </p>
      </div>
    </n-form>
  </auth-card>
</template>

<script>
import AuthCard from "@/components/AuthCard.vue";
import PrimaryButton from "@/components/PrimaryButton.vue";
import TextInput from "@/components/TextInput.vue";
import AuthService from "@/services/authService";
import { useMessage } from "naive-ui";
import { useRouter } from "vue-router";

export default {
  name: "RegisterView",
  components: { AuthCard, PrimaryButton, TextInput },

  setup() {
    const message = useMessage();
    const router = useRouter();
    return { message, router };
  },

  data() {
    return {
      isLoading: false,
      formData: {
        email: "",
        password: "",
        confirmPassword: "",
      },
      rules: {
        email: [
          {
            required: true,
            message: "El correo es obligatorio.",
            trigger: ["input", "blur"],
          },
          {
            type: "email",
            message: "Ingresa un correo válido.",
            trigger: ["input", "blur"],
          },
        ],
        password: [
          {
            required: true,
            message: "La contraseña es obligatoria.",
            trigger: ["input", "blur"],
          },
          {
            min: 6,
            message: "Mínimo 6 caracteres.",
            trigger: ["input", "blur"],
          },
        ],
        confirmPassword: [
          {
            required: true,
            message: "Confirma tu contraseña.",
            trigger: ["input", "blur"],
          },
        ],
      },
    };
  },

  methods: {
    async handleRegister() {
      if (this.isLoading) return;

      const { email, password, confirmPassword } = this.formData;
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!email || !password || !confirmPassword) {
        this.message.warning("Completa los campos requeridos.");
        return;
      }
      if (!emailOk) {
        this.message.warning("Ingresa un correo válido.");
        return;
      }
      if (password.length < 6) {
        this.message.warning("La contraseña debe tener al menos 6 caracteres.");
        return;
      }
      if (password !== confirmPassword) {
        this.message.warning("Las contraseñas no coinciden.");
        return;
      }

      this.isLoading = true;
      try {
        const payload = { email, password, roleId: 2 };
        const { message: okMsg, user } = await AuthService.register(payload);
        if (!user) throw new Error("Error al crear el usuario");
        this.message.success(okMsg || "¡Registro exitoso! Inicia sesión.");
        this.$router.push("/login");
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Error al registrar.";
        this.message.error(msg);
      } finally {
        this.isLoading = false;
      }
    },

    goToLogin() {
      this.$router.push("/login");
    },
  },
};
</script>

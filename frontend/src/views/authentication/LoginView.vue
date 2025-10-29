<template>
  <auth-card title="Iniciar Sesión">
    <n-form :model="formData" :rules="rules" ref="formRef">
      <TextInput
        v-model="formData.email"
        label="Correo Electrónico"
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

      <PrimaryButton :loading="isLoading" @click="handleLogin" class="mt-3">
        Iniciar Sesión
      </PrimaryButton>

      <div class="text-center mt-5 space-y-2">
        <p class="text-white font-extrabold">
          ¿No tienes cuenta?
          <n-button
            text
            @click="goToRegister"
            class="text-[#3b82f6] font-extrabold hover:underline transition-colors duration-200"
          >
            Regístrate
          </n-button>
        </p>

        <p class="text-white font-extrabold">
          ¿Eres docente?
          <n-button
            text
            @click="goToTeacherLogin"
            class="text-[#3b82f6] font-extrabold hover:underline transition-colors duración-200"
          >
            Inicia Sesión
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
  name: "LoginView",
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
      },
    };
  },

  methods: {
    async handleLogin() {
      if (this.isLoading) return;

      const isValid = await this.$refs.formRef
        ?.validate()
        .then(() => true)
        .catch(() => false);

      if (!isValid) {
        this.message.warning("Completa los campos requeridos.");
        return;
      }

      this.isLoading = true;
      try {
        const { message: okMsg, token } = await AuthService.login(
          this.formData.email,
          this.formData.password
        );
        if (!token) throw new Error("NO_TOKEN");
        this.message.success(okMsg || "¡Bienvenido de nuevo!");
        this.$router.push("/home");
      } catch (err) {
        const status = err?.response?.status;
        const serverMsg =
          err?.response?.data?.message || err?.response?.data?.error || "";

        if (status === 401)
          this.message.error(
            "Credenciales incorrectas. Ingrese correo/contraseña."
          );
        else if (status === 403)
          this.message.error(serverMsg || "Acceso denegado.");
        else if (status === 422)
          this.message.warning(serverMsg || "Datos inválidos.");
        else if (!status || err?.code === "ERR_NETWORK")
          this.message.error("No se pudo conectar con el servidor.");
        else this.message.error(serverMsg || "Error al iniciar sesión.");
      } finally {
        this.isLoading = false;
      }
    },

    goToRegister() {
      this.$router.push("/register");
    },

    goToTeacherLogin() {
      this.$router.push("/teacher/login");
    },
  },
};
</script>

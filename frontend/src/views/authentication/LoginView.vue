<template>
  <auth-card title="Iniciar Sesión">
    <n-form :model="formData" :rules="rules" ref="formRef">
      <n-form-item label="Email" path="email">
        <n-input
          v-model:value="formData.email"
          placeholder="Ingresa Correo Electrónico"
        />
      </n-form-item>

      <n-form-item label="Contraseña" path="password">
        <n-input
          v-model:value="formData.password"
          type="password"
          show-password-on="click"
          placeholder="Ingresa tu Contraseña"
        />
      </n-form-item>

      <n-button type="primary" block secondary strong @click="handleLogin">
        Iniciar Sesión
      </n-button>

      <div class="text-center mt-4">
        <n-button text @click="goToRegister">
          ¿No tienes cuenta? Regístrate
        </n-button>
      </div>
      <div class="text-center mt-4">
        <n-button text @click="goToTeacherLogin">
          ¿Eres docente? Inicia Sesión
        </n-button>
      </div>
    </n-form>
  </auth-card>
</template>

<script>
import AuthCard from "@/components/AuthCard.vue";
import AuthService from "@/services/authService";
import { useMessage } from "naive-ui";
import { useRouter } from "vue-router";

export default {
  name: "LoginView",
  components: {
    AuthCard,
  },

  setup() {
    const message = useMessage();
    const router = useRouter();
    return { message, router };
  },

  data() {
    return {
      formData: {
        email: "",
        password: "",
      },
      rules: {
        email: [
          { required: true, message: "Por favor ingresa tu email" },
          { type: "email", message: "Por favor ingresa un email válido" },
        ],
        password: [
          { required: true, message: "Por favor ingresa tu contraseña" },
          { min: 6, message: "La contraseña debe tener al menos 6 caracteres" },
        ],
      },
    };
  },

  methods: {
    async handleLogin() {
      try {
        await this.$refs.formRef?.validate();
        const { message: responseMessage, token } = await AuthService.login(
          this.formData.email,
          this.formData.password
        );

        if (token) {
          this.message.success(responseMessage || "¡Bienvenido de nuevo!");
          this.$router.push("/home");
        } else {
          throw new Error("No se recibió el token de autenticación");
        }
      } catch (error) {
        console.error("Error de login:", error);
        this.message.error(
          error.message || "Error al iniciar sesión. Intenta nuevamente."
        );
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

<style></style>

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
            class="text-[#3b82f6] font-extrabold hover:underline transition-colors duration-200"
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
  components: {
    AuthCard,
    PrimaryButton,
    TextInput,
  },

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
      this.isLoading = true;
      await new Promise((r) => setTimeout(r, 2000));
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
        this.message.error(
          error.message || "Error al iniciar sesión. Intenta nuevamente."
        );
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

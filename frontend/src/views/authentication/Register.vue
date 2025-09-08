<template>
  <auth-card title="Crear Cuenta">
    <n-form :model="formData" :rules="rules" ref="formRef">
      <n-form-item label="Email" path="email">
        <n-input
          v-model:value="formData.email"
          type="email"
          placeholder="ejemplo@email.com"
        />
      </n-form-item>

      <n-form-item label="Contraseña" path="password">
        <n-input
          v-model:value="formData.password"
          type="password"
          show-password-on="click"
          placeholder="Crear contraseña"
        />
      </n-form-item>

      <n-form-item label="Confirmar Contraseña" path="confirmPassword">
        <n-input
          v-model:value="formData.confirmPassword"
          type="password"
          show-password-on="click"
          placeholder="Confirmar contraseña"
        />
      </n-form-item>

      <n-button type="primary" block secondary strong @click="handleRegister">
        Crear Cuenta
      </n-button>

      <div class="text-center mt-4">
        <n-button text @click="goToLogin">
          ¿Ya tienes cuenta? Inicia sesión
        </n-button>
      </div>
    </n-form>
  </auth-card>
</template>

<script>
import AuthCard from "@/components/AuthCard.vue";
import AuthService from "@/services/authenticationService";
import { useMessage } from "naive-ui";
import { useRouter } from "vue-router";

export default {
  name: "RegisterView",

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
        confirmPassword: "",
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
        confirmPassword: [
          { required: true, message: "Por favor confirma tu contraseña" },
          {
            validator: (rule, value) => value === this.formData.password,
            message: "Las contraseñas no coinciden",
          },
        ],
      },
    };
  },

  methods: {
    async handleRegister() {
      try {
        await this.$refs.formRef?.validate();

        const userData = {
          email: this.formData.email,
          password: this.formData.password,
          roleId: 2,
        };

        const { message: responseMessage, user } = await AuthService.register(
          userData
        );

        if (user) {
          this.message.success(
            responseMessage || "¡Registro exitoso! Por favor inicia sesión."
          );
          console.log("Usuario registrado:", user);
          this.$router.push("/login");
        } else {
          throw new Error("Error al crear el usuario");
        }
      } catch (error) {
        console.error("Error de registro:", error);
        this.message.error(
          error.response?.data?.error ||
            error.message ||
            "Error al registrar. Intenta nuevamente."
        );
      }
    },

    goToLogin() {
      this.$router.push("/login");
    },
  },
};
</script>

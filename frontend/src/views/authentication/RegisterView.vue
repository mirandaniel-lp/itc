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

      <PrimaryButton :loading="isLoading" @click="handleRegister" class="mt-3">
        Registrar
      </PrimaryButton>

      <div class="text-center mt-5 space-y-2">
        <n-button
          text
          @click="goToLogin"
          class="text-[#3b82f6] hover:underline"
        >
          ¿Ya tienes cuenta? Inicia sesión
        </n-button>
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
      this.isLoading = true;
      await new Promise((r) => setTimeout(r, 2000));
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
          this.$router.push("/login");
        } else {
          throw new Error("Error al crear el usuario");
        }
      } catch (error) {
        this.message.error(
          error.response?.data?.error ||
            error.message ||
            "Error al registrar. Intenta nuevamente."
        );
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

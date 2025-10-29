<template>
  <auth-card title="Ingreso Docente">
    <n-form :model="formData" :rules="rules" ref="formRef">
      <TextInput
        v-model="formData.ci"
        label="Carnet de Identidad"
        placeholder="Ingrese su Carnet de Identidad"
        class="my-5"
      />
      <TextInput
        v-model="formData.password"
        label="PIN"
        type="password"
        placeholder="Ingrese su PIN"
        class="my-5"
      />
      <PrimaryButton :loading="isLoading" @click="handleLogin" class="mt-3">
        Ingresar
      </PrimaryButton>

      <div class="text-center mt-5 space-y-2">
        <p class="text-white font-extrabold">
          ¿Eres administrativo?
          <n-button
            text
            @click="goToUserLogin"
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
import { useMessage } from "naive-ui";
import TeacherSessionService from "@/services/teacherSessionService";

export default {
  name: "TeacherLoginView",
  components: { AuthCard, PrimaryButton, TextInput },
  setup() {
    const message = useMessage();
    return { message };
  },
  data() {
    return {
      isLoading: false,
      formData: { ci: "", password: "" },
      rules: {
        ci: [{ required: true, message: "Ingrese su CI" }],
        password: [{ required: true, message: "Ingrese su PIN" }],
      },
    };
  },
  methods: {
    async handleLogin() {
      this.isLoading = true;
      try {
        await this.$refs.formRef?.validate();
        const res = await TeacherSessionService.login(this.formData);
        const { token, teacher } = res;
        if (!token || !teacher) {
          this.message.error("Respuesta inválida del servidor.");
          return;
        }
        localStorage.removeItem("user");
        localStorage.setItem("token", token);
        localStorage.setItem("teacher", JSON.stringify(teacher));
        localStorage.setItem("sessionType", "TEACHER");
        this.message.success("¡Bienvenido, docente!");
        try {
          await this.$router.replace({ path: "/teacher/dashboard" });
          window.location.reload();
        } catch {
          window.location.href = "/teacher/dashboard";
        }
      } catch (error) {
        const msg =
          error?.response?.data?.error ||
          error?.message ||
          "Error al iniciar sesión.";
        this.message.error(msg);
      } finally {
        this.isLoading = false;
      }
    },

    goToUserLogin() {
      this.$router.push("/login");
    },
  },
};
</script>

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
    </n-form>
  </auth-card>
</template>

<script>
import AuthCard from "@/components/AuthCard.vue";
import PrimaryButton from "@/components/PrimaryButton.vue";
import TextInput from "@/components/TextInput.vue";
import { useMessage } from "naive-ui";
import TeacherService from "@/services/teacherService";

export default {
  name: "TeacherLoginView",
  components: {
    AuthCard,
    PrimaryButton,
    TextInput,
  },

  setup() {
    const message = useMessage();
    return { message };
  },

  data() {
    return {
      isLoading: false,
      formData: {
        ci: "",
        password: "",
      },
      rules: {
        ci: [{ required: true, message: "Ingrese su CI" }],
        password: [{ required: true, message: "Ingrese su PIN" }],
      },
    };
  },

  methods: {
    async handleLogin() {
      this.isLoading = true;
      await new Promise((r) => setTimeout(r, 2000));
      try {
        await this.$refs.formRef?.validate();
        await TeacherService.login(this.formData);
        this.message.success("¡Bienvenido, docente!");
        this.$router.push("/teacher/dashboard");
      } catch (error) {
        this.message.error(
          error.response?.data?.error || "Error al iniciar sesión."
        );
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

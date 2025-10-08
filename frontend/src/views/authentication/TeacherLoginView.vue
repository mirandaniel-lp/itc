<template>
  <auth-card title="Ingreso Docente">
    <n-form :model="formData" :rules="rules" ref="formRef" class="space-y-4">
      <n-form-item label="Carnet de Identidad" path="ci">
        <n-input
          v-model:value="formData.ci"
          placeholder="Ingrese su Carnet de Identidad"
          clearable
          size="large"
          autofocus
        />
      </n-form-item>
      <n-form-item label="PIN" path="password">
        <n-input
          v-model:value="formData.password"
          type="password"
          show-password-on="click"
          placeholder="Ingrese su PIN"
          clearable
          size="large"
        />
      </n-form-item>
      <n-button type="primary" block secondary strong @click="handleLogin">
        Ingresar
      </n-button>
    </n-form>
  </auth-card>
</template>

<script>
import AuthCard from "@/components/AuthCard.vue";
import { useMessage } from "naive-ui";
import axios from "axios";

export default {
  name: "TeacherLoginView",
  components: { AuthCard },
  data() {
    return {
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
  setup() {
    const message = useMessage();
    return { message };
  },
  methods: {
    async handleLogin() {
      try {
        await this.$refs.formRef?.validate();
        const res = await axios.post(
          "http://localhost:3000/api/teachers/login",
          this.formData
        );
        const { token, teacher } = res.data;
        localStorage.removeItem("user");
        localStorage.setItem("token", token);
        localStorage.setItem("teacher", JSON.stringify(teacher));
        this.message.success("¡Bienvenido, docente!");
        this.$router.push("/teacher/dashboard");
      } catch (error) {
        this.message.error(
          error.response?.data?.error || "Error al iniciar sesión."
        );
      }
    },
  },
};
</script>

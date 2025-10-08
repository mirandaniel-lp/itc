<template>
  <app-layout>
    <div class="min-h-screen p-4">
      <n-card title="Registrar Actividad" size="large">
        <n-form @submit.prevent="submit" label-placement="top">
          <n-form-item label="Título" required>
            <n-input
              v-model:value="title"
              placeholder="Título de la actividad"
            />
          </n-form-item>
          <n-form-item label="Descripción">
            <n-input
              v-model:value="description"
              type="textarea"
              placeholder="Descripción"
              :autosize="{ minRows: 2, maxRows: 4 }"
            />
          </n-form-item>
          <n-form-item label="Curso" required>
            <n-select
              v-model:value="courseId"
              :options="courseOptions"
              placeholder="Selecciona un curso"
            />
          </n-form-item>
          <n-form-item label="Docente" required>
            <n-select
              v-model:value="teacherId"
              :options="teacherOptions"
              placeholder="Selecciona un docente"
            />
          </n-form-item>
          <div class="flex justify-end mt-4">
            <n-button type="primary" attr-type="submit">Registrar</n-button>
          </div>
        </n-form>
      </n-card>
    </div>
  </app-layout>
</template>

<script>
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NButton,
  useMessage,
} from "naive-ui";
import AppLayout from "@/layouts/AppLayout.vue";
import ActivityService from "@/services/activityService";
import CourseService from "@/services/courseService";
import TeacherService from "@/services/teacherService";
export default {
  name: "CreateActivityView",
  components: {
    AppLayout,
    NCard,
    NForm,
    NFormItem,
    NInput,
    NSelect,
    NButton,
  },
  data() {
    return {
      title: "",
      description: "",
      courseId: null,
      teacherId: null,
      courses: [],
      teachers: [],
      courseOptions: [],
      teacherOptions: [],
      message: null,
    };
  },
  async mounted() {
    this.message = useMessage();
    try {
      const resCourses = await CourseService.getAll();
      this.courses = resCourses;
      this.courseOptions = this.courses.map((c) => ({
        label: `${c.name} - ${c.parallel}`,
        value: c.id,
      }));
      const resTeachers = await TeacherService.getAll();
      this.teachers = resTeachers;
      this.teacherOptions = this.teachers.map((t) => ({
        label: t.name,
        value: t.id,
      }));
    } catch (err) {
      this.message.error("Error al cargar datos.");
    }
  },
  methods: {
    async submit() {
      try {
        await ActivityService.create({
          title: this.title,
          description: this.description,
          courseId: this.courseId,
          teacherId: this.teacherId,
        });
        this.message.success("Actividad registrada correctamente.");
        this.$router.push("/activities");
      } catch {
        this.message.error("Error al registrar actividad.");
      }
    },
  },
};
</script>

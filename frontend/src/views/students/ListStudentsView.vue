<template>
  <app-layout>
    <div class="min-h-screen">
      <n-card title="Estudiantes" size="large">
        <n-table :bordered="false" :striped="true">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre Completo</th>
              <th>CI</th>
              <th>Teléfono</th>
              <th>Género</th>
              <th>Fecha Nac.</th>
              <th>Imagen</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in students" :key="student.id">
              <td>{{ student.id }}</td>
              <td>
                {{ student.name }} {{ student.last_name }}
                {{ student.second_last_name }}
              </td>
              <td>{{ student.ci || "-" }}</td>
              <td>{{ student.phone }}</td>
              <td>{{ student.gender }}</td>
              <td>{{ new Date(student.dateofbirth).toLocaleDateString() }}</td>
              <td>
                <img
                  v-if="student.image"
                  :src="`http://localhost:3000${student.image}`"
                  alt="foto"
                  class="w-12 h-12 object-cover rounded-full border"
                />
                <span v-else>-</span>
              </td>
              <td>
                <n-space>
                  <n-button
                    size="small"
                    @click="$router.push(`/students/${student.id}/edit`)"
                  >
                    Editar
                  </n-button>
                  <n-popconfirm
                    @positive-click="eliminar(student.id)"
                    positive-text="Sí"
                    negative-text="No"
                  >
                    <template #trigger>
                      <n-button size="small" type="error">Eliminar</n-button>
                    </template>
                    ¿Eliminar este estudiante?
                  </n-popconfirm>
                </n-space>
              </td>
            </tr>
          </tbody>
        </n-table>
        <div class="mt-4">
          <n-button type="primary" @click="$router.push('/students/create')">
            + Nuevo Estudiante
          </n-button>
        </div>
      </n-card>
    </div>
  </app-layout>
</template>

<script>
import {
  NCard,
  NTable,
  NButton,
  NPopconfirm,
  NSpace,
  useMessage,
} from "naive-ui";
import AppLayout from "@/layouts/AppLayout.vue";
import StudentService from "@/services/studentService";

export default {
  name: "ListStudentsView",
  components: {
    AppLayout,
    NCard,
    NTable,
    NButton,
    NPopconfirm,
    NSpace,
  },
  data() {
    return {
      students: [],
      message: null,
    };
  },
  methods: {
    async fetchStudents() {
      try {
        this.students = await StudentService.getAll();
      } catch {
        this.message.error("Error al cargar estudiantes.");
      }
    },
    async eliminar(id) {
      try {
        await StudentService.remove(id);
        this.message.success("Estudiante eliminado.");
        this.fetchStudents();
      } catch {
        this.message.error("No se pudo eliminar.");
      }
    },
  },
  created() {
    this.message = useMessage();
    this.fetchStudents();
  },
};
</script>

<style scoped>
table img {
  transition: 0.3s ease;
}
table img:hover {
  transform: scale(1.1);
}
</style>

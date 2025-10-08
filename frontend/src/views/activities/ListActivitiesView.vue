<template>
  <app-layout>
    <div class="min-h-screen p-4">
      <n-card title="Actividades" size="large">
        <div class="mb-4 flex flex-wrap justify-between items-center gap-2">
          <n-input
            v-model:value="search"
            placeholder="Buscar por título"
            clearable
            @input="handleSearch"
            style="max-width: 300px"
          />
          <n-button type="primary" @click="$router.push('/activities/create')">
            + Nueva
          </n-button>
        </div>
        <div class="mb-4">
          <n-select
            v-model:value="selectedCourse"
            :options="courseOptions"
            placeholder="Filtrar por curso"
            @update:value="fetchActivities"
            style="max-width: 300px"
          />
        </div>
        <n-data-table
          :loading="isLoading"
          :columns="columns"
          :data="paginatedData"
          :pagination="false"
          :bordered="false"
          :striped="true"
        />
        <div class="flex justify-end mt-4">
          <n-pagination
            v-model:page="currentPage"
            :page-size="itemsPerPage"
            :item-count="filteredActivities.length"
            show-quick-jumper
          />
        </div>
      </n-card>
    </div>
  </app-layout>
</template>

<script>
import {
  NCard,
  NDataTable,
  NButton,
  NInput,
  NPagination,
  NSelect,
  useMessage,
} from "naive-ui";
import AppLayout from "@/layouts/AppLayout.vue";
import ActivityService from "@/services/activityService";
import CourseService from "@/services/courseService";
import { h } from "vue";

export default {
  name: "ListActivitiesView",
  components: {
    AppLayout,
    NCard,
    NDataTable,
    NButton,
    NInput,
    NPagination,
    NSelect,
  },
  data() {
    return {
      activities: [],
      filteredActivities: [],
      search: "",
      currentPage: 1,
      itemsPerPage: 10,
      isLoading: false,
      selectedCourse: null,
      courses: [],
      courseOptions: [],
      message: null,
    };
  },
  computed: {
    columns() {
      return [
        { title: "#", key: "id", width: 60 },
        { title: "Título", key: "title" },
        { title: "Descripción", key: "description" },
        {
          title: "Docente",
          key: "teacher",
          render: (row) =>
            row.teacher
              ? `${row.teacher.name} ${row.teacher.last_name || ""}`
              : "-",
        },
        {
          title: "Acciones",
          key: "actions",
          render: (row) =>
            h(
              "button",
              {
                class: "n-button n-button--info n-button--small",
                onClick: () => this.$router.push(`/activities/${row.id}`),
              },
              "Ver Calificaciones"
            ),
        },
      ];
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredActivities.slice(start, start + this.itemsPerPage);
    },
  },
  methods: {
    async fetchCourses() {
      this.isLoading = true;
      try {
        const res = await CourseService.getAll();
        this.courses = res;
        this.courseOptions = this.courses.map((c) => ({
          label: `${c.name} - ${c.parallel}`,
          value: c.id,
        }));
        if (this.courses.length) {
          this.selectedCourse = this.courses[0].id;
          await this.fetchActivities();
        }
      } catch (err) {
        this.message.error("Error al cargar cursos.");
      } finally {
        this.isLoading = false;
      }
    },
    async fetchActivities() {
      if (!this.selectedCourse) return;
      this.isLoading = true;
      try {
        const res = await ActivityService.getActivitiesByCourse(
          this.selectedCourse
        );
        this.activities = res;
        this.filteredActivities = [...this.activities];
        this.handleSearch();
      } catch (err) {
        this.message.error("Error al cargar actividades.");
      } finally {
        this.isLoading = false;
      }
    },
    handleSearch() {
      const query = this.search.toLowerCase();
      this.filteredActivities = this.activities.filter((activity) =>
        activity.title.toLowerCase().includes(query)
      );
      this.currentPage = 1;
    },
  },
  created() {
    this.message = useMessage();
    this.fetchCourses();
  },
};
</script>

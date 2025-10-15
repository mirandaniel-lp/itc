<template>
  <app-layout>
    <div class="min-h-screen p-8 bg-[#0f172a] text-white">
      <div class="max-w-6xl mx-auto space-y-8">
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <h1 class="text-4xl font-extrabold text-[#ffffff]">Actividades</h1>
          <div class="relative w-full md:w-80">
            <input
              v-model="search"
              @input="handleSearch"
              type="text"
              placeholder="Buscar por título"
              class="w-full h-12 bg-[#1e293b]/95 border border-[#334155] rounded-lg pl-4 pr-11 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300"
            />
          </div>
        </div>

        <div class="mb-4 flex gap-4">
          <n-select
            v-model:value="selectedCourse"
            :options="courseOptions"
            placeholder="Filtrar por curso"
            @update:value="fetchActivities"
            style="max-width: 300px"
            size="large"
            class="bg-[#0f172a]/70 border-[#334155] rounded-lg"
          />
          <n-select
            v-model:value="selectedModality"
            :options="modalityOptions"
            placeholder="Filtrar por modalidad"
            @update:value="fetchActivities"
            style="max-width: 300px"
            size="large"
            class="bg-[#0f172a]/70 border-[#334155] rounded-lg"
          />
        </div>

        <div
          class="rounded-2xl overflow-hidden border border-[#334155] shadow-[0_6px_25px_rgba(0,0,0,0.4)] bg-[#1e293b]/80 backdrop-blur-sm"
        >
          <n-data-table
            :loading="isLoading"
            :columns="columns"
            :data="paginatedData"
            :pagination="false"
            :bordered="false"
            size="large"
            class="[&_.n-data-table-th]:text-center [&_.n-data-table-th]:font-extrabold [&_.n-data-table-td]:text-center [&_.n-data-table-tr:hover]:bg-[#1d4ed8]/20 transition-all"
          />
        </div>

        <div class="flex justify-end mt-6">
          <n-pagination
            v-model:page="currentPage"
            :page-size="itemsPerPage"
            :item-count="filteredActivities.length"
            :show-quick-jumper="false"
            class="rounded-xl font-extrabold px-3 py-2 bg-[#1e293b] border border-[#3b82f6]/60 shadow-[0_0_20px_rgba(37,99,235,0.3)] text-white [&_.n-pagination-item]:bg-transparent [&_.n-pagination-item]:text-gray-200 [&_.n-pagination-item--active]:bg-[#2563eb] [&_.n-pagination-item--active]:text-white"
          />
        </div>
      </div>
    </div>
  </app-layout>
</template>

<script>
import { h } from "vue"; // Importa la función `h` para renderizar dinámicamente.
import { NDataTable, NPagination, NSelect, useMessage } from "naive-ui";
import AppLayout from "@/layouts/AppLayout.vue";
import ActivityService from "@/services/activityService";
import CourseService from "@/services/courseService";
import ModalityService from "@/services/modalityService";

export default {
  name: "ListActivitiesView",
  components: {
    AppLayout,
    NDataTable,
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
      selectedModality: null,
      courses: [],
      courseOptions: [],
      modalityOptions: [],
      message: null,
      columns: [
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
          title: "Calificaciones",
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
      ],
    };
  },
  computed: {
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
    async fetchModalities() {
      try {
        const res = await ModalityService.getAll();
        this.modalityOptions = res.map((m) => ({
          label: m.name,
          value: m.id,
        }));
      } catch {
        this.message.error("Error al cargar modalidades.");
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
    this.fetchModalities();
  },
};
</script>

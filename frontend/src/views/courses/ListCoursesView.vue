<template>
  <app-layout>
    <div class="min-h-screen p-8 bg-[#0f172a] text-white">
      <div class="max-w-7xl mx-auto space-y-8">
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <h1 class="text-4xl font-extrabold">Lista de Cursos</h1>

          <div class="flex items-center gap-3 w-full md:w-auto">
            <div class="relative w-full md:w-80">
              <input
                v-model="search"
                @input="handleSearch"
                type="text"
                placeholder="Buscar por nombre o paralelo"
                class="w-full h-12 bg-[#1e293b]/95 border border-[#334155] rounded-lg pl-4 pr-11 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300"
              />
              <n-icon
                :component="SearchOutline"
                class="absolute right-3 top-[14px] text-[#60a5fa]"
                size="20"
              />
            </div>

            <n-button
              type="primary"
              size="large"
              class="rounded-lg font-extrabold"
              @click="$router.push('/courses/create')"
            >
              + Nuevo
            </n-button>
          </div>
        </div>

        <!-- Content -->
        <div
          class="rounded-2xl border border-[#334155] shadow-[0_6px_25px_rgba(0,0,0,0.4)] bg-[#0b1220]/70 backdrop-blur-sm p-6"
        >
          <!-- Loading skeleton -->
          <div
            v-if="isLoading"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr"
          >
            <div
              v-for="i in 9"
              :key="i"
              class="h-64 rounded-2xl bg-[#1e293b]/60 border border-[#334155] animate-pulse"
            />
          </div>

          <!-- Cards -->
          <div
            v-else
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr"
          >
            <div
              v-for="c in paginatedData"
              :key="c.id"
              class="group rounded-2xl border border-[#334155] bg-[#0f172a]/80 hover:bg-[#111a2e] transition-all duration-300 shadow-[0_4px_18px_rgba(0,0,0,0.35)] overflow-hidden h-full"
            >
              <!-- Card body aligned with flex -->
              <div class="p-5 flex flex-col h-full min-h-[280px]">
                <!-- Título y chip -->
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <h2 class="text-xl font-extrabold leading-6 line-clamp-2">
                      {{ c.name }}
                      <span class="text-[#60a5fa]">({{ c.parallel }})</span>
                    </h2>
                    <p class="text-xs text-gray-400 mt-1">ID #{{ c.id }}</p>
                  </div>
                  <span
                    class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#1d4ed8]/20 text-[#93c5fd] border border-[#1d4ed8]/40 shrink-0"
                  >
                    {{ c.modality?.name || "—" }}
                  </span>
                </div>

                <!-- Details -->
                <div class="grid grid-cols-2 gap-3 text-sm mt-4">
                  <div class="flex items-center gap-2 text-gray-300 min-w-0">
                    <n-icon :component="PersonOutline" size="18" />
                    <span class="truncate">
                      {{
                        c.teacher
                          ? `${c.teacher.name} ${c.teacher.last_name}`
                          : "Sin docente"
                      }}
                    </span>
                  </div>
                  <div
                    class="flex items-center gap-2 text-gray-300 justify-end"
                  >
                    <n-icon :component="LayersOutline" size="18" />
                    <span>Paralelo {{ c.parallel }}</span>
                  </div>

                  <div class="flex items-center gap-2 text-gray-300">
                    <n-icon :component="CalendarOutline" size="18" />
                    <span
                      >Inicio:
                      {{ c.start_date ? formatDate(c.start_date) : "-" }}</span
                    >
                  </div>
                  <div
                    class="flex items-center gap-2 text-gray-300 justify-end"
                  >
                    <n-icon :component="CalendarOutline" size="18" />
                    <span
                      >Fin:
                      {{ c.end_date ? formatDate(c.end_date) : "-" }}</span
                    >
                  </div>

                  <div class="col-span-2 flex items-center gap-2 text-gray-200">
                    <n-icon :component="CashOutline" size="18" />
                    <span class="text-lg font-extrabold"
                      >{{ formatMoney(c.cost) }} Bs.</span
                    >
                  </div>
                </div>

                <!-- Actions pinned to bottom -->
                <div class="mt-auto pt-4 flex justify-end gap-2">
                  <button
                    class="w-24 px-3 py-1.5 rounded-lg text-sm font-bold bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all"
                    @click="$router.push(`/courses/${c.id}/edit`)"
                  >
                    Editar
                  </button>

                  <n-popconfirm
                    :positive-text="'Sí'"
                    :negative-text="'No'"
                    @positive-click="handleDelete(c.id)"
                  >
                    <template #trigger>
                      <button
                        class="w-24 px-3 py-1.5 rounded-lg text-sm font-bold bg-gradient-to-r from-[#7f1d1d] to-[#dc2626] text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all"
                      >
                        Eliminar
                      </button>
                    </template>
                    ¿Eliminar este curso?
                  </n-popconfirm>
                </div>
              </div>
            </div>

            <div
              v-if="!paginatedData.length && !isLoading"
              class="col-span-full text-center py-16 text-gray-400"
            >
              No hay cursos para mostrar.
            </div>
          </div>

          <!-- Pagination -->
          <div class="flex justify-end mt-6">
            <n-pagination
              v-model:page="currentPage"
              :page-size="itemsPerPage"
              :item-count="filteredCourses.length"
              :show-quick-jumper="false"
              class="rounded-xl font-extrabold px-3 py-2 bg-[#1e293b] border border-[#3b82f6]/60 shadow-[0_0_20px_rgba(37,99,235,0.3)] text-white [&_.n-pagination-item]:bg-transparent [&_.n-pagination-item]:text-gray-200 [&_.n-pagination-item--active]:bg-[#2563eb] [&_.n-pagination-item--active]:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  </app-layout>
</template>

<script>
import { NButton, NIcon, NPagination, NPopconfirm, useMessage } from "naive-ui";
import {
  SearchOutline,
  CalendarOutline,
  CashOutline,
  PersonOutline,
  LayersOutline,
} from "@vicons/ionicons5";
import AppLayout from "@/layouts/AppLayout.vue";
import CourseService from "@/services/courseService";

export default {
  name: "ListCoursesView",
  components: { AppLayout, NButton, NIcon, NPagination, NPopconfirm },
  data() {
    return {
      SearchOutline,
      CalendarOutline,
      CashOutline,
      PersonOutline,
      LayersOutline,
      courses: [],
      filteredCourses: [],
      search: "",
      currentPage: 1,
      itemsPerPage: 9,
      isLoading: false,
      message: null,
    };
  },
  computed: {
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredCourses.slice(start, start + this.itemsPerPage);
    },
  },
  methods: {
    formatDate(d) {
      const dt = new Date(d);
      return dt.toLocaleDateString("es-BO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
    formatMoney(v) {
      const n = Number(v || 0);
      return n.toLocaleString("es-BO", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
    async fetchCourses() {
      this.isLoading = true;
      try {
        const data = await CourseService.getAll();
        this.courses = data;
        this.filteredCourses = [...data];
      } catch {
        this.message?.error?.("Error al cargar cursos.");
      } finally {
        this.isLoading = false;
      }
    },
    handleSearch() {
      const q = this.search.trim().toLowerCase();
      this.filteredCourses = this.courses.filter((c) => {
        const name = (c.name || "").toLowerCase();
        const parallel = (c.parallel || "").toLowerCase();
        return name.includes(q) || parallel.includes(q);
      });
      this.currentPage = 1;
    },
    async handleDelete(id) {
      try {
        await CourseService.remove(id);
        this.message?.success?.("Curso eliminado.");
        await this.fetchCourses();
      } catch {
        this.message?.error?.("Error al eliminar curso.");
      }
    },
  },
  created() {
    this.message = useMessage();
    this.fetchCourses();
  },
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.auto-rows-fr {
  grid-auto-rows: 1fr;
}
</style>

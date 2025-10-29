<template>
  <app-layout>
    <div class="min-h-screen p-8 bg-[#0f172a] text-white">
      <div class="max-w-6xl mx-auto space-y-8">
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <h1 class="text-4xl font-extrabold">Políticas de Calificación</h1>
          <div class="flex items-center gap-3 w-full md:w-auto">
            <n-select
              v-model:value="courseId"
              :options="courseOptions"
              placeholder="Curso (opcional)"
              style="width: 320px"
              @update:value="load"
            />
            <div class="relative w-full md:w-72">
              <input
                v-model="search"
                @input="handleSearch"
                type="text"
                placeholder="Buscar por curso"
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
              @click="open = true"
            >
              + Nueva
            </n-button>
          </div>
        </div>

        <div
          class="rounded-2xl overflow-hidden border border-[#334155] shadow-[0_6px_25px_rgba(0,0,0,0.4)] bg-[#1e293b]/80 backdrop-blur-sm"
        >
          <n-data-table
            :loading="loading"
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
            :item-count="filtered.length"
            class="rounded-xl font-extrabold px-3 py-2 bg-[#1e293b] border border-[#3b82f6]/60 shadow-[0_0_20px_rgba(37,99,235,0.3)] text-white [&_.n-pagination-item]:bg-transparent [&_.n-pagination-item]:text-gray-200 [&_.n-pagination-item--active]:bg-[#2563eb] [&_.n-pagination-item--active]:text-white"
          />
        </div>
      </div>

      <n-modal
        v-model:show="open"
        preset="card"
        :title="form.id ? 'Editar Política' : 'Nueva Política'"
        :style="{ width: '520px' }"
      >
        <n-form
          :model="form"
          :rules="rules"
          ref="formRef"
          label-placement="top"
        >
          <n-form-item label="Curso" v-if="!form.id" path="courseId">
            <n-select v-model:value="form.courseId" :options="courseOptions" />
          </n-form-item>
          <n-form-item
            label="Nota mínima de aprobación"
            path="min_approval_score"
          >
            <n-input-number
              v-model:value="form.min_approval_score"
              :min="0"
              :max="100"
            />
          </n-form-item>
          <n-form-item label="Asistencia mínima (%)" path="min_attendance_pct">
            <n-input-number
              v-model:value="form.min_attendance_pct"
              :min="0"
              :max="100"
            />
          </n-form-item>
        </n-form>
        <template #footer>
          <div class="flex justify-end gap-2">
            <n-button @click="close">Cancelar</n-button>
            <n-button type="primary" :loading="saving" @click="submit"
              >Guardar</n-button
            >
          </div>
        </template>
      </n-modal>
    </div>
  </app-layout>
</template>

<script>
import AppLayout from "@/layouts/AppLayout.vue";
import {
  NDataTable,
  NIcon,
  NPagination,
  NModal,
  NForm,
  NFormItem,
  NInputNumber,
  NSelect,
  NButton,
  NPopconfirm,
  useMessage,
} from "naive-ui";
import { SearchOutline, PencilOutline, TrashOutline } from "@vicons/ionicons5";
import gradePolicyService from "@/services/gradePolicyService";
import CourseService from "@/services/courseService";
import { h } from "vue";

export default {
  name: "GradePoliciesView",
  components: {
    AppLayout,
    NDataTable,
    NIcon,
    NPagination,
    NModal,
    NForm,
    NFormItem,
    NInputNumber,
    NSelect,
    NButton,
    NPopconfirm,
  },
  data() {
    return {
      SearchOutline,
      rows: [],
      filtered: [],
      loading: false,
      open: false,
      saving: false,
      formRef: null,
      form: {
        id: null,
        courseId: null,
        min_approval_score: 51,
        min_attendance_pct: 80,
      },
      rules: {
        courseId: [
          { required: true, message: "Curso requerido", trigger: "change" },
        ],
        min_approval_score: [
          { required: true, message: "Nota mínima requerida", trigger: "blur" },
        ],
        min_attendance_pct: [
          {
            required: true,
            message: "Asistencia mínima requerida",
            trigger: "blur",
          },
        ],
      },
      courseOptions: [],
      courseId: null,
      search: "",
      currentPage: 1,
      itemsPerPage: 10,
      message: null,
    };
  },
  computed: {
    columns() {
      return [
        {
          title: "#",
          key: "index",
          width: 60,
          align: "center",
          render: (_, index) =>
            index + 1 + (this.currentPage - 1) * this.itemsPerPage,
        },
        {
          title: "Curso",
          key: "course",
          render: (r) =>
            `${r.course?.name || ""} (${r.course?.parallel || ""})`,
        },
        { title: "Nota mínima", key: "min_approval_score" },
        { title: "Asistencia mínima (%)", key: "min_attendance_pct" },
        {
          title: "Acciones",
          key: "actions",
          render: (row) =>
            h("div", { class: "flex gap-3 justify-center" }, [
              h(
                "button",
                {
                  class:
                    "px-3 py-1.5 rounded-lg text-sm font-bold bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all",
                  onClick: () => this.edit(row),
                },
                [
                  h("span", { class: "inline-flex items-center gap-1" }, [
                    h("span", [
                      h(NIcon, null, { default: () => h(PencilOutline) }),
                    ]),
                    " Editar",
                  ]),
                ]
              ),
              h(
                NPopconfirm,
                {
                  positiveText: "Sí",
                  negativeText: "No",
                  onPositiveClick: () => this.remove(row.id),
                },
                {
                  trigger: () =>
                    h(
                      "button",
                      {
                        class:
                          "px-3 py-1.5 rounded-lg text-sm font-bold bg-gradient-to-r from-[#7f1d1d] to-[#dc2626] text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all",
                      },
                      [
                        h("span", { class: "inline-flex items-center gap-1" }, [
                          h("span", [
                            h(NIcon, null, { default: () => h(TrashOutline) }),
                          ]),
                          " Eliminar",
                        ]),
                      ]
                    ),
                  default: () => "¿Eliminar política?",
                }
              ),
            ]),
        },
      ];
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filtered.slice(start, start + this.itemsPerPage);
    },
  },
  methods: {
    async loadCourses() {
      const cs = await CourseService.getAll();
      this.courseOptions = cs.map((c) => ({
        label: `${c.name} (${c.parallel})`,
        value: c.id,
      }));
    },
    async load() {
      this.loading = true;
      try {
        const data = await gradePolicyService.getAll(
          this.courseId ? { courseId: this.courseId } : {}
        );
        this.rows = data || [];
        this.filtered = [...this.rows];
        this.handleSearch();
      } finally {
        this.loading = false;
      }
    },
    handleSearch() {
      const q = this.search.toLowerCase().trim();
      this.filtered = this.rows.filter((r) =>
        `${r.course?.name || ""} ${r.course?.parallel || ""}`
          .toLowerCase()
          .includes(q)
      );
      this.currentPage = 1;
    },
    edit(r) {
      this.form = {
        id: r.id,
        courseId: r.courseId || null,
        min_approval_score: Number(r.min_approval_score ?? 51),
        min_attendance_pct: Number(r.min_attendance_pct ?? 80),
      };
      this.open = true;
    },
    close() {
      this.open = false;
      this.form = {
        id: null,
        courseId: null,
        min_approval_score: 51,
        min_attendance_pct: 80,
      };
    },
    async submit() {
      try {
        await this.formRef?.validate();
        this.saving = true;
        if (this.form.id)
          await gradePolicyService.update(this.form.id, this.form);
        else await gradePolicyService.create(this.form);
        this.message.success("Guardado");
        this.close();
        await this.load();
      } catch {
        this.message.error("Error al guardar");
      } finally {
        this.saving = false;
      }
    },
    async remove(id) {
      try {
        await gradePolicyService.remove(id);
        await this.load();
      } catch {
        this.message.error("Error al eliminar");
      }
    },
  },
  async created() {
    this.message = useMessage();
    await this.loadCourses();
    await this.load();
  },
};
</script>

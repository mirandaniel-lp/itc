<template>
  <app-layout>
    <div class="min-h-screen p-8 bg-[#0f172a] text-white">
      <div class="max-w-6xl mx-auto space-y-8">
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <h1 class="text-4xl font-extrabold">Aulas</h1>
          <div class="flex items-center gap-3 w-full md:w-auto">
            <div class="relative w-full md:w-80">
              <input
                v-model="search"
                @input="handleSearch"
                type="text"
                placeholder="Buscar por código, nombre o ubicación"
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
        :title="form.id ? 'Editar Aula' : 'Nueva Aula'"
        :style="{ width: '520px' }"
      >
        <n-form
          :model="form"
          :rules="rules"
          ref="formRef"
          label-placement="top"
        >
          <n-form-item label="Código" path="code"
            ><n-input v-model:value="form.code"
          /></n-form-item>
          <n-form-item label="Nombre" path="name"
            ><n-input v-model:value="form.name"
          /></n-form-item>
          <n-form-item label="Ubicación" path="location"
            ><n-input v-model:value="form.location"
          /></n-form-item>
          <n-form-item label="Capacidad" path="capacity"
            ><n-input-number v-model:value="form.capacity" :min="0"
          /></n-form-item>
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
  NInput,
  NInputNumber,
  NButton,
  NPopconfirm,
  useMessage,
} from "naive-ui";
import { SearchOutline, PencilOutline, TrashOutline } from "@vicons/ionicons5";
import classroomService from "@/services/classroomService";
import { h } from "vue";

export default {
  name: "ClassroomsView",
  components: {
    AppLayout,
    NDataTable,
    NIcon,
    NPagination,
    NModal,
    NForm,
    NFormItem,
    NInput,
    NInputNumber,
    NButton,
    NPopconfirm,
  },
  data() {
    return {
      SearchOutline,
      loading: false,
      rows: [],
      filtered: [],
      search: "",
      currentPage: 1,
      itemsPerPage: 10,
      open: false,
      saving: false,
      formRef: null,
      form: { id: null, code: "", name: "", location: "", capacity: null },
      rules: {
        code: [
          { required: true, message: "Código requerido", trigger: "blur" },
        ],
        name: [
          { required: true, message: "Nombre requerido", trigger: "blur" },
        ],
      },
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
        { title: "Código", key: "code" },
        { title: "Nombre", key: "name" },
        { title: "Ubicación", key: "location" },
        { title: "Capacidad", key: "capacity" },
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
                  default: () => "¿Eliminar aula?",
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
    async load() {
      this.loading = true;
      try {
        const data = await classroomService.getAll();
        this.rows = data || [];
        this.filtered = [...this.rows];
      } finally {
        this.loading = false;
      }
    },
    handleSearch() {
      const q = this.search.toLowerCase().trim();
      this.filtered = this.rows.filter(
        (r) =>
          String(r.code || "")
            .toLowerCase()
            .includes(q) ||
          String(r.name || "")
            .toLowerCase()
            .includes(q) ||
          String(r.location || "")
            .toLowerCase()
            .includes(q)
      );
      this.currentPage = 1;
    },
    edit(r) {
      this.form = {
        id: r.id,
        code: r.code || "",
        name: r.name || "",
        location: r.location || "",
        capacity: r.capacity ?? null,
      };
      this.open = true;
    },
    close() {
      this.open = false;
      this.form = {
        id: null,
        code: "",
        name: "",
        location: "",
        capacity: null,
      };
    },
    async submit() {
      try {
        await this.formRef?.validate();
        this.saving = true;
        if (this.form.id)
          await classroomService.update(this.form.id, this.form);
        else await classroomService.create(this.form);
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
        await classroomService.remove(id);
        await this.load();
      } catch {
        this.message.error("Error al eliminar");
      }
    },
  },
  created() {
    this.message = useMessage();
    this.load();
  },
};
</script>

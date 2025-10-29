<template>
  <app-layout>
    <div class="min-h-screen p-8 bg-[#0f172a] text-white">
      <div class="max-w-6xl mx-auto space-y-8">
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <h1 class="text-4xl font-extrabold">Periodos Académicos</h1>
          <div class="flex items-center gap-3 w-full md:w-auto">
            <div class="relative w-full md:w-80">
              <input
                v-model="search"
                @input="handleSearch"
                type="text"
                placeholder="Buscar por nombre"
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
              + Nuevo
            </n-button>
          </div>
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
            :item-count="filtered.length"
            :show-quick-jumper="false"
            class="rounded-xl font-extrabold px-3 py-2 bg-[#1e293b] border border-[#3b82f6]/60 shadow-[0_0_20px_rgba(37,99,235,0.3)] text-white [&_.n-pagination-item]:bg-transparent [&_.n-pagination-item]:text-gray-200 [&_.n-pagination-item--active]:bg-[#2563eb] [&_.n-pagination-item--active]:text-white"
          />
        </div>
      </div>

      <n-modal
        v-model:show="open"
        preset="card"
        :title="form.id ? 'Editar Periodo' : 'Nuevo Periodo'"
        :style="{ width: '520px' }"
      >
        <n-form
          :model="form"
          :rules="rules"
          ref="formRef"
          label-placement="top"
        >
          <n-form-item label="Nombre" path="name">
            <n-input v-model:value="form.name" />
          </n-form-item>
          <n-form-item label="Rango (inicio / fin)" path="range">
            <n-date-picker v-model:value="form.range" type="daterange" />
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
import {
  NDataTable,
  NIcon,
  NPagination,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NDatePicker,
  NPopconfirm,
  NButton,
  useMessage,
} from "naive-ui";
import { SearchOutline, PencilOutline, TrashOutline } from "@vicons/ionicons5";
import { h } from "vue";
import AppLayout from "@/layouts/AppLayout.vue";
import TermService from "@/services/termService";

export default {
  name: "TermsView",
  components: {
    AppLayout,
    NDataTable,
    NIcon,
    NPagination,
    NModal,
    NForm,
    NFormItem,
    NInput,
    NDatePicker,
    NPopconfirm,
    NButton,
  },
  data() {
    return {
      SearchOutline,
      terms: [],
      filtered: [],
      search: "",
      isLoading: false,
      currentPage: 1,
      itemsPerPage: 10,
      open: false,
      saving: false,
      formRef: null,
      form: { id: null, name: "", range: null },
      columns: [
        {
          title: "#",
          key: "index",
          width: 60,
          align: "center",
          render: (_, index) =>
            index + 1 + (this.currentPage - 1) * this.itemsPerPage,
        },
        { title: "Nombre", key: "name" },
        {
          title: "Inicio",
          key: "start_date",
          render: (r) => this.fmt(r.start_date),
        },
        {
          title: "Fin",
          key: "end_date",
          render: (r) => this.fmt(r.end_date),
        },
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
                [h(NIcon, null, { default: () => h(PencilOutline) }), " Editar"]
              ),
              h(
                NPopconfirm,
                {
                  "onPositive-click": () => this.remove(row),
                  "positive-text": "Sí",
                  "negative-text": "No",
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
                        h(NIcon, null, { default: () => h(TrashOutline) }),
                        " Eliminar",
                      ]
                    ),
                  default: () => "¿Eliminar periodo?",
                }
              ),
            ]),
        },
      ],
      rules: {
        name: [
          { required: true, message: "Nombre requerido", trigger: "blur" },
        ],
        range: [
          {
            validator: (_, v) =>
              Array.isArray(v) && v[0] && v[1]
                ? true
                : new Error("Seleccione inicio y fin"),
            trigger: ["change", "blur"],
          },
        ],
      },
      message: null,
    };
  },
  computed: {
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filtered.slice(start, start + this.itemsPerPage);
    },
  },
  methods: {
    fmt(d) {
      return new Date(d).toLocaleDateString();
    },
    async load() {
      this.isLoading = true;
      try {
        const data = await TermService.getAll();
        this.terms = data;
        this.filtered = [...data];
      } catch {
        this.message.error("Error al cargar periodos.");
      } finally {
        this.isLoading = false;
      }
    },
    handleSearch() {
      const q = this.search.toLowerCase().trim();
      this.filtered = this.terms.filter((t) =>
        (t.name || "").toLowerCase().includes(q)
      );
      this.currentPage = 1;
    },
    edit(t) {
      this.form.id = t.id;
      this.form.name = t.name;
      this.form.range = [
        new Date(t.start_date).getTime(),
        new Date(t.end_date).getTime(),
      ];
      this.open = true;
    },
    close() {
      this.open = false;
      this.form = { id: null, name: "", range: null };
    },
    async submit() {
      try {
        await this.formRef?.validate();
        this.saving = true;
        const [s, e] = this.form.range || [];
        const payload = {
          name: this.form.name,
          start_date: new Date(s).toISOString(),
          end_date: new Date(e).toISOString(),
        };
        if (this.form.id) await TermService.update(this.form.id, payload);
        else await TermService.create(payload);
        this.message.success("Guardado");
        this.close();
        await this.load();
      } catch {
        this.message.error("Error al guardar");
      } finally {
        this.saving = false;
      }
    },
    async remove(t) {
      try {
        await TermService.remove(t.id);
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

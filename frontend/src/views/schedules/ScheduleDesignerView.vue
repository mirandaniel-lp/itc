<template>
  <app-layout>
    <div class="min-h-screen p-6 space-y-6 bg-[#0f172a] text-white">
      <div class="max-w-7xl mx-auto space-y-6">
        <div class="flex items-center gap-3">
          <h1 class="text-3xl md:text-4xl font-extrabold">Horarios</h1>
        </div>

        <div
          class="rounded-2xl p-6 bg-[#1e293b]/80 border border-[#334155] backdrop-blur-sm shadow-[0_6px_25px_rgba(0,0,0,0.4)]"
        >
          <div class="flex flex-wrap items-center gap-3">
            <n-select
              v-model:value="selectedCourse"
              :options="courseOptions"
              placeholder="Selecciona un curso"
              style="max-width: 360px"
              @update:value="onCourseChange"
            />
          </div>
        </div>

        <div
          class="rounded-2xl overflow-hidden border border-[#334155] shadow-[0_6px_25px_rgba(0,0,0,0.4)] bg-[#1e293b]/80 backdrop-blur-sm"
        >
          <n-data-table
            :loading="loadingTable"
            :columns="columns"
            :data="rows"
            :pagination="false"
            :bordered="false"
            size="large"
            class="[&_.n-data-table-th]:text-center [&_.n-data-table-th]:font-extrabold [&_.n-data-table-td]:text-center [&_.n-data-table-tr:hover]:bg-[#1d4ed8]/20 transition-all"
          />
        </div>
      </div>
    </div>
  </app-layout>
</template>

<script>
import { h } from "vue";
import {
  NSelect,
  NButton,
  NTimePicker,
  NDataTable,
  NPopconfirm,
  useMessage,
} from "naive-ui";
import AppLayout from "@/layouts/AppLayout.vue";
import CourseService from "@/services/courseService";
import ClassroomService from "@/services/classroomService";
import ScheduleService from "@/services/scheduleService";

export default {
  name: "ScheduleDesignerView",
  components: {
    AppLayout,
    NSelect,
    NButton,
    NTimePicker,
    NDataTable,
    NPopconfirm,
  },
  data() {
    return {
      message: null,
      selectedCourse: null,
      courseOptions: [],
      classroomOptions: [],
      rows: [],
      loadingTable: false,
      editingId: null,
      editClassroomId: null,
      editStartMs: null,
      editEndMs: null,
    };
  },
  computed: {
    columns() {
      return [
        { title: "Día", key: "weekdayLabel" },
        {
          title: "Inicio",
          key: "start_time",
          render: (row) =>
            row.id === this.editingId
              ? h(NTimePicker, {
                  value: this.editStartMs,
                  "onUpdate:value": (v) => (this.editStartMs = v),
                  format: "HH:mm",
                  style: "width: 110px",
                })
              : row.start_time,
        },
        {
          title: "Fin",
          key: "end_time",
          render: (row) =>
            row.id === this.editingId
              ? h(NTimePicker, {
                  value: this.editEndMs,
                  "onUpdate:value": (v) => (this.editEndMs = v),
                  format: "HH:mm",
                  style: "width: 110px",
                })
              : row.end_time,
        },
        {
          title: "Aula",
          key: "classroomName",
          render: (row) =>
            row.id === this.editingId
              ? h(NSelect, {
                  value: this.editClassroomId,
                  "onUpdate:value": (v) => (this.editClassroomId = v),
                  options: this.classroomOptions,
                  style: "min-width: 160px",
                })
              : row.classroomName,
        },
        {
          title: "Acciones",
          key: "actions",
          render: (row) => {
            if (row.id === this.editingId) {
              return h("div", { class: "flex gap-2 justify-center" }, [
                h(
                  NButton,
                  {
                    type: "primary",
                    size: "small",
                    onClick: () => this.saveEdit(row),
                  },
                  "Guardar"
                ),
                h(
                  NButton,
                  { size: "small", onClick: () => this.cancelEdit() },
                  "Cancelar"
                ),
              ]);
            }
            return h("div", { class: "flex gap-2 justify-center" }, [
              h(
                NButton,
                { size: "small", onClick: () => this.editRow(row) },
                "Editar"
              ),
              h(
                NPopconfirm,
                {
                  "positive-text": "Sí",
                  "negative-text": "No",
                  onPositiveClick: () => this.removeSchedule(row.id),
                },
                {
                  trigger: () =>
                    h(NButton, { size: "small", type: "error" }, "Eliminar"),
                  default: () => "¿Eliminar este horario?",
                }
              ),
            ]);
          },
        },
      ];
    },
  },
  async mounted() {
    this.message = useMessage?.() || null;
    await this.loadCourses();
    await this.loadClassrooms();
  },
  methods: {
    toHHMM(ms) {
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const pad = (n) => String(n).padStart(2, "0");
      return `${pad(h)}:${pad(m)}`;
    },
    hhmmToMs(s) {
      const [h, m] = String(s)
        .split(":")
        .map((n) => parseInt(n || "0", 10));
      return h * 3600000 + m * 60000;
    },
    weekdayLabel(v) {
      const map = {
        LUNES: "Lunes",
        MARTES: "Martes",
        MIERCOLES: "Miércoles",
        JUEVES: "Jueves",
        VIERNES: "Viernes",
        SABADO: "Sábado",
        DOMINGO: "Domingo",
      };
      return map[v] || v;
    },
    async loadCourses() {
      const courses = await CourseService.getAll();
      this.courseOptions = (courses || []).map((c) => ({
        label: `${c.name} - ${c.parallel}`,
        value: c.id,
      }));
    },
    async loadClassrooms() {
      const rooms = await ClassroomService.getAll();
      this.classroomOptions = (rooms || []).map((r) => ({
        label: r.name || `Aula ${r.id}`,
        value: r.id,
      }));
    },
    async onCourseChange() {
      this.editingId = null;
      await this.loadTable();
    },
    async loadTable() {
      if (!this.selectedCourse) {
        this.rows = [];
        return;
      }
      this.loadingTable = true;
      try {
        const items = await ScheduleService.listByCourse(this.selectedCourse);
        this.rows = (items || []).map((it) => ({
          id: it.id,
          weekday: it.weekday,
          weekdayLabel: this.weekdayLabel(it.weekday),
          start_time: it.start_time,
          end_time: it.end_time,
          classroomId: it.classroomId,
          classroomName: it.classroom?.name || `Aula ${it.classroomId}`,
        }));
      } finally {
        this.loadingTable = false;
      }
    },
    editRow(row) {
      this.editingId = row.id;
      this.editClassroomId = row.classroomId;
      this.editStartMs = this.hhmmToMs(row.start_time);
      this.editEndMs = this.hhmmToMs(row.end_time);
    },
    cancelEdit() {
      this.editingId = null;
      this.editClassroomId = null;
      this.editStartMs = null;
      this.editEndMs = null;
    },
    async saveEdit(row) {
      if (!this.editingId) return;
      if (this.editEndMs <= this.editStartMs) {
        this.message?.error?.("Rango de horas inválido");
        return;
      }
      await ScheduleService.update(this.editingId, {
        classroomId: this.editClassroomId,
        weekday: row.weekday,
        start_time: this.toHHMM(this.editStartMs),
        end_time: this.toHHMM(this.editEndMs),
      });
      this.cancelEdit();
      await this.loadTable();
      this.message?.success?.("Horario actualizado");
    },
    async removeSchedule(id) {
      await ScheduleService.remove(id);
      await this.loadTable();
      this.message?.success?.("Horario eliminado");
    },
  },
};
</script>

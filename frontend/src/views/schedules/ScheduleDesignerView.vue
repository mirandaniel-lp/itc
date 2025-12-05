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
  NTag,
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
    NTag,
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
      courseInfo: null,
      checkBusy: false,
      checkResult: null,
      timer: null,
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
                  "onUpdate:value": (v) => {
                    this.editStartMs = v;
                    this.deferCheck(row);
                  },
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
                  "onUpdate:value": (v) => {
                    this.editEndMs = v;
                    this.deferCheck(row);
                  },
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
                  "onUpdate:value": (v) => {
                    this.editClassroomId = v;
                    this.deferCheck(row);
                  },
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
                    loading: this.checkBusy,
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
    toMin(s) {
      const [h, m] = String(s)
        .split(":")
        .map((n) => parseInt(n || "0", 10));
      return h * 60 + m;
    },
    rangesOverlap(aS, aE, bS, bE) {
      return Math.max(aS, bS) < Math.min(aE, bE);
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
        label: `${c.name}${c.parallel ? " - " + c.parallel : ""}`,
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
      this.courseInfo = this.selectedCourse
        ? await CourseService.getById(this.selectedCourse)
        : null;
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
      this.checkResult = null;
      this.deferCheck(row, 0);
    },
    cancelEdit() {
      this.editingId = null;
      this.editClassroomId = null;
      this.editStartMs = null;
      this.editEndMs = null;
      this.checkResult = null;
      clearTimeout(this.timer);
    },
    deferCheck(row, wait = 300) {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.checkRow(row), wait);
    },
    async checkRow(row) {
      if (!this.courseInfo || !this.editingId) return;
      if (
        this.editClassroomId == null ||
        this.editStartMs == null ||
        this.editEndMs == null
      ) {
        this.checkResult = null;
        return;
      }
      const st = this.toHHMM(this.editStartMs);
      const et = this.toHHMM(this.editEndMs);
      if (this.toMin(et) <= this.toMin(st)) {
        this.checkResult = { ok: false, issues: ["shift"], suggestions: [] };
        return;
      }
      if (
        !this.validateAgainstOwnRows(
          row.weekday,
          this.editClassroomId,
          st,
          et,
          row.id
        )
      ) {
        this.checkResult = {
          ok: false,
          issues: ["classroom"],
          suggestions: [],
        };
        return;
      }

      const sDate =
        this.courseInfo.start_date || this.courseInfo.term?.start_date;
      const eDate =
        this.courseInfo.end_date ||
        this.courseInfo.term?.end_date ||
        this.courseInfo.start_date;

      const payload = {
        teacherId: this.courseInfo.teacherId,
        start_date: new Date(sDate).toISOString(),
        end_date: new Date(eDate).toISOString(),
        shift: this.courseInfo.shift,
        checks: [
          {
            id: String(this.editingId),
            weekday: row.weekday,
            classroomId: this.editClassroomId,
            start_time: st,
            end_time: et,
          },
        ],
        // ⬇️ nuevo
        exclude_course_id: this.courseInfo.id || this.selectedCourse,
        exclude_schedule_ids: [this.editingId],
      };

      this.checkBusy = true;
      try {
        const res = await CourseService.checkAvailability(payload);
        const r = Array.isArray(res?.results) ? res.results[0] : null;
        this.checkResult = r || { ok: true, issues: [], suggestions: [] };
      } catch {
        this.checkResult = { ok: false, issues: ["error"], suggestions: [] };
      } finally {
        this.checkBusy = false;
      }
    },
    validateAgainstOwnRows(weekday, classroomId, st, et, excludeId) {
      const sm = this.toMin(st);
      const em = this.toMin(et);
      for (const r of this.rows) {
        if (r.id === excludeId) continue;
        if (r.weekday !== weekday) continue;
        if (Number(r.classroomId) !== Number(classroomId)) continue;
        const rsm = this.toMin(r.start_time);
        const rem = this.toMin(r.end_time);
        if (this.rangesOverlap(sm, em, rsm, rem)) return false;
      }
      return true;
    },
    applySuggestion(s) {
      this.editStartMs = this.hhmmToMs(s.start_time);
      this.editEndMs = this.hhmmToMs(s.end_time);
      const row = this.rows.find((x) => x.id === this.editingId);
      if (row) this.deferCheck(row, 0);
    },
    async saveEdit(row) {
      if (!this.editingId) return;
      if (this.editEndMs <= this.editStartMs) {
        this.message?.error?.("Rango de horas inválido");
        return;
      }
      if (
        !this.validateAgainstOwnRows(
          row.weekday,
          this.editClassroomId,
          this.toHHMM(this.editStartMs),
          this.toHHMM(this.editEndMs),
          row.id
        )
      ) {
        this.message?.error?.(
          "Conflicto interno en el curso para esa aula y día"
        );
        return;
      }
      if (!this.checkResult || !this.checkResult.ok) {
        const issues = (this.checkResult?.issues || [])
          .map((x) =>
            x === "teacher" ? "Docente" : x === "classroom" ? "Aula" : "Turno"
          )
          .join(", ");
        this.message?.error?.(
          issues ? `No disponible: ${issues}` : "No disponible"
        );
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

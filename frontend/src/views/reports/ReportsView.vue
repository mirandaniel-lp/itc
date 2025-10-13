<template>
  <app-layout>
    <div class="min-h-screen p-4">
      <h1 class="text-3xl font-bold mb-6 text-center">Reportes Académicos</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <n-card
          title="Reporte de Matrículas"
          class="hover:shadow-xl transition-shadow"
        >
          <p class="mb-4">
            Descarga un listado de estudiantes matriculados por curso.
          </p>
          <n-button @click="downloadEnrollments('csv')" class="mr-2"
            >Exportar CSV</n-button
          >
          <n-button @click="downloadEnrollments('pdf')" type="primary"
            >Exportar PDF</n-button
          >
        </n-card>
        <n-card
          title="Reporte de Calificaciones"
          class="hover:shadow-xl transition-shadow"
        >
          <p class="mb-4">
            Obtén calificaciones por curso, actividad y estudiante.
          </p>
          <n-button @click="downloadGrades('csv')" class="mr-2"
            >Exportar CSV</n-button
          >
          <n-button @click="downloadGrades('pdf')" type="primary"
            >Exportar PDF</n-button
          >
        </n-card>
        <n-card
          title="Reporte de Docentes"
          class="hover:shadow-xl transition-shadow"
        >
          <p class="mb-4">Listado de docentes y sus cursos asignados.</p>
          <n-button @click="downloadTeachers('csv')" class="mr-2"
            >Exportar CSV</n-button
          >
          <n-button @click="downloadTeachers('pdf')" type="primary"
            >Exportar PDF</n-button
          >
        </n-card>
        <n-card
          title="Reporte de Actividades"
          class="hover:shadow-xl transition-shadow"
        >
          <p class="mb-4">Actividades por curso y docente.</p>
          <n-button @click="downloadActivities('csv')" class="mr-2"
            >Exportar CSV</n-button
          >
          <n-button @click="downloadActivities('pdf')" type="primary"
            >Exportar PDF</n-button
          >
        </n-card>
      </div>
    </div>
  </app-layout>
</template>

<script>
import AppLayout from "@/layouts/AppLayout.vue";
import { useMessage } from "naive-ui";
import enrollmentService from "@/services/enrollmentService";
import gradeService from "@/services/gradeService";
import teacherService from "@/services/teacherService";
import activityService from "@/services/activityService";
import Papa from "papaparse";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.vfs;

function getModernTableLayout() {
  return {
    fillColor: function (rowIndex) {
      return rowIndex === 0 ? "#1976d2" : rowIndex % 2 === 0 ? "#e3f2fd" : null;
    },
    hLineWidth: function () {
      return 0.7;
    },
    vLineWidth: function () {
      return 0.7;
    },
    hLineColor: function () {
      return "#90caf9";
    },
    vLineColor: function () {
      return "#90caf9";
    },
    paddingLeft: function () {
      return 6;
    },
    paddingRight: function () {
      return 6;
    },
    paddingTop: function () {
      return 4;
    },
    paddingBottom: function () {
      return 4;
    },
  };
}

function getHeader(title) {
  return [
    {
      text: title,
      style: "header",
      alignment: "center",
      margin: [0, 15, 0, 15],
    },
    {
      canvas: [
        {
          type: "line",
          x1: 0,
          y1: 0,
          x2: 800,
          y2: 0,
          lineWidth: 2,
          lineColor: "#1976d2",
        },
      ],
    },
    { text: " ", margin: [0, 0, 0, 10] },
  ];
}

function getFooter(currentPage, pageCount) {
  return {
    text: `Página ${currentPage} de ${pageCount}`,
    alignment: "right",
    margin: [0, 0, 20, 0],
    fontSize: 9,
    color: "#888",
  };
}

function getTableConfig(body) {
  if (body[0].length > 6) {
    return {
      pageOrientation: "landscape",
      widths: Array(body[0].length).fill("auto"),
    };
  }
  return {
    pageOrientation: "portrait",
    widths: Array(body[0].length).fill("*"),
  };
}

export default {
  name: "ReportsView",
  components: { AppLayout },
  setup() {
    const message = useMessage();

    // Matrículas
    const downloadEnrollments = async (type) => {
      try {
        const enrollments = await enrollmentService.getAll();
        const body = [
          [
            "ID",
            "Estudiante",
            "CI",
            "Curso",
            "Fecha de Matrícula",
            "Tipo de Pago",
            "Estado",
          ],
          ...enrollments.map((e) => [
            e.id || "",
            `${e.student?.name || ""} ${e.student?.last_name || ""} ${
              e.student?.second_last_name || ""
            }`,
            e.student?.ci || "",
            `${e.course?.name || ""} (${e.course?.parallel || ""})`,
            e.enrollment_date?.substring(0, 10) || "",
            e.payment_type || "",
            e.status ? "Activo" : "Inactivo",
          ]),
        ];
        if (type === "csv") {
          const csv = Papa.unparse(
            enrollments.map((e) => ({
              ID: e.id,
              Estudiante: `${e.student?.name || ""} ${
                e.student?.last_name || ""
              } ${e.student?.second_last_name || ""}`,
              CI: e.student?.ci || "",
              Curso: `${e.course?.name || ""} (${e.course?.parallel || ""})`,
              "Fecha de Matrícula": e.enrollment_date || "",
              "Tipo de Pago": e.payment_type || "",
              Estado: e.status ? "Activo" : "Inactivo",
            }))
          );
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "reporte_matriculas.csv");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (type === "pdf") {
          const tableConfig = getTableConfig(body);
          const docDefinition = {
            pageOrientation: tableConfig.pageOrientation,
            footer: getFooter,
            content: [
              ...getHeader("Reporte de Matrículas"),
              {
                table: {
                  headerRows: 1,
                  widths: tableConfig.widths,
                  body,
                },
                layout: getModernTableLayout(),
                dontBreakRows: true,
              },
            ],
            styles: {
              header: {
                fontSize: 24,
                bold: true,
                color: "#1976d2",
                alignment: "center",
                margin: [0, 0, 0, 10],
              },
            },
            defaultStyle: {
              fontSize: 10,
              noWrap: false,
            },
          };
          pdfMake.createPdf(docDefinition).download("reporte_matriculas.pdf");
        }
      } catch (err) {
        console.error("Error PDF Matrículas:", err);
        message.error(
          "Error al generar el reporte de matrículas: " + (err.message || err)
        );
      }
    };

    // Calificaciones
    const downloadGrades = async (type) => {
      try {
        const grades = await gradeService.getAll();
        const body = [
          [
            "ID",
            "Estudiante",
            "CI",
            "Curso",
            "Actividad",
            "Calificación",
            "Observación",
            "Fecha",
            "Estado",
          ],
          ...grades.map((g) => [
            g.id || "",
            `${g.student?.name || ""} ${g.student?.last_name || ""} ${
              g.student?.second_last_name || ""
            }`,
            g.student?.ci || "",
            `${g.activity?.course?.name || ""} (${
              g.activity?.course?.parallel || ""
            })`,
            g.activity?.title || "",
            g.score ?? "",
            g.feedback || "",
            g.created_at?.substring(0, 10) || "",
            g.status ? "Activo" : "Inactivo",
          ]),
        ];
        if (type === "csv") {
          const csv = Papa.unparse(
            grades.map((g) => ({
              ID: g.id,
              Estudiante: `${g.student?.name || ""} ${
                g.student?.last_name || ""
              } ${g.student?.second_last_name || ""}`,
              CI: g.student?.ci || "",
              Curso: `${g.activity?.course?.name || ""} (${
                g.activity?.course?.parallel || ""
              })`,
              Actividad: g.activity?.title || "",
              Calificación: g.score ?? "",
              Observación: g.feedback || "",
              Fecha: g.created_at?.substring(0, 10) || "",
              Estado: g.status ? "Activo" : "Inactivo",
            }))
          );
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "reporte_calificaciones.csv");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (type === "pdf") {
          // Siempre vertical para calificaciones
          const docDefinition = {
            pageOrientation: "portrait",
            footer: getFooter,
            content: [
              ...getHeader("Reporte de Calificaciones"),
              {
                table: {
                  headerRows: 1,
                  widths: Array(body[0].length).fill("auto"),
                  body,
                },
                layout: getModernTableLayout(),
                dontBreakRows: true,
              },
            ],
            styles: {
              header: {
                fontSize: 24,
                bold: true,
                color: "#1976d2",
                alignment: "center",
                margin: [0, 0, 0, 10],
              },
            },
            defaultStyle: {
              fontSize: 10,
              noWrap: false,
            },
          };
          pdfMake
            .createPdf(docDefinition)
            .download("reporte_calificaciones.pdf");
        }
      } catch (err) {
        console.error("Error PDF Calificaciones:", err);
        message.error(
          "Error al generar el reporte de calificaciones: " +
            (err.message || err)
        );
      }
    };

    // Docentes
    const downloadTeachers = async (type) => {
      try {
        const teachers = await teacherService.getAll();
        const body = [
          [
            "ID",
            "Nombre Completo",
            "CI",
            "Email",
            "Teléfono",
            "Especialidad",
            "Género",
            "Fecha de Nacimiento",
            "Cursos Asignados",
            "Estado",
          ],
          ...teachers.map((t) => [
            t.id || "",
            `${t.name || ""} ${t.last_name || ""} ${t.second_last_name || ""}`,
            t.ci || "",
            t.email || "",
            t.phone || "",
            t.specialty || "",
            t.gender || "",
            t.dateofbirth?.substring(0, 10) || "",
            t.courses?.map((c) => `${c.name} (${c.parallel})`).join(", ") || "",
            t.status ? "Activo" : "Inactivo",
          ]),
        ];
        if (type === "csv") {
          const csv = Papa.unparse(
            teachers.map((t) => ({
              ID: t.id,
              "Nombre Completo": `${t.name || ""} ${t.last_name || ""} ${
                t.second_last_name || ""
              }`,
              CI: t.ci || "",
              Email: t.email || "",
              Teléfono: t.phone || "",
              Especialidad: t.specialty || "",
              Género: t.gender || "",
              "Fecha de Nacimiento": t.dateofbirth?.substring(0, 10) || "",
              "Cursos Asignados":
                t.courses?.map((c) => `${c.name} (${c.parallel})`).join(", ") ||
                "",
              Estado: t.status ? "Activo" : "Inactivo",
            }))
          );
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "reporte_docentes.csv");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (type === "pdf") {
          const tableConfig = getTableConfig(body);
          const docDefinition = {
            pageOrientation: tableConfig.pageOrientation,
            footer: getFooter,
            content: [
              ...getHeader("Reporte de Docentes"),
              {
                table: {
                  headerRows: 1,
                  widths: tableConfig.widths,
                  body,
                },
                layout: getModernTableLayout(),
                dontBreakRows: true,
              },
            ],
            styles: {
              header: {
                fontSize: 24,
                bold: true,
                color: "#1976d2",
                alignment: "center",
                margin: [0, 0, 0, 10],
              },
            },
            defaultStyle: {
              fontSize: 10,
              noWrap: false,
            },
          };
          pdfMake.createPdf(docDefinition).download("reporte_docentes.pdf");
        }
      } catch (err) {
        console.error("Error PDF Docentes:", err);
        message.error(
          "Error al generar el reporte de docentes: " + (err.message || err)
        );
      }
    };

    // Actividades
    const downloadActivities = async (type) => {
      try {
        const activities = await activityService.getAll();
        const body = [
          ["ID", "Título", "Curso", "Docente", "Estado", "Fecha de Creación"],
          ...activities.map((a) => [
            a.id || "",
            a.title || "",
            `${a.course?.name || ""} (${a.course?.parallel || ""})`,
            `${a.teacher?.name || ""} ${a.teacher?.last_name || ""} ${
              a.teacher?.second_last_name || ""
            }`,
            a.status ? "Activo" : "Inactivo",
            a.created_at?.substring(0, 10) || "",
          ]),
        ];
        if (type === "csv") {
          const csv = Papa.unparse(
            activities.map((a) => ({
              ID: a.id,
              Título: a.title || "",
              Curso: `${a.course?.name || ""} (${a.course?.parallel || ""})`,
              Docente: `${a.teacher?.name || ""} ${
                a.teacher?.last_name || ""
              } ${a.teacher?.second_last_name || ""}`,
              Estado: a.status ? "Activo" : "Inactivo",
              "Fecha de Creación": a.created_at?.substring(0, 10) || "",
            }))
          );
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "reporte_actividades.csv");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (type === "pdf") {
          const tableConfig = getTableConfig(body);
          const docDefinition = {
            pageOrientation: tableConfig.pageOrientation,
            footer: getFooter,
            content: [
              ...getHeader("Reporte de Actividades"),
              {
                table: {
                  headerRows: 1,
                  widths: tableConfig.widths,
                  body,
                },
                layout: getModernTableLayout(),
                dontBreakRows: true,
              },
            ],
            styles: {
              header: {
                fontSize: 24,
                bold: true,
                color: "#1976d2",
                alignment: "center",
                margin: [0, 0, 0, 10],
              },
            },
            defaultStyle: {
              fontSize: 10,
              noWrap: false,
            },
          };
          pdfMake.createPdf(docDefinition).download("reporte_actividades.pdf");
        }
      } catch (err) {
        console.error("Error PDF Actividades:", err);
        message.error(
          "Error al generar el reporte de actividades: " + (err.message || err)
        );
      }
    };

    return {
      downloadEnrollments,
      downloadGrades,
      downloadTeachers,
      downloadActivities,
    };
  },
};
</script>

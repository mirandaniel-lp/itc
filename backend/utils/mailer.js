import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

export const sendTeacherCredentials = async ({ to, name, ci, pin }) => {
  await transporter.sendMail({
    from: '"Instituto Académico" <no-reply@instituto.edu>',
    to,
    subject: "Tus credenciales de acceso docente",
    html: `
      <h2>Bienvenido/a, ${name}</h2>
      <p>Tu cuenta de docente ha sido creada.</p>
      <p><b>Usuario (CI):</b> ${ci}</p>
      <p><b>PIN:</b> ${pin}</p>
      <p>Por favor, ingresa a la plataforma y cambia tu PIN después de iniciar sesión.</p>
    `,
  });
};

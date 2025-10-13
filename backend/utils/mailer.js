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
    from: '"Instituto Técnico Columbia" <no-reply@instituto.edu>',
    to,
    subject: "Tus credenciales de acceso docente",
    html: `
      <div style="background:#f4f6fb;padding:40px 0;">
        <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:10px;box-shadow:0 2px 8px #e3e3e3;padding:32px 24px;font-family:'Segoe UI',Arial,sans-serif;">
          <div style="text-align:center;margin-bottom:24px;">
            <img src="https://img.icons8.com/color/96/000000/graduation-cap.png" alt="Instituto" style="width:64px;height:64px;margin-bottom:8px;">
            <h2 style="color:#1976d2;margin:0 0 8px 0;">¡Bienvenido/a, ${name}!</h2>
            <p style="color:#555;font-size:16px;margin:0;">Tu cuenta de docente ha sido creada exitosamente.</p>
          </div>
          <div style="background:#e3f2fd;border-radius:8px;padding:20px 16px;margin-bottom:24px;">
            <p style="margin:0 0 8px 0;font-size:15px;"><b>Usuario (CI):</b> <span style="color:#1976d2;">${ci}</span></p>
            <p style="margin:0 0 8px 0;font-size:15px;"><b>PIN:</b> <span style="color:#1976d2;">${pin}</span></p>
          </div>
          <a href="https://tu-plataforma.com/login" style="display:inline-block;background:#1976d2;color:#fff;text-decoration:none;padding:12px 32px;border-radius:6px;font-size:16px;font-weight:bold;margin-bottom:20px;">Ingresar a la plataforma</a>
          <p style="color:#888;font-size:13px;margin-top:24px;">Por favor, ingresa a la plataforma y cambia tu PIN después de iniciar sesión.<br>Si tienes dudas, contacta al área de soporte.</p>
          <hr style="margin:32px 0 16px 0;border:none;border-top:1px solid #eee;">
          <div style="text-align:center;color:#bbb;font-size:12px;">
            Instituto Técnico Columbia &copy; ${new Date().getFullYear()}
          </div>
        </div>
      </div>
    `,
  });
};

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.notificationRecipient.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.dropoutAlert.deleteMany();
  await prisma.riskPrediction.deleteMany();
  await prisma.iForestModel.deleteMany();
  await prisma.academicHoliday.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.gradePolicy.deleteMany();
  await prisma.courseSchedule.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.studentContact.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.classroom.deleteMany();
  await prisma.program.deleteMany();
  await prisma.modality.deleteMany();
  await prisma.academicTerm.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
}

main()
  .then(() => {
    console.log("database cleared");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

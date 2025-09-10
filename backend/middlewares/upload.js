import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `student_${Date.now()}${ext}`;
    cb(null, filename);
  },
});

export const upload = multer({ storage });

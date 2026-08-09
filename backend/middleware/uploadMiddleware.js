import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/prescriptions";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ok = allowed.test(path.extname(file.originalname).toLowerCase());
  if (ok) cb(null, true);
  else cb(new Error("Only image files (jpg, png, webp) are allowed"));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 8 * 1024 * 1024 } });

export default upload;

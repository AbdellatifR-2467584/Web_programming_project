import multer from "multer";

const storage = multer.diskStorage({
    destination: (request, file, cb) => cb(null, "uploads/"),
    filename: (request, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

export const upload = multer({ storage });

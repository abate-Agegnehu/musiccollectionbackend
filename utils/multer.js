const multer = require("multer");
const path = require("path");

module.exports = multer({
  storage: multer.diskStorage({}),
 
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (
      ext !== ".mp3" &&
      ext !== ".mp4" &&
      ext !== ".avi" &&
      ext !== ".mov" &&
      ext !== ".mkv"
    ) {
      cb(new Error("File type is not supported"), false);
      return;
    }
    cb(null, true);
  },
});

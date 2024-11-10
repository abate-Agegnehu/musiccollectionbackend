const router = require("express").Router();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const Music = require("../model/Music");
const mongoose = require("mongoose");

router.post("/", upload.single("video"), async (req, res) => {
  try {
   
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "video",
    });

    let music = new Music({
      title: req.body.title,
      artist: req.body.artist,
      email: req.body.email,
      avatar: result.secure_url,
      cloudinary_id: result.public_id,
    });

    await music.save();
    res.json(music);
  } catch (err) {
    console.error(err);
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "File size is too large. Max size is 50MB." });
    }
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", upload.single("video"), async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid music ID format" });
  }

  try {
    let music = await Music.findById(id);
    if (!music) {
      return res.status(404).json({ message: "Music not found" });
    }

    await cloudinary.uploader.destroy(music.cloudinary_id, {
      resource_type: "video",
    });

    let result;
    if (req.file) {
      result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "video",
      });
    }

    const data = {
      title: req.body.title || music.title,
      artist: req.body.artist || music.artist,
      email: req.body.email || music.email,
      avatar: result?.secure_url || music.avatar,
      cloudinary_id: result?.public_id || music.cloudinary_id,
    };

    music = await Music.findByIdAndUpdate(id, data, { new: true });
    res.json(music);
  } catch (err) {
    console.error(err);
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "File size is too large. Max size is 50MB." });
    }
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    let musics = await Music.find();
    res.json(musics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/:email", async (req, res) => {
  const { email } = req.params;

  try {
    let musics = await Music.find({ email });

    if (musics.length === 0) {
      return res.status(404).json({ message: "No music found for this email" });
    }

    res.json(musics); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid music ID format" });
  }

  try {
    let music = await Music.findById(id);
    if (!music) {
      return res.status(404).json({ message: "Music not found" });
    }

    await cloudinary.uploader.destroy(music.cloudinary_id, {
      resource_type: "video",
    });

    await Music.findByIdAndDelete(id);
    res.json({ message: "Music deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid music ID format" });
  }

  try {
    let music = await Music.findById(id);
    if (!music) {
      return res.status(404).json({ message: "Music not found" });
    }
    res.json(music);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const Music = require("../model/Music");
const mongoose = require("mongoose");

router.post("/", upload.single("media"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Check if the file is either audio or video
    const mimeType = req.file.mimetype;
    if (!mimeType.startsWith("audio/") && !mimeType.startsWith("video/")) {
      return res
        .status(400)
        .json({ message: "Only audio or video files are allowed" });
    }

    // Upload to Cloudinary with resource_type set to "video" for both audio and video files
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "video",
    });

    // Create new music entry in the database
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
      return res
        .status(413)
        .json({ message: "File size is too large. Max size is 50MB." });
    }
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", upload.single("media"), async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid music ID format" });
  }

  try {
    let music = await Music.findById(id);
    if (!music) {
      return res.status(404).json({ message: "Music not found" });
    }

    // Delete the old file from Cloudinary
    await cloudinary.uploader.destroy(music.cloudinary_id, {
      resource_type: "video",
    });

    let result;
    if (req.file) {
      // Check if the new file is either audio or video
      const mimeType = req.file.mimetype;
      if (!mimeType.startsWith("audio/") && !mimeType.startsWith("video/")) {
        return res
          .status(400)
          .json({ message: "Only audio or video files are allowed" });
      }

      // Upload the new file
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
      return res
        .status(413)
        .json({ message: "File size is too large. Max size is 50MB." });
    }
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

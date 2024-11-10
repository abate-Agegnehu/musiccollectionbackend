const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("mongoDB is connected"))
  .catch((err) => console.log(err));
app.use(cors());
app.use(express.json());

app.use("/music", require("./routes/music.route"));
app.use("/user", require("./routes/user.route"));

app.listen(9999, () => {
  console.log("Server is running");
});

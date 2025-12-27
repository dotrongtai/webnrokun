const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const homeRoutes = require("./routes/home");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// chỉ định views nằm ở root
app.set("view engine", "ejs");

app.use("/", homeRoutes);

app.use("/", authRoutes);

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log("Server chạy tại port: " + process.env.PORT);
});


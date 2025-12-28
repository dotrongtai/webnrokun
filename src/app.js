const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const homeRoutes = require("./routes/home");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const adminGiftcodeRoutes = require("./routes/adminGiftcode");
const adminApiRoutes = require("./routes/adminApi");

const session = require("express-session");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(session({
  secret: "kunz-secret-key",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24*60*60*1000 }
}));

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// ROUTES
app.use("/", homeRoutes);
app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", adminRoutes);
app.use("/", adminGiftcodeRoutes);

// ✅ Admin API
app.use("/admin/api", adminApiRoutes);

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log("Server chạy tại port: " + process.env.PORT);
});

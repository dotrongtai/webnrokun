const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const session = require("express-session");

const authRoutes = require("./routes/auth/auth");
const homeRoutes = require("./routes/home");
const userRoutes = require("./routes/auth/user");
const adminRoutes = require("./routes/auth/admin");
const adminGiftcodeRoutes = require("./routes/admin/adminGiftcode");
const adminApiRoutes = require("./routes/admin/adminApi");
const adminAccountsRoutes = require("./routes/admin/adminAccounts");
const topupRoutes = require("./routes/topup");
const adminTopupRoutes = require("./routes/admin/adminTopup");

const app = express(); // ✅ phải đặt trước tất cả app.use / app.set

// ✅ Nếu chạy production qua proxy (Cloudflare / Nginx)
app.set("trust proxy", 1);

// ✅ Force HTTPS trong production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect("https://" + req.headers.host + req.url);
    }
  }
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.use(express.static("public"));

// ✅ SESSION
app.use(
  session({
    secret: "kunz-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production", // ✅ rất quan trọng khi dùng HTTPS
    },
  })
);

// ✅ session -> EJS
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// ✅ routes
app.use("/", homeRoutes);
app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", adminRoutes);
app.use("/", adminGiftcodeRoutes);
app.use("/admin", adminAccountsRoutes);
app.use("/admin/api", adminApiRoutes);
app.use("/", topupRoutes);
app.use("/admin", adminTopupRoutes);

// ✅ listen
app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log("Server chạy tại port: " + process.env.PORT);
});
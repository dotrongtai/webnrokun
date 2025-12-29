const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const authRoutes = require("./routes/auth/auth");
const homeRoutes = require("./routes/home");
const userRoutes = require("./routes/auth/user");
const adminRoutes = require("./routes/auth/admin");
const adminGiftcodeRoutes = require("./routes/admin/adminGiftcode");
const adminApiRoutes = require("./routes/admin/adminApi");
const adminAccountsRoutes = require("./routes/admin/adminAccounts");

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


app.use("/", homeRoutes);
app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", adminRoutes);
app.use("/", adminGiftcodeRoutes);
app.use("/admin", adminAccountsRoutes);

app.use("/admin/api", adminApiRoutes);

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log("Server chạy tại port: " + process.env.PORT);
});

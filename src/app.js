const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const homeRoutes = require("./routes/home");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// chỉ định views nằm ở root
app.set("view engine", "ejs");
app.use(express.static("public"));
const session = require("express-session");

app.use(session({
  secret: "kunz-secret-key",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24*60*60*1000 } // 1 ngày
}));
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.use("/", homeRoutes);

app.use("/", authRoutes);

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log("Server chạy tại port: " + process.env.PORT);
});


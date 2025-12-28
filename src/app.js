const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const homeRoutes = require("./routes/home");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");

app.use(bodyParser.urlencoded({ extended: true }));


app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const session = require("express-session");

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


app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log("Server chạy tại port: " + process.env.PORT);
});

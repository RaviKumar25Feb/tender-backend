const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const { dbConnect } = require("./configs/dbConnect");
const authRoutes = require("./routes/auth.routes");
const tenderRoutes = require("./routes/tender.routes");
const startTenderCron = require("./cron/tenderCron");

require("dotenv").config();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

//import db
dbConnect();

//mount route
app.use("/api/auth", authRoutes);

// Routes Mounting
app.use("/api/tenders", tenderRoutes);

//app start
app.listen(PORT, () => {
  console.log(`App started at port ${PORT}`);
  
  // start cron AFTER server is up
  startTenderCron();
});

//default route
app.get("/", (req, res) => {
  res.send(`<h1>Welcome to Tender247</h1>`);
});

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const seed = require("./seed");

const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const timeclockRouter = require("./routes/timeclock");
const companiesRouter = require("./routes/companies");
const notificationsRouter = require("./routes/notifications");
const hostingRouter = require("./routes/hosting");
const ticketsRouter = require("./routes/tickets");
const posRouter = require("./routes/pos");
const dkoneRouter = require("./routes/dkone");

const app = express();

app.use(cors());
app.use(express.json());

// JWT auth middleware — attaches req.user if token is valid
app.use((req, res, next) => {
  const auth = req.headers.authorization;

  if (auth && auth.startsWith("Bearer ")) {
    try {
      req.user = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    } catch (err) {
      // invalid token — leave req.user undefined
    }
  }

  next();
});

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/timeclock", timeclockRouter);
app.use("/companies", companiesRouter);
app.use("/notifications", notificationsRouter);
app.use("/hosting", hostingRouter);
app.use("/tickets", ticketsRouter);
app.use("/pos", posRouter);
app.use("/dkone", dkoneRouter);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3001;

seed()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
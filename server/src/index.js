require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const seed = require("./seed");
const { startPoller } = require("./poller");

const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const timeclockRouter = require("./routes/timeclock");
const companiesRouter = require("./routes/companies");
const notificationsRouter = require("./routes/notifications");
const hostingRouter = require("./routes/hosting");
const ticketsRouter = require("./routes/tickets");
const licenceRouter = require("./routes/licence");
const posRouter = require("./routes/pos");
const dkoneRouter = require("./routes/dkone");
const dkplusRouter = require("./routes/dkplus");
const duoRouter = require("./routes/duo");

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

// Public routes — no auth required
app.use("/auth", authRouter);

// Require valid JWT for everything below
app.use((req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Ekki innskráður" });
  next();
});

app.use("/users", usersRouter);
app.use("/timeclock", timeclockRouter);
app.use("/companies", companiesRouter);
app.use("/notifications", notificationsRouter);
app.use("/hosting", hostingRouter);
app.use("/tickets", ticketsRouter);
app.use("/licence", licenceRouter);
app.use("/pos", posRouter);
app.use("/dkone", dkoneRouter);
app.use("/dkplus", dkplusRouter);
app.use("/duo", duoRouter);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3001;

seed()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API listening on port ${PORT}`);
      startPoller();
    });
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
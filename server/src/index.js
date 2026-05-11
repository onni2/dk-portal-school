require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000").split(",");

const seed = require("./seed");
const { startPoller } = require("./poller");

const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const timeclockRouter = require("./routes/timeclock");
const companiesRouter = require("./routes/companies");
const notificationsRouter = require("./routes/notifications");
const { router: hostingRouter } = require("./routes/hosting");
const ticketsRouter = require("./routes/tickets");
const licenceRouter = require("./routes/licence");
const posRouter = require("./routes/pos");
const dkoneRouter = require("./routes/dkone");
const dkplusRouter = require("./routes/dkplus");
const duoRouter = require("./routes/duo");
const knowledgeBaseRouter = require("./routes/knowledgeBase");
const maintenanceRouter = require("./routes/maintenance");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Of margar tilraunir, reyndu aftur eftir 15 mínútur" },
  standardHeaders: true,
  legacyHeaders: false,
});

const app = express();

app.use(helmet());
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
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
// Rate limit only the login endpoint, not switch-company or password reset
app.use("/auth/login", authLimiter);
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
app.use("/knowledge-base", knowledgeBaseRouter);
app.use("/maintenance", maintenanceRouter);

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
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const seed = require("./seed");

const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const timeclockRouter = require("./routes/timeclock");

const app = express();

app.use(cors());
app.use(express.json());

// JWT auth middleware — attaches req.user if token is valid
const jwt = require("jsonwebtoken");
app.use((req, res, next) => {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    try {
      req.user = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    } catch {
      // invalid token — leave req.user undefined
    }
  }
  next();
});

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/timeclock", timeclockRouter);

app.get("/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;

seed()
  .then(() => {
    app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });

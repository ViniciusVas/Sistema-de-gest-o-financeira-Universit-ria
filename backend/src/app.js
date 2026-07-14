const cors = require("cors");
const express = require("express");
const morgan = require("morgan");

const routes = require("./routes");
const { errorMiddleware, notFoundMiddleware } = require("./middlewares/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "gestao-financeira-universitaria-backend"
  });
});

app.use(routes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;

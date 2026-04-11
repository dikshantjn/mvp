const express = require("express");

const { loadEnv } = require("./src/config/env");
const apiRoutes = require("./src/routes");
const { notFoundHandler, errorHandler } = require("./src/middlewares/errorHandler");

loadEnv();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

const express = require("express");

const adminRoutes = require("./adminRoutes");
const authRoutes = require("./authRoutes");
const buyerRoutes = require("./buyerRoutes");

const router = express.Router();

router.use(authRoutes);
router.use(buyerRoutes);
router.use(adminRoutes);

module.exports = router;

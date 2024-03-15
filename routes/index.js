const express = require("express");
const router = express.Router();
const controller = require("../controllers/controller");

router.get("/", controller.index);

router.get("/logout", controller.logout);

router.get("/delete/:id", controller.delete);

router.get("/sign-up", controller.signUp_create_get);
router.post("/sign-up", controller.signUp_create_post);

router.get("/login", controller.login_create_get);
router.post("/login", controller.login_create_post);

router.get("/membership", controller.member_create_get);
router.post("/membership", controller.member_create_post);

router.get("/admin", controller.admin_create_get);
router.post("/admin", controller.admin_create_post);

router.get("/create-message", controller.message_create_get);
router.post("/create-message", controller.message_create_post);

module.exports = router;

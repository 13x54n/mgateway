const express = require("express");
const supportCaseController = require("../controllers/supportCase.controller");
const upload = require("../middlewares/upload.middleware");

const supportCaseRouter = express.Router();

// Define routes
supportCaseRouter.post(
  "/support-case",
  upload.array("support-images", 5),
  supportCaseController.createSupportCase
);
supportCaseRouter.get("/support-cases", supportCaseController.getSupportCases);
supportCaseRouter.get(
  "/support-cases/user/:userId",
  supportCaseController.getSupportCasesByUser
);
supportCaseRouter.delete(
  "/support-case/:id",
  supportCaseController.deleteSupportCase
);

supportCaseRouter.patch(
  "/support-case/:id",
  supportCaseController.markSupportCaseResolved
);


module.exports = supportCaseRouter;

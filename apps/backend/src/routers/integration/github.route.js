import { Router } from "express";
import { getUserGithubIssuesAndPRsController, handleGithubCallbackController } from "../../controllers/integration/github.controller.js"

const router = Router();
router.route("/issues/").get(getUserGithubIssuesAndPRsController);
router.route("/callback/").get(handleGithubCallbackController);

export default router;

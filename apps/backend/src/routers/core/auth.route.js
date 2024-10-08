import { Router } from "express";
import { magicLoginController, validateLoginMagicLinkController, authenticateWithGoogleController, logOutController, registerEmailUserController, emailLoginController } from "../../controllers/core/auth.controller.js";
// import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const router = Router();

router.route('/common/signup/').post(registerEmailUserController);
router.route('/common/login/').post(emailLoginController);
router.route('/magic/login/').post(magicLoginController);
router.route('/magic/verify/').post(validateLoginMagicLinkController);

router.route('/google/login/').post(authenticateWithGoogleController);

router.route('/logout/').post(logOutController);

// router.get(
//     "/user-info",
//     ClerkExpressRequireAuth(),
//     (req, res) => {
//       const { auth } = req;
//       res.json({ userId: auth.userId, sessionId: auth.sessionId });
//     }
//   );

export default router;

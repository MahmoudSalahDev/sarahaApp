import { Router } from "express";
import * as UC from "./user.service.js";
import { authentication } from "../../middleware/authentication.js";
import { validation } from "../../middleware/validation.js";
import * as UV from "./user.validation.js";
import { userRole } from "../../DB/Models/user.model.js";
import { authorization } from "../../middleware/authorization.js";
import { allowedExtentions, MulterHost } from "../../middleware/multer.js";
import messageRouter from "../messages/message.controller.js";

const userRouter = Router();

// userRouter.use("/:id/messages",messageRouter)


// userRouter.post("/signup",
//     MulterHost({
//         customPath: "users/profile",
//         customExtention: allowedExtentions.image
//     }).fields([
//         { name: "attachment", maxCount: 1 },
//         { name: "attachments", maxCount: 2 },
//     ]),
//     validation(UV.signUpSchema),
//     UC.signUp);

userRouter.post("/signup",
    MulterHost({
        customPath: "users/profile",
        customExtention: allowedExtentions.image
    }).array("attachments"),
    validation(UV.signUpSchema),
    UC.signUp);




userRouter.post("/login", validation(UV.loginSchema), UC.login);


userRouter.post("/loginWithGmail", UC.loginWithGmail);

//  Send or Resend Code
userRouter.post("/resendCode", UC.resendVerificationCode);

//  Confirm via code
userRouter.post("/confirmEmail", UC.confirmEmail);
userRouter.get("/profile", authentication, authorization(Object.values(userRole)), UC.getProfile);
userRouter.get("/profile/:id", UC.getProfileData);
userRouter.post("/logout", authentication, UC.logOut);
userRouter.patch("/updatePassword", validation(UV.updatePasswordSchema), authentication, UC.updatePassword);
userRouter.patch("/updateProfile", validation(UV.updateProfileSchema), authentication, UC.updateProfile);

userRouter.patch("/updateProfileImage", authentication, MulterHost({
    customPath: "users/profile",
    customExtention: allowedExtentions.image
}).array("attachments"),
    //  validation(UV.updateProfileImageSchema),
    UC.updateProfileImage);

userRouter.patch("/forgetPassword", validation(UV.forgetPasswordSchema), UC.forgetPassword);
userRouter.patch("/resetPassword", validation(UV.resetPasswordSchema), UC.resetPassword);
userRouter.post("/refreshToken", UC.refreshToken);
userRouter.delete("/freeze/{:id}", validation(UV.freezeSchema), authentication, UC.freezeProfile);
userRouter.delete("/unFreeze/{:id}", validation(UV.unFreezeSchema), authentication, UC.unFreezeProfile);

export default userRouter;

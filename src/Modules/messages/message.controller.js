import { Router } from "express";
import * as MS from "./message.service.js"
import * as MV from "./message.validation.js"
import { validation } from "../../middleware/validation.js";
import { authentication } from "../../middleware/authentication.js";

const messageRouter = Router({caseSensitive:true , mergeParams:true})


messageRouter.post("/send", validation(MV.createMessageSchema),MS.createMessage)
messageRouter.get("/",authentication,MS.listMessages)
messageRouter.get("/:id",validation(MV.getMessageSchema),authentication,MS.getMessage)



export default messageRouter
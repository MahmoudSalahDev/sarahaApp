import joi from "joi";
import { generalRules } from "../../utils/index.js";

export const createMessageSchema = {
    body:joi.object({
        userId: generalRules.id.required(),
        content: joi.string().min(1).required(),
    }).required()
}

export const getMessageSchema = {
    params:joi.object({
        id: generalRules.id.required(),
    }).required()
}
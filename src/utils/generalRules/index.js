import joi from "joi"
import { Types } from "mongoose"
export const customId = (value, helper) => {
    const data = Types.ObjectId.isValid(value)
    return data ? value : helper.message("inValid Id")
}

export const generalRules = {
    id: joi.string().custom(customId),
    email: joi.string().email({ tlds: { allow: false } }),
    password: joi.string(),
    headers: joi.object({
        authorization: joi.string().required()
    }).unknown(),
    file: joi.object({
        size:joi.number().positive().required(),
        path:joi.string().required(),
        filename:joi.string().required(),
        destination:joi.string().required(),
        mimetype:joi.string().required(),
        encoding:joi.string().required(),
        originalname:joi.string().required(),
        fieldname:joi.string().required(),
    }).messages({
        "any.required":"file is required"
    })
}
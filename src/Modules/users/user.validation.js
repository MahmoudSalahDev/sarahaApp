import joi from "joi"
import { userGender, userRole } from "../../DB/Models/user.model.js"
import { generalRules } from "../../utils/generalRules/index.js"


export const signUpSchema = {
    body: joi.object({
        name: joi.string().alphanum().required().min(3).max(15),
        email: generalRules.email.required(),
        password: generalRules.password.required(),
        cPassword: joi.string().required().valid(joi.ref("password")),
        gender: joi.string().required().valid(userGender.male, userGender.female),
        // role: joi.string().required().valid(userRole.user, userRole.admin),
        age: joi.number().required().max(65).min(18).integer(),
        phone: joi.string().required(),
    }).required(),
    // files: joi.object({
    //     attachment: joi.array().items(generalRules.file.required()).required(),
    //     attachments: joi.array().items(generalRules.file.required()).required(),
    // }).required()

}

export const updateProfileImageSchema = {
file: generalRules.file.required()

}

export const loginSchema = {
    body: joi.object({
        email: generalRules.email.required(),
        password: generalRules.password.required(),
    }).required(),
}

export const updatePasswordSchema = {
    body: joi.object({
        oldPassword: generalRules.password.required(),
        newPassword: generalRules.password.required(),
        cPassword: joi.string().required().valid(joi.ref("newPassword")),
    }).required(),
}

export const forgetPasswordSchema = {
    body: joi.object({
        email: generalRules.email.required(),
    }).required(),
}
export const resetPasswordSchema = {
    body: joi.object({
        email: generalRules.email.required(),
        otp: joi.string().length(4).required(),
        newPassword: generalRules.password.required(),
        cPassword: joi.string().required().valid(joi.ref("newPassword")),
    }).required(),
}

export const updateProfileSchema = {
    body: joi.object({
        name: joi.string().alphanum().min(3).max(15),
        email: generalRules.email,
        gender: joi.string().valid(userGender.male, userGender.female),
        role: joi.string().valid(userRole.user, userRole.admin),
        age: joi.number().max(65).min(18).integer(),
        phone: joi.string(),
    }),
}

export const freezeSchema = {
    params: joi.object({
        id: generalRules.id
    }),
}
export const unFreezeSchema = {
    params: joi.object({
        id: generalRules.id
    }),
}
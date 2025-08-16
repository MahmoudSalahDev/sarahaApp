import revokeTokenModel from "../../DB/Models/revokeToken.model.js";
import userModel, { userProviders, userRole } from "../../DB/Models/user.model.js"
import { generateToken, verifyToken, Hash, Compare, Encrypt, Decrypt, eventEmitter, } from "../../utils/index.js"
import { customAlphabet, nanoid } from 'nanoid'
import { OAuth2Client } from 'google-auth-library';
import cloudinary from "../../utils/cloudinary/index.js";




export const signUp = async (req, res, next) => {
    const { name, email, password, phone, gender, age } = req.body;

    // console.log(req);

    let arrPaths = []
    for (const file of req?.files) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(file?.path, {
            folder: "sarahaApp/users/coverImages",
        })
        arrPaths.push({ secure_url, public_id })
    }
    // console.log(arrPaths);


    // const { secure_url, public_id } = await cloudinary.uploader.upload(req?.file?.path, {
    //     folder: "sarahaApp/users/profileImage",
    // })

    if (await userModel.findOne({ email })) {
        throw new Error("email already exist!!", { cause: 409 });
    }

    // Hash password
    const hash = await Hash({ plainText: password, SALT_ROUNDS: +process.env.SALT_ROUNDS });

    //     // Encrypt phone
    const cryPhone = await Encrypt({ plainText: phone, SECRET_KEY: process.env.SECRET_KEY });

    //     // let arrayPaths = []
    //     // // uplaod siles
    //     // for (const file of req?.file) {
    //     //     arrayPaths.push(file?.path)
    //     // }

    const user = await userModel.create({
        name,
        email,
        password: hash,
        phone: cryPhone,
        gender,
        age,
        // profileImage: { secure_url, public_id },
        coverImages: arrPaths
    });

    //     eventEmitter.emit("sendEmail", { email });
    console.log(req?.files);


    return res.status(201).json({ message: "user created successfully", user, file: req?.file });
};


export const login = async (req, res, next) => {

    const { email, password } = req.body

    const user = await userModel.findOne({ email: email, confirmed: true })
    if (!user) {
        throw new Error("email not exist! or not confirmed", { cause: 404 })
    }
    const match = await Compare({ plainText: password, cipherText: user.password })
    if (!match) {
        throw new Error("invalid email or password!", { cause: 400 })
    }

    // create token 
    const access_token = await generateToken({
        payload: { id: user._id, email },
        SIGNATURE: user.role == userRole.user ? process.env.ACCESS_TOKEN_USER : process.env.ACCESS_TOKEN_ADMIN,
        options: { expiresIn: "1h", jwtid: nanoid() }
    })
    const refresh_token = await generateToken({
        payload: { id: user._id, email },
        SIGNATURE: user.role == userRole.user ? process.env.REFRESH_TOKEN_USER : process.env.REFRESH_TOKEN_ADMIN,
        options: { expiresIn: "1y", jwtid: nanoid() }
    })

    return res.status(200).json({ message: "success", access_token, refresh_token })

}

export const loginWithGmail = async (req, res, next) => {
    const { idToken } = req.body

    const client = new OAuth2Client();
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.WEB_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        return payload
    }
    const { email, email_verified, name, picture } = await verify()


    let user = await userModel.findOne({ email: email })
    if (!user) {
        user = await userModel.create({
            name,
            email,
            confirmed: email_verified,
            image: picture,
            password: nanoid(),
            provider: userProviders.google
        })
    }

    if (user.provider !== userProviders.google) {
        throw new Error("Please login on system");

    }

    // create token 
    const access_token = await generateToken({
        payload: { id: user._id, email },
        SIGNATURE: user.role == userRole.user ? process.env.ACCESS_TOKEN_USER : process.env.ACCESS_TOKEN_ADMIN,
        options: { expiresIn: "1h", jwtid: nanoid() }
    })
    const refresh_token = await generateToken({
        payload: { id: user._id, email },
        SIGNATURE: user.role == userRole.user ? process.env.REFRESH_TOKEN_USER : process.env.REFRESH_TOKEN_ADMIN,
        options: { expiresIn: "1y", jwtid: nanoid() }
    })

    return res.status(200).json({ message: "success", access_token, refresh_token })

}


export const getProfile = async (req, res, next) => {

    // decrypt
    const phone = await Decrypt({ cipherText: req.user.phone, SECRET_KEY: process.env.SECRET_KEY })
    req.user.phone = phone

    //  ...user, phone
    return res.status(200).json({ message: "success", user: req.user, phone })

}


export const getProfileData = async (req, res, next) => {

    const { id } = req.params

    const user = await userModel.findById(id).select("name email image age gender")
    if (!user) {
        throw new Error("User not exist!", { cause: 404 })
    }


    return res.status(200).json({ message: "success", user })

}

export const resendVerificationCode = async (req, res, next) => {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
        throw new Error("User not found", { cause: 404 })
    }

    if (user.confirmed) {
        throw new Error("User already confirmed", { cause: 400 })
    }

    // Check if user is temporarily banned
    if (user.verificationCodeBanUntil && user.verificationCodeBanUntil > new Date()) {
        const waitTime = Math.ceil((user.verificationCodeBanUntil - new Date()) / 60000);
        throw new Error(`You are temporarily blocked. Try again after ${waitTime} minute(s).`, { cause: 429 })
    }

    eventEmitter.emit("sendEmail", { email });
    return res.status(200).json({ message: "Verification code sent" });
};

export const confirmEmail = async (req, res, next) => {
    const { email, code } = req.body;

    const user = await userModel.findOne({ email, confirmed: false });
    if (!user) {
        return res.status(404).json({ message: "User not found or already confirmed" });
    }

    // Ban check
    if (user.verificationCodeBanUntil && user.verificationCodeBanUntil > new Date()) {
        const waitTime = Math.ceil((user.verificationCodeBanUntil - new Date()) / 60000);
        return res.status(429).json({ message: `Too many attempts. Try again after ${waitTime} minute(s)` });
    }

    // Expiry check
    if (!user.verificationCode || user.verificationCodeExpires < new Date()) {
        return res.status(400).json({ message: "Code expired. Please request a new one." });
    }

    // Wrong code
    if (user.verificationCode !== code) {
        user.verificationCodeAttempts += 1;

        if (user.verificationCodeAttempts >= 5) {
            user.verificationCodeBanUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
        }

        await user.save();
        return res.status(400).json({ message: "Invalid verification code." });
    }


    user.confirmed = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    user.verificationCodeAttempts = 0;
    user.verificationCodeBanUntil = null;

    await user.save();

    return res.status(200).json({ message: "Email confirmed successfully." });
};

export const logOut = async (req, res, next) => {

    const revokeToken = await revokeTokenModel.create({
        tokenId: req.decoded.jti,
        expireAt: req.decoded.exp
    })
    return res.status(200).json({ message: "success", revokeToken })

}


//=======================refreshToken======================
export const refreshToken = async (req, res, next) => {

    const { auth } = req.headers

    const [prefix, token] = auth.split("__") || []

    if (!prefix || !token) {
        throw new Error("Token not exist!", { cause: 404 })
    }

    let signature = ''
    if (prefix == "bearer") {
        signature = process.env.REFRESH_TOKEN_USER
    } else if (prefix == "admin") {
        signature = process.env.REFRESH_TOKEN_ADMIN
    } else {
        throw new Error("Invalid Prefix!!", { cause: 404 })
    }

    const decoded = await verifyToken({ token, SIGNATURE: signature })
    if (!decoded?.email) {
        throw new Error("InValid Token", { cause: 400 });
    }
    const revoked = await revokeTokenModel.findOne({ tokenId: decoded.jti })
    if (revoked) {
        throw new Error("Please log in again!", { cause: 403 });
    }
    const user = await userModel.findById(decoded.id)
    if (!user) {
        throw new Error("user not exist!", { cause: 404 })
    }

    // create token 
    const access_token = await generateToken({
        payload: { id: user._id, email: user.email },
        SIGNATURE: user.role == userRole.user ? process.env.ACCESS_TOKEN_USER : process.env.ACCESS_TOKEN_ADMIN,
        options: { expiresIn: "1h", jwtid: nanoid() }
    })
    const refresh_token = await generateToken({
        payload: { id: user._id, email: user.email },
        SIGNATURE: user.role == userRole.user ? process.env.REFRESH_TOKEN_USER : process.env.REFRESH_TOKEN_ADMIN,
        options: { expiresIn: "1y", jwtid: nanoid() }
    })


    return res.status(200).json({ message: "success", access_token, refresh_token })

}


export const updatePassword = async (req, res, next) => {

    const { oldPassword, newPassword } = req.body

    if (!await Compare({ plainText: oldPassword, cipherText: req.user.password })) {
        throw new Error("Invalid Old Password", { cause: 404 })

    }
    const hash = await Hash({ plainText: newPassword })

    req.user.password = hash
    await req.user.save()
    //  ...user, phone
    return res.status(200).json({ message: "success" })

}


export const forgetPassword = async (req, res, next) => {

    const { email } = req.body

    const user = await userModel.findOne({ email: email })
    if (!user) {
        throw new Error("email not exist!", { cause: 404 })
    }

    const otp = customAlphabet("0123456789", 4)()

    eventEmitter.emit("forgetPassword", { email, otp });


    user.otp = await Hash({ plainText: otp })

    await user.save()
    return res.status(200).json({ message: "success" })

}

export const resetPassword = async (req, res, next) => {

    const { email, otp, newPassword } = req.body

    const user = await userModel.findOne({ email: email, otp: { $exists: true } })
    if (!user) {
        throw new Error("User not exist!", { cause: 404 })
    }

    if (!await Compare({ plainText: otp, cipherText: user?.otp })) {
        throw new Error("Invalid OTP !", { cause: 404 })

    }

    const hash = await Hash({ plainText: newPassword })

    await userModel.updateOne({ email }, {
        password: hash,
        $unset: { otp: "" }
    })

    return res.status(200).json({ message: "success" })

}

export const updateProfile = async (req, res, next) => {
    const { name, email, phone, gender, age } = req.body

    if (name) req.user.name = name
    if (gender) req.user.gender = gender
    if (age) req.user.age = age

    if (phone) {
        // Encrypt phone
        const cryPhone = await Encrypt({ plainText: phone, SECRET_KEY: process.env.SECRET_KEY });
        req.user.phone = cryPhone
    }
    if (email) {
        const user = await userModel.findOne({ email })
        if (user) {
            throw new Error("Email Already Exists!", { cause: 400 })
        }

        eventEmitter.emit("sendEmail", { email });

        req.user.email = email
        req.user.confirmed = false

    }

    await req.user.save()

    return res.status(200).json({ message: "success", })

}


export const freezeProfile = async (req, res, next) => {
    const { id } = req.params

    if (id && req.user.role !== userRole.admin) {
        throw new Error("You Can Not Freeze This Account!!", { cause: 400 })
    }
    const user = await userModel.updateOne(
        {
            _id: id || req.user._id,
            isDeleted: { $exists: false }
        },
        {
            isDeleted: true,
            deletedBy: req.user._id
        },
        {
            $inc: { __v: 1 }
        }
    )


    user.matchedCount ? res.status(200).json({ message: "success", }) : res.status(400).json({ message: "Failed to Freeze" });

}

export const unFreezeProfile = async (req, res, next) => {
    const { id } = req.params

    if (id && req.user.role !== userRole.admin) {
        throw new Error("You Can Not Freeze This Account!!", { cause: 400 })
    }
    const user = await userModel.updateOne(
        {
            _id: id || req.user._id,
            isDeleted: { $exists: true }
        },
        {
            $unset: { isDeleted: "", deletedBy: "" },
        },
        {
            $inc: { __v: 1 }
        }
    )


    user.matchedCount ? res.status(200).json({ message: "success", }) : res.status(400).json({ message: "Failed to UnFreeze" });

}



export const updateProfileImage = async (req, res, next) => {

    //  const { secure_url, public_id } = await cloudinary.uploader.upload(req?.file?.path, {
    //     folder: "sarahaApp/users/profileImage",
    // })

    let arrPaths = []
    for (const file of req?.files) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(file?.path, {
            folder: "sarahaApp/users/coverImages",
        })
        arrPaths.push({ secure_url, public_id })
    }


    const user = await userModel.findByIdAndUpdate({ _id: req?.user?._id }, { coverImages: arrPaths })



    let public_ids =[]
    for (const image of user?.coverImages) {
        public_ids.push(image?.public_id)
    }
    await cloudinary.api.delete_resources(public_ids)

    return res.status(200).json({ message: "success", user })

}
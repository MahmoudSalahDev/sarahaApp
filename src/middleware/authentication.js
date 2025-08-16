import revokeTokenModel from "../DB/Models/revokeToken.model.js"
import userModel from "../DB/Models/user.model.js"
import { verifyToken } from "../utils/token/verifyToken.js"


export const authentication = async (req, res, next) => {

    const { auth } = req.headers

    const [prefix, token] = auth.split("__") || []

    if (!prefix || !token) {
        throw new Error("Token not exist!", { cause: 404 })
    }

    let signature = ''
    if (prefix == "bearer") {
        signature = process.env.ACCESS_TOKEN_USER
    } else if (prefix == "admin") {
        signature = process.env.ACCESS_TOKEN_ADMIN
    } else {
        throw new Error("Invalid Prefix!!", { cause: 404 })
    }

    const decoded = await verifyToken({ token, SIGNATURE: signature })
    if(!decoded?.email){
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
    if (!user?.confirmed || user?.isDeleted == false) {
        throw new Error("please confirm Email first! Or Unfreeze the account first", { cause: 400 })
    }


    req.user = user
    req.decoded = decoded
    return next()

}

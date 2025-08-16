import messageModel from "../../DB/Models/message.model.js";
import userModel from "../../DB/Models/user.model.js"



// ================create a Message =====================
export const createMessage = async (req, res, next) => {
    const { userId, content } = req.body

    const userExist = await userModel.findOne({ _id: userId, isDeleted: { $exists: false } })
    if (!userExist) {
        throw new Error("User not Exists Or Freezed!!");
    }

    const message = await messageModel.create({ userId, content })

    return res.status(201).json({ message: "Message created successfully", message });

}

// ================get List Message =====================
export const listMessages = async (req, res, next) => {

    console.log(req.params);
    

    const messages = await messageModel.find({ userId: req?.params?.id }).populate([
        {
            path:"userId",
            select:"name"
        }
    ])

    return res.status(200).json({ message: "Success", messages });

}

// ================get one Message =====================
export const getMessage = async (req, res, next) => {
    const { id } = req.params

    const message = await messageModel.findOne({ userId: req?.user?._id, _id: id })
    if (!message) {
        throw new Error("Message not found!");

    }

    return res.status(200).json({ message: "Success", message });

}
import mongoose from "mongoose";


export const userGender = {
    male: "male",
    female: "female",
}

export const userRole = {
    user: "user",
    admin: "admin",
}

export const userProviders = {
    system: "system",
    google: "google",
}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        // required: function(){
        //     return this.provider==userProviders.system? true :false;
        // }
        required: true
    },
    profileImage: {
        secure_url: { type: String },
        public_id: { type: String },
    },
    coverImages: [
        {
            secure_url: { type: String, required: true },
            public_id: { type: String, required: true }
        }
    ],
    phone: {
        type: String,
        trim: true,
    },
    gender: {
        type: String,
        enum: Object.values(userGender),
        default: "male"
    },
    age: {
        type: Number,
        min: 18,
        max: 60
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: Object.values(userRole),
        default: "user"
    },
    verificationCode: String,
    verificationCodeExpires: Date,
    verificationCodeAttempts: {
        type: Number,
        default: 0
    },
    verificationCodeBanUntil: Date,
    otp: String,
    isDeleted: Boolean,
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    provider: {
        type: String,
        enum: Object.values(userProviders),
        default: userProviders.system
    }

}, {
    timestamps: true
});



const userModel = mongoose.models.User || mongoose.model("User", userSchema)


export default userModel
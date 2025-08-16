import multer from "multer"
import fs from "fs"

export const allowedExtentions = {
    image: ["image/jpeg", "image/png"],
    video: ["video/mp4"]
}


export const MulterLocal = ({ customPath = "generals", customExtention = [] } = {}) => {
    const fullPath = `./uploads/${customPath}`
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true })
    }

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, fullPath)
        },
        filename: function (req, file, cb) {
            console.log(file);

            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            cb(null, uniqueSuffix + "_" + file.originalname)
        }
    })


    function fileFilter(req, file, cb) {

        if (!customExtention.includes(file.mimetype)) {
            cb(new Error('Invalid File'))

        } else {

            cb(null, true)
        }




    }

    const upload = multer({ storage, fileFilter })
    return upload
}

export const MulterHost = ({  customExtention = [] } = {}) => {
    const storage = multer.diskStorage({})

    function fileFilter(req, file, cb) {
        if (!customExtention.includes(file.mimetype)) {
            cb(new Error('Invalid File'))
        } else {
            cb(null, true)
        }
    }

    const upload = multer({ storage, fileFilter })
    return upload
}
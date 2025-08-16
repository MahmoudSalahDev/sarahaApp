import express from 'express'
import bootstrap from './src/app.controller.js'
import dotenv from "dotenv"
import path from "path"

dotenv.config({path:path.resolve("src/config/.env")})


const app = express()
const port = process.env.PORT

bootstrap(app, express)


app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))



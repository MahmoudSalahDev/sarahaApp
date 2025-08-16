import mongoose from "mongoose";
import chalk from 'chalk';


const checkConnectionDB = async () => {
    await mongoose.connect(process.env.DB_URL)
        .then(() => {
            console.log(chalk.bgCyanBright("success to connect to DB"));

        })
        .catch((err) => {
            console.log("failed to connect to DB" + err);

        })
}

export default checkConnectionDB


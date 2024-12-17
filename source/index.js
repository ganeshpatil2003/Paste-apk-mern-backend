import { app } from "./app.js";
import { dbConnection } from "./db/index.js";
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});


 dbConnection()
 .then(
    app.listen(process.env.PORT || 8000,() => {
        console.log(`App is listening on port ${process.env.PORT}`)
    })
 ).catch((error) => {
    console.log(`DataBase Connection Error.`)
 })
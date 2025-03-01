const mongoose = require("mongoose")

const dbConnect = async ()=>{
 try {
   await mongoose.connect(process.env.DB_URL)
   console.log("Connect to database");
 } catch (error) {
  console.log(error)
 }
}

module.exports = dbConnect
const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/pro");
    console.log("DB Connected Successfully");
  } catch (error) {
    console.log("DB Connection Failed", error.message);
  }
};
dbConnect();

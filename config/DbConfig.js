const mongoose = require("mongoose");

const DBCOnfig = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("Data Base Connected!");
  } catch (error) {
    console.log(error);
  }
};

module.exports = DBCOnfig;

const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");

main()
  .then(console.log("Connection Successfull"))
  .catch((err) => console.log("Connection Failed!"));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/airbnb");
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "65f5d25d3612d1501bbe95fa",
  }));
  await Listing.insertMany(initData.data);
  console.log("Data inserted");
};

initDB();

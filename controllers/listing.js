const Listing = require("../models/listing");
const NodeGeocoder = require("node-geocoder");

const geocoder = NodeGeocoder({
  provider: "tomtom",
  apiKey: process.env.MAP_TOKEN, // Replace with your actual API key
});

module.exports.index = async (req, res) => {
  const allListing = await Listing.find({});
  res.render("listings/index.ejs", { allListing });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "The listing you requested for does not exist!");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  const address = req.body.listing.location + " " + req.body.listing.country;

  let result = await geocoder.geocode(address).catch((error) => {
    console.error("Error Geocoding:", error.message);
  });

  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry = {
    type: "Point",
    coordinates: [result[0].longitude, result[0].latitude],
  };
  let savedListing = await newListing.save();
  console.log(savedListing);
  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "The listing you requested for does not exist!");
    res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("upload/", "upload/w_250/");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let newListing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    newListing.image = { url, filename };
    await newListing.save();
  }

  req.flash("success", "Listing Edited!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

module.exports.filterListing = async (req, res) => {
  let { filter } = req.params;
  let filteredListing = await Listing.find({ category: filter });
  res.render("listings/index.ejs", { allListing: filteredListing });
};

module.exports.searchName = async (req, res) => {
  let name = req.query.name;
  let searchedListing = await Listing.find({ title: name });
  res.render("listings/index.ejs", { allListing: searchedListing });
};

module.exports.filterPrice = async (req, res) => {
  let price = req.query.price;
  let filteredListing;
  price = Number(price);
  switch (price) {
    case 2000:
      filteredListing = await Listing.find({ price: { $lt: price + 1 } });
      break;
    case 3500:
      filteredListing = await Listing.find({
        price: { $gt: 2000, $lt: price + 1 },
      });
      break;
    case 5000:
      filteredListing = await Listing.find({
        price: { $gt: 3500, $lt: price + 1 },
      });
      break;
    case 7500:
      filteredListing = await Listing.find({
        price: { $gt: 5000, $lt: price + 1 },
      });
      break;
    case 10000:
      filteredListing = await Listing.find({
        price: { $gt: 7500, $lt: price + 1 },
      });
      break;
    case 10001:
      filteredListing = await Listing.find({ price: { $gt: price - 1 } });
  }
  res.render("listings/index.ejs", { allListing: filteredListing });
};

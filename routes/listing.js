const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
  .route("/")
  .get(listingController.index) // Index route
  .post(
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  ); // Create route

// New route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing)) // Show route
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing) // Update route
  )
  .delete(isLoggedIn, isOwner, listingController.destroyListing); // Delete route

// Edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

// filter Price
router.get("/filterPrice/price", listingController.filterPrice);

// Filter
router.get("/filters/:filter", listingController.filterListing);

// Search
router.get("/search/name", listingController.searchName);

module.exports = router;

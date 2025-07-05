const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const ListingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage });


// Index + Create
router
  .route("/")
  .get(wrapAsync(ListingController.index))
  .post(isLoggedIn,
      upload.single('listing[image]'),validateListing,
     wrapAsync(ListingController.createListing));

// Form to create new listing
router.get("/new", isLoggedIn, ListingController.renderNewForm);

// Show / Update / Delete specific listing
router
  .route("/:id")
  .get(wrapAsync(ListingController.showListing))
  .put(isLoggedIn, isOwner, upload.single('listing[image]'),
    validateListing, wrapAsync(ListingController.updateListing))
  .delete(isLoggedIn, isOwner, wrapAsync(ListingController.destroyListing));

// Form to edit listing
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(ListingController.renderEditForm));

// ✅ VERY IMPORTANT
module.exports = router;

const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");

const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const ListingController = require("../controllers/listings.js");
const multer  = require('multer');
const { storage } = require("../cloudConfig.js");

const upload = multer({ storage });

// Index + Create
router
  .route("/")
  .get(wrapAsync(ListingController.index))
  .post(
    isLoggedIn,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(ListingController.createListing)
  );

// Form to create new listing
router.get("/new", isLoggedIn, ListingController.renderNewForm);
router.get("/search", async (req, res) => {
  const { q, category } = req.query;

  let filter = {};

  if (q) {
    const regex = new RegExp(q, "i"); // case-insensitive search
    filter.title = regex;
  }

  if (category && category !== "All") {
    filter.category = category;
  }

  const listings = await Listing.find(filter);
  res.render("listings/index", { allListings: listings });
});


// Show / Update / Delete specific listing
router
  .route("/:id")
  .get(wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
  .populate({
    path: "reviews",
    populate: {
      path: "author"
    }
  })
  .populate("owner");


    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

   
    res.render("listings/show", { listing });
  }))
  .put(
    isLoggedIn,
    isOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(ListingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(ListingController.destroyListing));
  router.post("/", async (req, res) => {
    try {
        const newListing = new Listing(req.body.listing); // category should be inside req.body.listing
        newListing.owner = req.user._id; // if using authentication
        await newListing.save();
        res.redirect(`/listings/${newListing._id}`);
    } catch (err) {
        console.log(err);
        res.send("Error occurred");
    }
});

 

// Form to edit listing
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(ListingController.renderEditForm));

// ✅ VERY IMPORTANT
module.exports = router;

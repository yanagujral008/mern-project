 const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
const Review=require("../models/review.js");
const Listing=require("../models/listing.js");
const {validateReview, isLoggedIn,isReviewAuthor}=require("../middleware.js");
const reviewController=require("../controllers/reviews.js");
router.post('/listings/:id/reviews', async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id; // ✅ This sets the currently logged in user as author
    listing.reviews.push(review);
    await review.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
});




//reviews//post
router.post("/",
isLoggedIn,
validateReview,wrapAsync(reviewController.createReview));
 
 
 
 //Delete Review route
 router.delete("/:reviewId",isLoggedIn,isReviewAuthor,
 wrapAsync(reviewController.destroyReview)
 );
 module.exports=router;

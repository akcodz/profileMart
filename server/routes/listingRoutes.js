import express from "express";
import upload from "../configs/multer.js";
import {protect} from "../middlewares/authMiddleware.js";
import {
    addListing,
    updateListing,
    getAllUserListing,
    getAllPublicListing,
    toggleListingStatus,
    deleteUserListing,
    addCredentials,
    markFeatured,
    getAllUserOrders,
    withdrawAmount,
    purchaseAccount,
} from "../controllers/listingController.js";

const listingRouter = express.Router();

listingRouter.post("/", protect, upload.array("images", 5), addListing);
listingRouter.put("/", protect, upload.array("images", 5), updateListing);
listingRouter.get("/user", protect, getAllUserListing);
listingRouter.get("/public", getAllPublicListing);
listingRouter.put("/:id/status", protect,toggleListingStatus );
listingRouter.delete("/:listingId", protect, deleteUserListing);
listingRouter.post("/add-credential", protect, addCredentials);
listingRouter.put("/featured/:id", protect, markFeatured);
listingRouter.get("/user-orders", protect, getAllUserOrders);
listingRouter.post("/withdraw", protect, withdrawAmount);
listingRouter.get("/purchase-account/:listingId", protect, purchaseAccount);

export default listingRouter;

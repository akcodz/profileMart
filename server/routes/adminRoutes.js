import express from "express";
import {protectAdmin} from "../middlewares/authMiddleware.js";
import {
    changeCredential,
    changeStatus,
    getAllListings, getAllTransactions, getAllUnChangedListings,
    getAllUnverifiedListings, getAllWithdrawalRequests, getCredential,
    getDashboard,
    isAdmin, markCredentialAsVerified, markWithdrawalAsPaid
} from "../controllers/adminController.js";

const adminRouter = express.Router();

adminRouter.get("/isAdmin", protectAdmin, isAdmin);
adminRouter.get("/dashboard", protectAdmin, getDashboard);
adminRouter.get("/all-listings", protectAdmin, getAllListings);
adminRouter.put("/change-status/:listingId", protectAdmin, changeStatus);
adminRouter.get("/unverified-listings", protectAdmin, getAllUnverifiedListings);
adminRouter.get("/credential/:listingId", protectAdmin, getCredential);
adminRouter.put("/verify-credential/:listingId", protectAdmin, markCredentialAsVerified);
adminRouter.get("/unchanged-listings", protectAdmin, getAllUnChangedListings);
adminRouter.put("/change-credential/:listingId", protectAdmin, changeCredential);
adminRouter.get("/transactions", protectAdmin, getAllTransactions);
adminRouter.get("/withdraw-requests", protectAdmin, getAllWithdrawalRequests);
adminRouter.put("/withdrawal-mark/:id", protectAdmin, markWithdrawalAsPaid);

export default adminRouter;

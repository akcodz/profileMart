import {clerkClient} from "@clerk/express";

export const protect = async (req, res, next) => {
    try {
        // Clerk injects the auth function into req
        const { userId, has } = await req.auth();

        // If no userId → user is not authenticated
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Check if user has a premium plan
        const hasPremiumPlan = await has({ plan: "premium" });

        // Attach plan info to the request object
        req.plan = hasPremiumPlan ? "premium" : "free";

        return next();
    } catch (error) {
        console.log("Auth Middleware Error:", error);

        return res.status(401).json({
            message: "Authentication failed",
            error: error?.message || "Unknown error",
        });
    }
};


export const protectAdmin = async (req, res, next) => {
    try {
        // Fetch authenticated user
        const userId = req.auth?.userId;
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const user = await clerkClient.users.getUser(userId);

        // Extract email
        const email = user.emailAddresses?.[0]?.emailAddress;
        if (!email) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        // Validate admin email
        const allowedAdmins = process.env.ADMIN_EMAILS
            ? process.env.ADMIN_EMAILS.split(",")
            : [];

        const isAdmin = allowedAdmins.includes(email);

        if (!isAdmin) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }
        req.isAdmin=isAdmin;

        // Authorized — proceed
        return next();
    } catch (error) {
        console.error("Admin protection error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

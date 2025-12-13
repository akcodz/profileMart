import prisma from "../configs/prisma.js";
import imageKit from "../configs/imageKit.js";
import * as fs from "node:fs";
import {Stripe} from "stripe";
import {inngest} from "../inngest/inngest.js";

export const addListing = async (req, res) => {
    try{
        const {userId} =await req.auth();

        if(req.plan !=='premium'){
            const listingCount = prisma.listing.count({
                where: {
                    ownerId: userId,
                }
            })
            if(listingCount >=5){
                return res.status(400).json({
                    message: 'you have reached the free listing limit',
                })
            }}
            // Parse incoming JSON
            const accountDetails = JSON.parse(req.body.accountDetails);

            // Normalize numeric fields
            const numericFields = [
                "followers_count",
                "engagement_rate",
                "monthly_views",
                "price",
            ];

            numericFields.forEach((field) => {
                accountDetails[field] = parseFloat(accountDetails[field]) || 0;
            });

            // Normalize string fields
            accountDetails.platform = accountDetails.platform?.toLowerCase() || "";
            accountDetails.niche = accountDetails.niche?.toLowerCase() || "";

            // Normalize username: remove leading "@"
            if (accountDetails.username?.startsWith("@")) {
                accountDetails.username = accountDetails.username.slice(1);
            }



        const uploadImages = req.files.map(async (file) => {
            const response = await imageKit.files.upload({
                file: fs.createReadStream(file.path),
                fileName: `${Date.now()}.png`,
                folder: 'profileMart',
                transformation: { pre: "w-1280,h-auto" }
            });

            return response.url;
        });

        const images = await Promise.all(uploadImages);


        const listing = await prisma.listing.create({
            data: {
                ownerId: userId,
                images,
                ...accountDetails
            }
        });

        return  res.status(201).json({
            message: 'Successfully added listing',listing
        })
    }catch(error){
        console.log(error)
        return res.status(500).json({message:error.message })
    }
}

export const getAllPublicListing = async (req, res) => {
    try {
        const listings = await prisma.listing.findMany({
            where: {
                status: "active",
            },
            include: {
                owner: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        if (!listings || listings.length === 0) {
            return res.json({ listings: [] });
        }

        return res.json({ listings });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message,
        });
    }
};

export const getAllUserListing = async (req, res) => {
    try {
        const {userId} =await req.auth();
        const listings = await prisma.listing.findMany({
            where: {
                ownerId: userId,status:{not:'deleted'}
            },
            orderBy: {
                createdAt: 'desc',
            }
        })

        const user =await prisma.user.findUnique({
            where: {id: userId}
        })

        const balance={
            earned:user.earned ,
            withdrawn:user.withdrawn,
            available:user.earned-user.withdrawn
        }

        if(!listings || listings.length===0) {
            return res.json({listings:[],balance});
        }

        return res.json({listings,balance});
    }catch (error) {
        console.error(error);
        return res.status(500).json({message: error.message,});
    }
}

export const updateListing = async (req, res) => {
    try {
        const { userId } =await req.auth();

        // Parse & normalize incoming JSON
        const accountDetails = JSON.parse(req.body.accountDetails);
        const listingId = accountDetails.id;
        // Fetch listing and validate ownership
        const existingListing = await prisma.listing.findUnique({
            where: { id: listingId },
        });

        if (!existingListing) {
            return res.status(404).json({ message: "Listing not found." });
        }

        if (existingListing.owner !== userId) {
            return res.status(403).json({ message: "Unauthorized to update this listing." });
        }

        // Validate image count
        const existingImages = accountDetails.images || [];
        const newUploadCount = req.files?.length || 0;

        if (existingImages.length + newUploadCount > 5) {
            return res
                .status(400)
                .json({ message: "You may upload up to 5 images maximum." });
        }

        // Normalize numeric fields
        const numericFields = [
            "followers_count",
            "engagement_rate",
            "monthly_views",
            "price",
        ];
        numericFields.forEach((field) => {
            accountDetails[field] = parseFloat(accountDetails[field]) || 0;
        });

        // Normalize string fields
        accountDetails.platform = accountDetails.platform?.toLowerCase() || "";
        accountDetails.niche = accountDetails.niche?.toLowerCase() || "";

        // Normalize username
        if (accountDetails.username?.startsWith("@")) {
            accountDetails.username = accountDetails.username.slice(1);
        }

        // Handle optional new images
        let uploadedImages = [];
        if (newUploadCount > 0) {
            const uploadImages = req.files.map(async (file) => {
                const response = await imageKit.files.upload({
                    file: fs.createReadStream(file.path),
                    fileName: `${file.name}-${Date.now()}.png`,
                    folder: "profileMart",
                    transformation: { pre: "w-1280,h-auto" },
                });
                return response.url;
            });

            uploadedImages = await Promise.all(uploadImages);
        }

        // Merge existing + newly uploaded images
        const finalImageArray = [...existingImages, ...uploadedImages];

        // Execute update
        const updatedListing = await prisma.listing.update({
            where: { id: listingId },
            data: {
                accountDetails,
                images: finalImageArray,
            },
        });

        return res.status(200).json({
            message: "Listing updated successfully.",
            listing: updatedListing,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message,
        });
    }
};

export const toggleListingStatus = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { id } = req.params;
        // Fetch listing and validate existence
        const listing = await prisma.listing.findUnique({
            where: { id,ownerId: userId },
        });

        if (!listing) {
            return res.status(404).json({ message: "Listing not found." });
        }

        // Determine new status
        const newStatus = listing.status === "active" ? "inactive" : "active";

       if(listing.status === "active"|| listing.status === "inactive"){
            await prisma.listing.update({
               where: { id,ownerId: userId },
               data: { status: newStatus },
           });
       }else if(listing.status === "ban"){
           return res.status(400).json({ message: "Listing is banned." });
       }else if(listing.status === "sold"){
           return res.status(400).json({ message: "Listing is sold." });
       }

        return res.status(200).json({
            message: "Listing status updated successfully.",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message ,
        });
    }
};

export const deleteUserListing = async (req, res) => {
    try {
        const {userId } =await req.auth();
        const { listingId } = req.params;
        const listing = await prisma.listing.findUnique({
            where: { id: listingId,ownerId: userId },
            include: {owner:true}
        })
        if (!listing) {
            return res.status(404).json({ message: "Listing not found." });
        }
        if(listing.status === "sold"){
            return res.status(400).json({ message: "Listing is sold and cannot be deleted." });
        }

        if(listing.isCredentialChanged){
            await inngest.send({
                name:'app/listing-deleted',
                data:{listing,listingId}
            })
        }
        await prisma.listing.update({
            where: { id: listingId },
            data: {
                status: 'deleted',
            }
        })
        return res.status(200).json({message:'listing deleted successfully.'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message ,
        });
    }
}

export const addCredentials=async (req, res) => {
    try {
        const {userId} =await req.auth();
        const { listingId,credential } = req.body;

        if(credential.length ===0 || !listingId){
            return res.status(400).json({ message: "missing fields." });
        }
        const listing = await prisma.listing.findUnique({
            where: { id: listingId,ownerId: userId }
        })
        if (!listing) {
            return res.status(404).json({ message: "Listing not found." });
        }

        await prisma.credential.create({
            data:{
                listingId,originalCredential:credential
            }
        })
        await prisma.listing.update({
            where: { id: listingId },
            data:{
                isCredentialSubmitted: true,
            }
        })

        return res.status(200).json({message:'Credentials added successfully.'});
    }catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message ,
        });
    }
}

export const markFeatured=async (req, res) => {
    try {
        const { userId } =await req.auth();
        const { id } = req.params;
        if(req.plan !=='premium'){
            return res.status(400).json({ message: "Premium plan required." });
        }
        await  prisma.listing.updateMany({
            where: { ownerId: userId },
            data:{featured:false}
        })

        await prisma.listing.update({
            where: {id},
            data: {featured:true}
        })
        return res.status(200).json({message:'listing marked as featured.'});
    }catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message ,
        });
    }
}

export const getAllUserOrders = async (req, res) => {
    try {
        const { userId } = await req.auth();

        const orders = await prisma.transaction.findMany({
            where: {
                userId,
                isPaid: true,
            },
            include: {
                listing: true,
            },
        });

        if (!orders || orders.length === 0) {
            return res.json({ orders: [] });
        }

        const credentials = await prisma.credential.findMany({
            where: {
                listingId:{in:orders.map(order => order.listingId)},
            }
        })

        const orderWithCredntials=orders.map((order) => {

            const credential = credentials.find((cred) => cred.listingId === order.listingId);
            return {...order,credential}
        })
        return res.json({ orders:orderWithCredntials });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.code || error.message || "Internal server error",
        });
    }
};

export const withdrawAmount = async (req, res) => {
    try {
        const { userId } =await req.auth();
        const {amount ,account} = req.body;

        const user = await prsima.user.findUnique({
            where: {id:userId}
        })
        const balance = user.earned - user.withdrawn

        if(amount>balance){
            return res.status(400).json({message:'insufficient balance'})
        }

        const withdrawal = await prisma.withdrawal.create({
            data:{userId,amount,account}
        })

        await prisma.user.update({
            where: {
                id:userId
            },data:{
                withdrawn:{increment:amount}
            }
        })

        return res.json({message:'Applied for withdrawal',withdrawal })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.code || error.message || "Internal server error",
        });
    }
}

export const purchaseAccount = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { listingId } = req.params;
        const { origin } = req.headers;

        const listing = await prisma.listing.findFirst({
            where: {
                id: listingId,
                status: 'active',
            },
        });

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found or inactive.' });
        }

        if (listing.ownerId === userId) {
            return res.status(400).json({ message: "You can't purchase your own listing." });
        }
        const transaction = await prisma.transaction.create({
            data:{
                listingId,
                ownerId: listing.ownerId,
                userId,
                amount: listing.price,
            }
        })
        const stripeInstance=new Stripe(process.env.STRIPE_SECRET_KEY)
        const session = await stripeInstance.checkout.sessions.create({
            mode: 'payment',
            success_url: `${origin}/loading/my-orders`,
            cancel_url: `${origin}/marketplace`,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Purchasing Account @${listing.username} of ${listing.platform}`,
                            description: `${listing.platform} • Account Purchase`,
                        },
                        unit_amount: Math.floor(transaction.amount * 100), // Stripe expects amount in cents
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                transactionId: transaction.id,
                appId:"profilemart"
            },
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        });

        return res.json({paymentLink:session.url });
    } catch (error) {
        console.error('Purchase account error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

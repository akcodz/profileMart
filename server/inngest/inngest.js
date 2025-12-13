import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";
import sendEmail from "../configs/nodemailer.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "profile-mart" });


export const syncUserCreation = inngest.createFunction(
    { id: "sync-user-from-clerk" },
    { event: "clerk/user.created" },
    async ({ event }) => {
        const { data } = event;

        // Check if user already exists
        const user = await prisma.user.findUnique({ where: { id: data.id } });

        if (!user) {
            // Create new user
            await prisma.user.create({
                data: {
                    id: data.id,
                    email: data?.email_addresses?.[0]?.email_address || "",
                    name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim(),
                    image: data?.image_url || null,
                },
            });
        }
    }
);
export const syncUserDeletion = inngest.createFunction(
    { id: "delete-user-from-clerk" },
    { event: "clerk/user.deleted" },
    async ({ event }) => {
        const { data } = event;

        const listings = await prisma.listing.findMany({ where: { ownerId: data.id } });
        const chats = await prisma.chat.findMany({ where: { OR:[{ownerUserId: data.id},{chatUserId: data.id}] } });
        const transactions = await prisma.transaction.findMany({ where: { userId: data.id } });

        if(transactions.length ===0 && chats.length ===0 && transactions.length === 0) {
            await prisma.user.delete({ where: { id: data.id } });
        }else{
            await prisma.listing.updateMany(
                {
                    where: {
                        ownerId: data.id,
                    },
                    data:{
                        status:"inactive"
                    }
                }
            )
        }
    }
);

export const syncUserUpdation = inngest.createFunction(
    { id: "update-user-from-clerk" },
    { event: "clerk/user.updated" },
    async ({ event }) => {
        const { data } = event;

        // Check if user already exists
        const user = await prisma.user.findUnique({ where: { id: data.id } });

        if (user) {
            // Create new user
            await prisma.user.update({
                where: {
                    id: data.id,
                },
                data: {
                    email: data?.email_addresses?.[0]?.email_address || "",
                    name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim(),
                    image: data?.image_url || null,
                },
            });
        }
    }
);

export const sendPurchaseEmail = inngest.createFunction(
    { id: 'send-purchase-email' },
    { event: 'app/purchase' },
    async ({ event }) => {
        const { transaction } = event.data;

        // Fetch customer (buyer)
        const customer = await prisma.user.findFirst({
            where: { id: transaction.userId },
        });

        // Fetch listing
        const listing = await prisma.listing.findFirst({
            where: { id: transaction.listingId },
        });

        // Fetch credentials related to the listing
        const credential = await prisma.credential.findFirst({
            where: { listingId: transaction.listingId },
        });

        if (!customer || !listing || !credential) {
            throw new Error('Required purchase data not found');
        }

        await sendEmail({
            to: customer.email,
            subject: 'Your Credentials for the Account You Purchased',
            html: `
        <h2>
          Thank you for purchasing account @${listing.username} on ${listing.platform}
        </h2>

        <p>
          Your purchase was successful. Below are the credentials for the account you purchased:
        </p>

        <h3>Account Credentials</h3>
        <div>
          ${credential.updatedCredential.map((cred)=>`<p>${cred.name} : ${cred.value} </p>`).join('')}
        </div>
        <p>
          If you have any questions, please contact us at
          <a href="mailto:support@example.com">support@example.com</a>.
        </p>
        <p>
          Best regards,<br />
          The Support Team
        </p>
      `,
        });
    }
);

export const sendNewCredentials = inngest.createFunction(
    { id: 'send-new-credentials' },
    { event: 'app/listing-deleted' },
    async ({ event }) => {
        const { listingId } = event.data;

        // Fetch listing with owner
        const listing = await prisma.listing.findFirst({
            where: { id: listingId },
            include: { owner: true },
        });

        if (!listing) return;

        // Fetch newly generated credentials
        const newCredential = await prisma.credential.findFirst({
            where: { listingId },
        });

        if (!newCredential) return;

        await sendEmail({
            to: listing.owner.email,
            subject: 'New Credentials for Your Deleted Listing',
            html: `
        <h2>Your Listing Has Been Successfully Removed</h2>

        <p>
          Your listing <strong>@${listing.username}</strong> has been deleted.
          Below are your newly generated credentials.
        </p>

        <h3>New Credentials</h3>

        <ul>
          ${newCredential.updatedCredential
                .map(
                    (cred) => `
                <li>
                  <strong>${cred.label}:</strong> ${cred.value}
                </li>
              `
                )
                .join('')}
        </ul>
        <h3>Old Credentials</h3>

        <ul>
          ${newCredential.originalCredential
                .map(
                    (cred) => `
                <li>
                  <strong>${cred.label}:</strong> ${cred.value}
                </li>
              `
                )
                .join('')}
        </ul>

        <p>
          If you did not request this action or need assistance,
          please contact our support team immediately.
        </p>

        <p>— The ProfileMart Team</p>
      `,
        });
    }
);


export const functions = [syncUserDeletion, syncUserCreation, syncUserUpdation,sendPurchaseEmail,sendNewCredentials];
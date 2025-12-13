import  {Stripe} from 'stripe';
import prisma from "../configs/prisma.js";
import {inngest} from "../inngest/inngest.js";


export const stripeWebhook=async (req,res)=>{
    const stripeInstance=new Stripe(process.env.STRIPE_SECRET_KEY);
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    if (endpointSecret) {


        const signature = req.headers['stripe-signature'];

        try {
            event = Stripe.webhooks.constructEvent(
                req.body,          // raw body required
                signature,
                endpointSecret
            );
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return res.sendStatus(400);
        }


        try {
            switch (event.type) {
                case 'payment_intent.succeeded': {
                    const paymentIntent = event.data.object;

                    // Retrieve the associated Checkout session
                    const sessionList = await stripeInstance.checkout.sessions.list({
                        payment_intent: paymentIntent.id,
                        limit: 1,
                    });

                    const session = sessionList.data[0];

                    if (!session) {
                        console.warn('No checkout session found for payment intent:', paymentIntent.id);
                        break;
                    }

                    const { transactionId, appId } = session.metadata;
                    console.log(transactionId)

                    if (appId === 'profilemart' && transactionId) {

                        const transaction = await prisma.transaction.update({
                            where: { id: transactionId },
                            data: { isPaid: true },
                        });

                        await inngest.send({
                            name:'app/purchase',
                            data:{transaction}
                        })

                        // Mark the listing as sold
                        await prisma.listing.update({
                            where: { id: transaction.listingId },
                            data: { status: 'sold' },
                        });

                        // Increment the owner's earned balance
                        await prisma.user.update({
                            where: { id: transaction.ownerId },
                            data: { earned: { increment: transaction.amount } },
                        });

                        console.log(`Transaction ${transactionId} processed successfully.`);
                    }
                    break;
                }

                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }

            // Respond to Stripe to acknowledge receipt
            res.json({ received: true });
        } catch (err) {
            console.error('Error processing webhook event:', err);
            return res.sendStatus(400);
        }

    }
}
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
const nodemailer = require("nodemailer");

import { onDocumentCreated } from "firebase-functions/v2/firestore";
const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const stripe = require("stripe")("<STRIPE_PRIVATE_KEY>");
const corsWhitelist = ["<DOMAIN>"];

setGlobalOptions({ maxInstances: 10 });

interface FoodItemOrder {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: "<EMAIL>",
    pass: "<GOOGLE_APP_PASS>",
  },
});

exports.notifyNewItemAdded = onDocumentCreated("orders/{orderId}", (event) => {
  // Grab the current value of what was written to the Realtime Database.
  const snapshot = event.data;
  if (!snapshot) {
    console.log("No data associated with the event");
    return;
  }
  const data = snapshot.data();
  const items = JSON.stringify(data.items);
  // Define email options
  const mailOptions = {
    from: "<EMAIL>",
    to: "<EMAIL>",
    subject: "New Order Added",
    text: `A new menu item has been added: ${items}`,
  };

  // Send the email
  transporter.sendMail(mailOptions, (err: any, info: any) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Email sent!");
    }
  });

  return null;
});

exports.processPayment = onRequest(
  { cors: corsWhitelist },
  async (req: any, res: any) => {
    if (req.method === "OPTIONS") {
      // Set CORS headers for preflight request
      res.set("Access-Control-Allow-Origin", req.headers.origin);
      res.set("Access-Control-Allow-Methods", "POST");
      res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.status(204).json({ data: "preflight" });
      return;
    } else if (req.method === "POST") {
      const { token, cartItems } = req.body;
      try {
        // Calculate total amount from cart items
        const totalPrice = cartItems.reduce(
          (total: number, item: FoodItemOrder) =>
            total + item.quantity * item.price,
          0
        );

        // Create a charge using the Stripe API
        await stripe.charges.create({
          amount: totalPrice * 100, // Amount in cents
          currency: "usd",
          source: token,
          description: "Payment for your order",
        });

        // Handle success
        res.set("Access-Control-Allow-Origin", req.headers.origin);

        res.status(200).json({ message: "Payment successful" });
      } catch (error: any) {
        // Handle error
        res.status(500).json({ error: error.message });
      }
    } else {
      res.status(405).send("Method Not Allowed");
    }
  }
);

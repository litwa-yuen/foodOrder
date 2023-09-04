import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "./PaymentForm";
import "./PaymentScreen.css";

const stripePromise = loadStripe("<STRIPE_PUBLIC_KEY>");

const PaymentScreen: React.FC = () => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm />
    </Elements>
  );
};

export default PaymentScreen;

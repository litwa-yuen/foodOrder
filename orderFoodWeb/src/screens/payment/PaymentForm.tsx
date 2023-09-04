import React, { useState, useEffect } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { firebaseDB } from "../../firebase";
import { useDispatch, useSelector } from "react-redux";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { clearCart, getTotals } from "../../slices/CartSlice";

const PaymentForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [isCheckoutInProgress, setIsCheckoutInProgress] = useState(false);
  const [isCardComplete, setIsCardComplete] = useState(false);
  const navigate = useNavigate();
  const cart = useSelector((state: any) => state.cart);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getTotals());
  }, [cart, dispatch]);

  const handleSubmit = async (event: React.FormEvent) => {
    if (isCheckoutInProgress) {
      return;
    }
    setIsCheckoutInProgress(true);
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      return;
    }

    const { token, error } = await stripe.createToken(cardElement);

    if (error) {
      setError(error.message || "An error occurred");
    } else {
      // You can handle the token here (e.g., send it to your server)
      try {
        const response = await fetch(
          "https://<FIREBASE_DOMAIN>/processPayment",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: token.id,
              cartItems: cart.cartItems,
            }),
          }
        );

        const data = await response.json();

        // Handle the response from the server
        if (data.message === "Payment successful") {
          await addDoc(collection(firebaseDB, "orders"), {
            items: cart.cartItems,
            status: "queueing",
            createdDate: serverTimestamp(),
          });

          dispatch(clearCart());

          setIsCheckoutInProgress(false); // Reset checkout status
          alert("Checkout successful!");
          navigate("/");
        } else {
          setIsCheckoutInProgress(false); // Reset checkout status in case of an error
          alert("Payment error");
        }
      } catch (error) {
        console.error("An error occurred:", error);
        setIsCheckoutInProgress(false); // Reset checkout status in case of an error
      }
    }
  };
  return (
    <form onSubmit={handleSubmit} className="payment-form">
      {isCheckoutInProgress && (
        <div className="overlay">
          <div className="spinner">Loading...</div>
        </div>
      )}
      <div className="form-group">
        <label className="label">Card Details</label>
        <CardElement
          options={{ style: { base: { fontSize: "16px" } } }}
          className="card-element"
          onChange={(event) => setIsCardComplete(event.complete)}
        />
      </div>
      <div className="form-group">
        <div className="flex-container">
          <div className="subtotal">Subtotal: ${cart.cartTotalAmount}</div>
          <button
            type="submit"
            className={`pay-button ${
              isCheckoutInProgress || !isCardComplete ? "disabled" : ""
            }`}
            disabled={isCheckoutInProgress || !isCardComplete}
          >
            Pay
          </button>
        </div>
      </div>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default PaymentForm;

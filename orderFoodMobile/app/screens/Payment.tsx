import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { CardField, useStripe } from "@stripe/stripe-react-native";
import { useSelector, useDispatch } from "react-redux";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";
import { clearCart, getTotals } from "../CartReduser";
import { useNavigation } from "@react-navigation/native";

const Payment = () => {
  const stripe = useStripe();
  const [error, setError] = useState("");
  const [isCheckoutInProgress, setIsCheckoutInProgress] = useState(false);
  const [isCardComplete, setIsCardComplete] = useState(false);
  const firebaseDB = getFirestore();
  const cart = useSelector((state: any) => state.cart);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    dispatch(getTotals());
  }, [cart, dispatch]);

  const handlePayment = async () => {
    if (isCheckoutInProgress) {
      return;
    }

    setIsCheckoutInProgress(true);

    const { token, error } = await stripe.createToken({
      type: "Card",
    });

    if (error) {
      setError(error.message || "An error occurred");
    } else {
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
              cartItems: cart.cart,
            }),
          }
        );

        const data = await response.json();

        if (data.message === "Payment successful") {
          await addDoc(collection(firebaseDB, "orders"), {
            items: cart.cart,
            status: "queue",
            createdDate: serverTimestamp(),
          });

          dispatch(clearCart());

          setIsCheckoutInProgress(false);
          navigation.navigate("Menu");

          alert("Checkout successful!");
        } else {
          setIsCheckoutInProgress(false);
          alert("Payment error");
        }
      } catch (error) {
        console.error("An error occurred:", error);
        setIsCheckoutInProgress(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      {isCheckoutInProgress && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      )}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Card Details</Text>
        <CardField
          postalCodeEnabled={true}
          style={styles.cardElement}
          onCardChange={(cardDetails) =>
            setIsCardComplete(cardDetails.complete)
          }
        />
      </View>
      <View style={styles.formGroup}>
        <View style={styles.flexContainer}>
          <Text style={styles.subtotal}>Subtotal: ${cart.cartTotalAmount}</Text>
          <TouchableOpacity
            onPress={handlePayment}
            style={[
              styles.payButton,
              {
                backgroundColor:
                  isCheckoutInProgress || !isCardComplete ? "#ccc" : "#007BFF",
              },
            ]}
            disabled={isCheckoutInProgress || !isCardComplete}
          >
            <Text style={styles.payButtonText}>Pay</Text>
          </TouchableOpacity>
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardElement: {
    height: 50,
    marginVertical: 10,
  },
  flexContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subtotal: {
    fontSize: 18,
    fontWeight: "bold",
  },
  payButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  error: {
    color: "red",
    fontSize: 16,
    marginTop: 10,
  },
});

export default Payment;

import React, { useState, useEffect, useRef } from "react";
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
import PhoneInput from "react-native-phone-number-input";

const Payment = () => {
  const stripe = useStripe();
  const [error, setError] = useState("");
  const [isCheckoutInProgress, setIsCheckoutInProgress] = useState(false);
  const [isCardComplete, setIsCardComplete] = useState(false);
  const firebaseDB = getFirestore();
  const cart = useSelector((state: any) => state.cart);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [phoneNotification, setPhoneNotification] = useState(false); // New state for the checkbox
  const [phoneNumber, setPhoneNumber] = useState("");
  const phoneInput = useRef<PhoneInput>(null);
  const [formattedPhone, setFormattedPhone] = useState("");

  useEffect(() => {
    dispatch(getTotals());
  }, [cart, dispatch]);

  const isPayButtonDisable = () => {
    if (phoneNotification) {
      return (
        phoneInput.current?.isValidNumber(phoneNumber) ||
        isCheckoutInProgress ||
        !isCardComplete
      );
    } else {
      return isCheckoutInProgress || !isCardComplete;
    }
  };
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
          "https://us-central1-foodorder-1a94b.cloudfunctions.net/processPayment",
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
            status: "queueing",
            createdDate: serverTimestamp(),
            phoneNotification: phoneNotification,
            phone: formattedPhone,
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
      {/* Checkbox for phone notifications */}
      <View style={styles.formGroup}>
        <TouchableOpacity
          onPress={() => setPhoneNotification(!phoneNotification)}
          style={styles.checkboxContainer}
        >
          <View style={styles.checkbox}>
            {phoneNotification && <View style={styles.checked} />}
          </View>
          <Text style={styles.checkboxText}>
            Receive order status notifications by phone
          </Text>
        </TouchableOpacity>
      </View>
      {/* Phone number input */}
      {phoneNotification && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <PhoneInput
            ref={phoneInput}
            defaultValue={phoneNumber}
            defaultCode="US"
            layout="first"
            onChangeText={(text) => {
              setPhoneNumber(text);
            }}
            onChangeFormattedText={(text) => {
              setFormattedPhone(text);
            }}
            withDarkTheme
            withShadow
            autoFocus
          />
        </View>
      )}
      <View style={styles.formGroup}>
        <View style={styles.flexContainer}>
          <Text style={styles.subtotal}>Subtotal: ${cart.cartTotalAmount}</Text>
          <TouchableOpacity
            onPress={handlePayment}
            style={[
              styles.payButton,
              {
                backgroundColor: isPayButtonDisable() ? "#ccc" : "#007BFF",
              },
            ]}
            disabled={isPayButtonDisable()}
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxText: {
    fontSize: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#007BFF",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checked: {
    width: 12,
    height: 12,
    backgroundColor: "#007BFF",
    borderRadius: 2,
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
});

export default Payment;

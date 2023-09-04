import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import {
  getTotals,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
} from "../CartReduser"; // Import your actions and necessary dependencies
import { FoodItemOrder } from "../interface";
import { useNavigation } from "@react-navigation/native";

const Cart = () => {
  const cart = useSelector((state: any) => state.cart);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    dispatch(getTotals());
  }, [cart, dispatch]);

  const renderItem = (cartItem: any) => {
    const item: FoodItemOrder = cartItem.item;
    return (
      <View style={styles.cartItem}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>
            ${(item.quantity * item.price).toFixed(2)}
          </Text>
        </View>
        <View style={styles.itemActions}>
          <View style={styles.stepper}>
            <TouchableOpacity onPress={() => dispatch(decrementQuantity(item))}>
              <Text style={styles.stepperButton}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantity}>{item.quantity}</Text>
            <TouchableOpacity onPress={() => dispatch(incrementQuantity(item))}>
              <Text style={styles.stepperButton}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => dispatch(removeFromCart(item))}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    const checkoutButtonStyle =
      cart.cart.length === 0
        ? styles.checkoutButtonDisabled
        : styles.checkoutButton;

    return (
      <View style={styles.footer}>
        <Text style={styles.subtotalText}>
          Subtotal: ${cart.cartTotalAmount.toFixed(2)}
        </Text>
        <TouchableOpacity
          style={[checkoutButtonStyle]}
          onPress={() => navigation.navigate("Payment")}
          disabled={cart.cart.length === 0}
        >
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={cart.cart}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  stepperButton: {
    fontSize: 24,
    paddingHorizontal: 8,
    color: "#007bff",
  },
  quantity: {
    fontSize: 18,
    marginHorizontal: 8,
  },
  removeButton: {
    backgroundColor: "#ff0000",
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  footer: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subtotalText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  checkoutButton: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  checkoutButtonDisabled: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#ccc",
  },
  checkoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default Cart;

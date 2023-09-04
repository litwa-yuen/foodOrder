import { createSlice } from "@reduxjs/toolkit";
import { FoodItemOrder } from "./interface";

const initialState = {
  cart: [] as FoodItemOrder[], // Initialize cart as an empty array of FoodItemOrder
  // other properties
  cartTotalQuantity: 0,
  cartTotalAmount: 0,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state = initialState, action) => {
      const itemInCart = state.cart.find(
        (item: FoodItemOrder) => item.id == action.payload.id
      );
      if (itemInCart) {
        itemInCart.quantity++;
      } else {
        state.cart.push({ ...action.payload, quantity: 1 });
      }
    },
    removeFromCart: (state, action) => {
      const removeFromCart = state.cart.filter(
        (item: FoodItemOrder) => item.id !== action.payload.id
      );
      state.cart = removeFromCart;
    },
    incrementQuantity: (state, action) => {
      const itemInCart = state.cart.find(
        (item: FoodItemOrder) => item.id == action.payload.id
      );
      if (itemInCart) {
        itemInCart.quantity++;
      }
    },
    decrementQuantity: (state, action) => {
      const itemInCart = state.cart.find(
        (item: FoodItemOrder) => item.id == action.payload.id
      );
      if (itemInCart) {
        if (itemInCart.quantity == 1) {
          const removeFromCart = state.cart.filter(
            (item: FoodItemOrder) => item.id !== action.payload.id
          );
          state.cart = removeFromCart;
        } else {
          itemInCart.quantity--;
        }
      }
    },
    getTotals(state) {
      let { total, quantity } = state.cart.reduce(
        (cartTotal: any, cartItem: FoodItemOrder) => {
          const { price, quantity } = cartItem;
          const itemTotal = price * quantity;

          cartTotal.total += itemTotal;
          cartTotal.quantity += quantity;

          return cartTotal;
        },
        {
          total: 0,
          quantity: 0,
        }
      );
      total = parseFloat(total.toFixed(2));
      state.cartTotalQuantity = quantity;
      state.cartTotalAmount = total;
    },
    clearCart(state) {
      state.cart = [];
      state.cartTotalQuantity = 0;
      state.cartTotalAmount = 0;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  getTotals,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

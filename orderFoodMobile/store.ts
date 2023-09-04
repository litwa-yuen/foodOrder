import { configureStore } from "@reduxjs/toolkit";
import CartReducer from "./app/CartReduser";

export default configureStore({
  reducer: {
    cart: CartReducer,
  },
});

// CartPage.tsx
import "./CartScreen.css"; // Import your app.css stylesheet
import React, { useEffect } from "react";
import { FoodItemOrder } from "../../interface";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  decreaseCart,
  getTotals,
  removeFromCart,
} from "../../slices/CartSlice";

import { useNavigate } from "react-router-dom";

const CartScreen: React.FC = () => {
  const cart = useSelector((state: any) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getTotals());
  }, [cart, dispatch]);

  const handleCheckout = async () => {
    navigate("/payment");
  };

  const handleRemoveFromCart = (product: FoodItemOrder) => {
    dispatch(removeFromCart(product));
  };

  const handleQuantityChange = (item: FoodItemOrder, newQuantity: string) => {
    if (!isNaN(parseInt(newQuantity))) {
      const quantity = parseInt(newQuantity);
      if (quantity <= 0) {
        return;
      }
      if (quantity > item.quantity) {
        dispatch(addToCart(item));
      } else if (quantity < item.quantity) {
        dispatch(decreaseCart(item));
      }
    }
  };

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      <div className="cart">
        <ul>
          {cart.cartItems.map((item: FoodItemOrder) => (
            <li key={item.id}>
              <div className="cart-item">
                <span className="cart-item-name">{item.name}</span>
                <div className="cart-item-quantity">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item, e.target.value)}
                    min="1"
                  />
                </div>
                <span className="cart-item-price">
                  ${(item.quantity * item.price).toFixed(2)}
                </span>
                <button
                  className="remove-button"
                  onClick={() => handleRemoveFromCart(item)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="cart-summary">
          <span className="cart-summary-total">
            Subtotal: ${cart.cartTotalAmount}
          </span>
          <button
            className={`checkout-button ${
              cart.cartTotalQuantity === 0 ? "disabled" : ""
            }`}
            disabled={cart.cartTotalQuantity === 0}
            onClick={handleCheckout}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartScreen;

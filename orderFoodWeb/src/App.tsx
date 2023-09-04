import React from "react";
import { Link, Routes, Route } from "react-router-dom";
import FoodScreen from "./screens/foods/FoodScreen";
import CartScreen from "./screens/cart/CartScreen";
import PaymentScreen from "./screens/payment/PaymentScreen";
import "./App.css"; // Import your app.css stylesheet
import { useSelector } from "react-redux";
import OrderScreen from "./screens/orders/OrderScreen";

const App: React.FC = () => {
  const { cartTotalQuantity } = useSelector((state: any) => state.cart);

  return (
    <div>
      <nav className="navbar">
        <ul className="navbar-menu left">
          <li>
            <Link to="/" className="navbar-link">
              Menu
            </Link>
          </li>
        </ul>
        <ul className="navbar-menu right">
          <li>
            <Link to="/cart" className="navbar-link">
              Cart ({cartTotalQuantity})
            </Link>
          </li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<FoodScreen />} />
        <Route path="/cart" element={<CartScreen />} />
        <Route path="/payment" element={<PaymentScreen />} />
        <Route path="/orders" element={<OrderScreen />} />
      </Routes>
    </div>
  );
};

export default App;

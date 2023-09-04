import React, { useState, useEffect } from "react";
import { FoodItem } from "../../interface";
import { firebaseDB } from "../../firebase";
import { getDocs, collection } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, getTotals } from "../../slices/CartSlice";
import "./FoodScreen.css"; // Import your app.css stylesheet

const FoodScreen: React.FC = () => {
  const cart = useSelector((state: any) => state.cart);
  const dispatch = useDispatch();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]); // Sample food items with prices

  useEffect(() => {
    dispatch(getTotals());
    getItems();
  }, [cart, dispatch]);

  const handleAddToCart = (product: FoodItem) => {
    dispatch(addToCart(product));
  };

  const getItems = async () => {
    const itemSnapshot = await getDocs(collection(firebaseDB, "items"));
    const array: FoodItem[] = [];
    itemSnapshot.forEach((doc) => {
      const data = doc.data();

      // doc.data() is never undefined for query doc snapshots
      const item: FoodItem = {
        id: data.id, // Use the document ID as the item's ID
        name: data.name,
        price: data.price,
      };

      array.push(item);
    });
    array.sort((a: FoodItem, b: FoodItem) => {
      return parseInt(a.id) - parseInt(b.id);
    });
    setFoodItems(array);
  };

  return (
    <div className="app-main">
      <h1>Shop name</h1>

      <ul className="food-list">
        {foodItems.map((item, index) => (
          <li key={index} className="food-item">
            <div className="food-details">
              <h2 className="food-name">{item.name}</h2>
              <p className="food-description">description</p>
            </div>
            <div className="food-price-button">
              <span className="food-price">${item.price.toFixed(2)}</span>
              <button
                className="order-button"
                onClick={() => handleAddToCart(item)}
              >
                Add to Cart
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FoodScreen;

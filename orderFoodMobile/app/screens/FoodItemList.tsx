import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { FIREBASE_DB } from "../../firebaseConfig";
import { useDispatch, useSelector } from "react-redux";
import { getDocs, collection } from "firebase/firestore";
import { FoodItem } from "../interface";
import { getTotals, addToCart } from "../CartReduser";

const FoodItemList = () => {
  const cart = useSelector((state: any) => state.cart);

  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getTotals());
    getItems();
  }, [cart, dispatch]);

  const getItems = async () => {
    const itemSnapshot = await getDocs(collection(FIREBASE_DB, "items"));
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

  const handleAddToCart = (item: FoodItem) => {
    dispatch(addToCart(item));
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={foodItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={styles.itemDetails}>
              <View style={styles.rowContainer}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                <Text style={styles.itemPrice}></Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={() => handleAddToCart(item)}
            >
              <Text style={styles.addToCartButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  itemPrice: {
    alignItems: "center",
    fontSize: 16,
    color: "green",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Center vertically
  },
  priceContainer: {
    alignItems: "center", // Center horizontally
  },
  addToCartButton: {
    backgroundColor: "blue",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  addToCartButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default FoodItemList;

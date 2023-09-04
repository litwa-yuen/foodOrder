import { Timestamp } from "firebase/firestore";

export interface FoodItem {
  id: string;
  name: string;
  price: number;
}

export interface FoodItemOrder {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface HouseFoodOrder {
  orderId: string;
  items: FoodItemOrder[];
  status: string;
  createdDate: Timestamp;
}

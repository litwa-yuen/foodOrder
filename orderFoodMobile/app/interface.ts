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

export interface ShoppingState {
  availableFoods: FoodItemOrder[];
  //other models
}

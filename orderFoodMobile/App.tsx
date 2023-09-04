import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import FoodItemList from "./app/screens/FoodItemList";
import Cart from "./app/screens/Cart";
import Payment from "./app/screens/Payment";
import { TouchableOpacity, Text } from "react-native"; // Import TouchableOpacity and Text from react-native
import { Provider } from "react-redux";
import store from "./store";
import { StripeProvider } from "@stripe/stripe-react-native";
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <StripeProvider publishableKey="<STRIPE_PUBLIC_KEY>">
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="Menu"
              component={FoodItemList}
              options={({ navigation }) => ({
                headerRight: () => (
                  <TouchableOpacity
                    style={{ marginRight: 10 }}
                    onPress={() => navigation.navigate("Cart")}
                  >
                    <Text>Cart</Text>
                  </TouchableOpacity>
                ),
              })}
            />
            <Stack.Screen name="Cart" component={Cart} />
            <Stack.Screen name="Payment" component={Payment} />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>
    </StripeProvider>
  );
}

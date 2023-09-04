import React, { useEffect, useState } from "react";
import { firebaseAuth, GoogleAuth, firebaseDB } from "../../firebase";
import {
  getDocs,
  collection,
  Timestamp,
  doc,
  updateDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  DocumentData,
  startAfter,
} from "firebase/firestore";
import { signInWithPopup, signOut, User } from "firebase/auth";
import { HouseFoodOrder } from "../../interface";
import "./OrderScreen.css"; // Import your CSS file for styling
import InfiniteScroll from "react-infinite-scroll-component";

// Initialize Firebase (replace with your Firebase project config)

const OrderScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null); // State to track the user
  const [houseFoodOrder, setHouseFoodOrder] = useState<HouseFoodOrder[]>([]); // Sample food items with prices
  const statusFilter = ["processing", "queueing"]; // Status values to filter
  const [filter, setFilter] = useState("all"); // Default to showing all orders
  const [hasMore, setHasMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<DocumentData | null>(null); // Store the last visible document

  const queryRef = query(
    collection(firebaseDB, "orders"),
    where("status", "in", statusFilter)
  );

  const showOrdersByFilter = (filterValue: string) => {
    if (filter === filterValue) {
      return;
    }

    setHasMore(false);
    setLastVisible(null);
    setFilter(filterValue);

    let filterArray;

    switch (filterValue) {
      case "all":
        filterArray = statusFilter;
        break;
      case "aborted":
        filterArray = ["aborted"];
        break;
      case "completed":
        filterArray = ["completed"];
        break;
      default:
        filterArray = statusFilter; // Default to "all" if an invalid filter is provided
        break;
    }

    getOrders(filterArray);
  };

  const handleClick = () => {
    signInWithPopup(firebaseAuth, GoogleAuth)
      .then((result) => {
        // The signed-in user info.
        const user = result.user;
        setUser(user);
      })
      .catch((error) => {
        // Handle Errors here.
        alert(error.message);
      });
  };

  const formatDate = (timestamp: Timestamp) => {
    const formattedDate = new Date(timestamp.seconds * 1000);

    // Format the JavaScript Date as a local date and time
    return formattedDate.toLocaleString();
  };

  const handleSignOut = () => {
    signOut(firebaseAuth)
      .then(() => {
        // Sign-out successful.
      })
      .catch((error) => {
        // An error happened.
      });
  };

  const sortAndSetOrders = (orders: HouseFoodOrder[]) => {
    orders.sort((a: HouseFoodOrder, b: HouseFoodOrder) => {
      if (a.status === b.status) {
        return a.createdDate.toMillis() - b.createdDate.toMillis();
      } else {
        if (a.status < b.status) {
          return -1;
        } else if (a.status > b.status) {
          return 1;
        } else {
          return 0;
        }
      }
    });
    if (lastVisible) {
      setHouseFoodOrder((prevOrders) => {
        // Use the spread operator to combine the previous orders with the new orders
        const combinedOrders = [...prevOrders, ...orders];
        return combinedOrders;
      });
    } else {
      setHouseFoodOrder([...orders]); // Create a new array to trigger the state update
    }
  };
  const fetchMoreData = async () => {
    switch (filter) {
      case "all":
        getOrders(statusFilter);
        break;

      case "aborted":
        getOrders(["aborted"]);
        break;

      case "completed":
        getOrders(["completed"]);
        break;
    }
  };

  const getOrders = async (filter: string[]) => {
    let queryOrdersRef = query(
      collection(firebaseDB, "orders"),
      orderBy("status", "asc"),
      orderBy("createdDate", "asc"),
      where("status", "in", filter),
      limit(25)
    );

    if (lastVisible) {
      queryOrdersRef = query(
        collection(firebaseDB, "orders"),
        orderBy("status", "asc"),
        orderBy("createdDate", "asc"),
        where("status", "in", filter),
        startAfter(lastVisible),
        limit(25)
      );
    }
    // Execute the query
    const itemSnapshot = await getDocs(queryOrdersRef);
    const orders: HouseFoodOrder[] = [];
    itemSnapshot.forEach((doc) => {
      const data = doc.data();

      // doc.data() is never undefined for query doc snapshots
      const item: HouseFoodOrder = {
        orderId: doc.id,
        items: data.items,
        status: data.status,
        createdDate: data.createdDate,
      };

      orders.push(item);
    });
    sortAndSetOrders(orders);
    if (orders.length === 25) {
      setHasMore(true);
      setLastVisible(itemSnapshot.docs[itemSnapshot.docs.length - 1]);
    } else {
      setHasMore(false);
      setLastVisible(null);
    }
  };

  const updateOrderStatus = async (
    order: HouseFoodOrder,
    newStatus: string
  ) => {
    try {
      // Get a reference to the order document in Firestore
      const orderRef = doc(firebaseDB, "orders", order.orderId);

      // Update the status field of the order document
      await updateDoc(orderRef, {
        status: newStatus,
      });

      if (newStatus === "processing") {
        const updatedOrders = houseFoodOrder.map((o) => {
          if (o.orderId === order.orderId) {
            return { ...o, status: newStatus };
          }
          return o;
        });

        sortAndSetOrders(updatedOrders);
      } else {
        setHouseFoodOrder((prevOrders) =>
          prevOrders.filter((o) => o.orderId !== order.orderId)
        );
      }

      // After successfully updating the status, you can optionally perform additional actions or show a message.
      console.log(`Order status updated to "${newStatus}"`);

      // You might want to update the local state to reflect the change
      // For example, you can update houseFoodOrder if it's part of your local state.
    } catch (error) {
      console.error("Error updating order status:", error);
      // Handle the error, show a message, or perform any necessary actions.
    }
  };

  useEffect(() => {
    // Check if a user is already signed in when the component mounts
    const unsubscribe = firebaseAuth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser); // Set the user if already signed in
        getOrders(statusFilter);
      } else {
        setUser(null); // No user signed in
      }
    });

    // Initialize houseFoodOrder with any existing orders if available
    // For example, you could fetch the initial orders from Firebase here
    // and set them in the state.

    // Set up a real-time listener
    const unsubscribeFirestore = onSnapshot(queryRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          // A new order document was added
          const data = change.doc.data();

          // Create a new order item
          const newItem: HouseFoodOrder = {
            orderId: change.doc.id,
            items: data.items,
            status: data.status,
            createdDate: data.createdDate,
          };

          // Create a new array that combines existing orders and the new order
          setHouseFoodOrder((prevOrders) => {
            const combinedOrders = [...prevOrders, newItem];
            sortAndSetOrders(combinedOrders);
            return combinedOrders;
          });
        }
      });
    });

    // Clean up the listeners when the component unmounts
    return () => {
      unsubscribe();
      unsubscribeFirestore();
    };
  }, []);

  return (
    <div className="container">
      {user ? (
        <div className="signed-in">
          <button onClick={handleSignOut} className="sign-out-button">
            Sign Out
          </button>

          <h1>
            Orders
            <div className="filter-buttons">
              <button
                className={`filter-button ${filter === "all" ? "active" : ""}`}
                onClick={() => showOrdersByFilter("all")}
              >
                All Orders
              </button>
              <button
                className={`filter-button ${
                  filter === "aborted" ? "active" : ""
                }`}
                onClick={() => showOrdersByFilter("aborted")}
              >
                Aborted Orders
              </button>
              <button
                className={`filter-button ${
                  filter === "completed" ? "active" : ""
                }`}
                onClick={() => showOrdersByFilter("completed")}
              >
                Completed Orders
              </button>
            </div>
          </h1>
          <InfiniteScroll
            className="order-list"
            dataLength={houseFoodOrder.length}
            next={fetchMoreData}
            hasMore={hasMore}
            loader={<h4>Loading...</h4>}
          >
            {houseFoodOrder.map((order, index) => (
              <div key={index} className="order-item">
                <div className="order-details">
                  <div>
                    <p>Order Date: {formatDate(order.createdDate)}</p>
                    <p>Order ID: {order.orderId}</p>
                    <p>Status: {order.status}</p>
                  </div>
                  <ul className="item-list">
                    {order.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="item">
                        Item Name: {item.name}, Quantity: {item.quantity}
                      </li>
                    ))}
                  </ul>
                  <div className="action-buttons">
                    {order.status === "queueing" ? (
                      <div className="button-container">
                        <button
                          onClick={() => updateOrderStatus(order, "processing")}
                          className="process-button"
                        >
                          Process
                        </button>
                      </div>
                    ) : (
                      ""
                    )}
                    {order.status === "processing" ? (
                      <div className="button-container">
                        <button
                          onClick={() => updateOrderStatus(order, "completed")}
                          className="complete-button"
                        >
                          Complete
                        </button>
                      </div>
                    ) : (
                      ""
                    )}
                    {order.status === "queueing" ||
                    order.status === "processing" ? (
                      <div className="button-container">
                        <button
                          onClick={() => updateOrderStatus(order, "aborted")}
                          className="abort-button"
                        >
                          Abort
                        </button>
                      </div>
                    ) : (
                      ""
                    )}
                    <p></p>
                  </div>
                </div>
              </div>
            ))}
          </InfiniteScroll>
        </div>
      ) : (
        <div className="signed-out">
          <button onClick={handleClick} className="sign-in-button">
            SignIn With Google
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderScreen;

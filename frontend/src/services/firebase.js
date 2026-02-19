import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

// firebase config from .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ---- Items ----

// add a new item listing
export async function addItem(item) {
  const docRef = await addDoc(collection(db, "items"), {
    ...item,
    status: "available",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// get all available items (anyone can see these, no wallet needed)
export async function getItems() {
  const q = query(
    collection(db, "items"),
    where("status", "==", "available")
  );
  const snapshot = await getDocs(q);
  const items = [];
  snapshot.forEach((d) => {
    items.push({ id: d.id, ...d.data() });
  });
  return items;
}

// get ALL items (for admin / debug)
export async function getAllItems() {
  const snapshot = await getDocs(collection(db, "items"));
  const items = [];
  snapshot.forEach((d) => {
    items.push({ id: d.id, ...d.data() });
  });
  return items;
}

// get ALL items by seller (available + sold) so they can manage everything
export async function getItemsBySeller(sellerAddress) {
  const q = query(
    collection(db, "items"),
    where("sellerAddress", "==", sellerAddress)
  );
  const snapshot = await getDocs(q);
  const items = [];
  snapshot.forEach((d) => {
    items.push({ id: d.id, ...d.data() });
  });
  // sort: available first, then sold
  items.sort((a, b) => {
    if (a.status === "available" && b.status !== "available") return -1;
    if (a.status !== "available" && b.status === "available") return 1;
    return 0;
  });
  return items;
}

// get one item by its firestore doc id
export async function getItemById(itemId) {
  const docSnap = await getDoc(doc(db, "items", itemId));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

// update an item's status (available / sold)
export async function updateItemStatus(itemId, status) {
  const itemRef = doc(db, "items", itemId);
  await updateDoc(itemRef, { status });
}

// ---- Orders ----

// create a new order after purchase
export async function addOrder(order) {
  const docRef = await addDoc(collection(db, "orders"), {
    ...order,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// get all orders for a buyer
export async function getOrdersByBuyer(buyerAddress) {
  const q = query(
    collection(db, "orders"),
    where("buyerAddress", "==", buyerAddress)
  );
  const snapshot = await getDocs(q);
  const orders = [];
  snapshot.forEach((d) => {
    orders.push({ id: d.id, ...d.data() });
  });
  return orders;
}

// update order status (pending / paid / completed)
export async function updateOrderStatus(orderId, status) {
  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, { status });
}

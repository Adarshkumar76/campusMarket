import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./context/WalletContext";
import Navbar from "./components/Navbar";

// lazy load pages so the app loads faster
const ProductListing = lazy(() => import("./pages/ProductListing"));
const SellerDashboard = lazy(() => import("./pages/SellerDashboard"));
const BuyerCheckout = lazy(() => import("./pages/BuyerCheckout"));
const OrderStatus = lazy(() => import("./pages/OrderStatus"));

function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Navbar />
        <main className="container">
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <Routes>
              <Route path="/" element={<ProductListing />} />
              <Route path="/sell" element={<SellerDashboard />} />
              <Route path="/checkout/:itemId" element={<BuyerCheckout />} />
              <Route path="/orders" element={<OrderStatus />} />
            </Routes>
          </Suspense>
        </main>
      </BrowserRouter>
    </WalletProvider>
  );
}

export default App;

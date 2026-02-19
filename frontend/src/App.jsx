import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./context/WalletContext";
import Navbar from "./components/Navbar";
import ProductListing from "./pages/ProductListing";
import SellerDashboard from "./pages/SellerDashboard";
import BuyerCheckout from "./pages/BuyerCheckout";
import OrderStatus from "./pages/OrderStatus";

function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/" element={<ProductListing />} />
            <Route path="/sell" element={<SellerDashboard />} />
            <Route path="/checkout/:itemId" element={<BuyerCheckout />} />
            <Route path="/orders" element={<OrderStatus />} />
          </Routes>
        </main>
      </BrowserRouter>
    </WalletProvider>
  );
}

export default App;

import { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { getOrdersByBuyer } from "../services/firebase";

function OrderStatus() {
  const { address, connected, connectWallet } = useWallet();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) loadOrders();
  }, [address]);

  async function loadOrders() {
    try {
      const data = await getOrdersByBuyer(address);
      setOrders(data);
    } catch (err) {
      console.error("Error loading orders:", err);
    }
    setLoading(false);
  }

  if (!connected) {
    return (
      <div className="page">
        <h1>My Orders</h1>
        <div className="connect-prompt">
          <p>Connect your wallet to see your orders</p>
          <button onClick={connectWallet} className="btn btn-primary">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div className="page">
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>No orders yet. Go buy something from the marketplace!</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <strong>{order.itemTitle}</strong>
                <span className={`status-badge status-${order.status}`}>
                  {order.status}
                </span>
              </div>
              <div className="order-details">
                <p>
                  <span className="label">Price:</span> {order.price} ALGO
                </p>
                <p>
                  <span className="label">Seller:</span>{" "}
                  {order.sellerAddress?.slice(0, 8)}...
                  {order.sellerAddress?.slice(-4)}
                </p>
                <p>
                  <span className="label">Transaction:</span>{" "}
                  <a
                    href={`https://testnet.explorer.perawallet.app/tx/${order.txId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {order.txId?.slice(0, 16)}...
                  </a>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderStatus;

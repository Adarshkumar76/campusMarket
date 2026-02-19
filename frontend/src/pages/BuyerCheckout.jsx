import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { getItemById, updateItemStatus, addOrder } from "../services/firebase";
import { buyItem } from "../services/algorand";

function BuyerCheckout() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { address, connected, connectWallet, peraWallet } = useWallet();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [txId, setTxId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadItem();
  }, [itemId]);

  async function loadItem() {
    try {
      const data = await getItemById(itemId);
      setItem(data);
    } catch (err) {
      console.error("Error loading item:", err);
      setError("Could not load item details.");
    }
    setLoading(false);
  }

  async function handleBuy() {
    if (!connected) {
      await connectWallet();
      return;
    }

    setBuying(true);
    setError("");

    try {
      // send ALGO payment through pera wallet
      const transactionId = await buyItem(
        address,
        item.price,
        item.id,
        peraWallet
      );
      setTxId(transactionId);

      // mark item as sold in firebase
      await updateItemStatus(item.id, "sold");

      // save order record
      await addOrder({
        buyerAddress: address,
        sellerAddress: item.sellerAddress,
        itemId: item.id,
        itemTitle: item.title,
        price: item.price,
        txId: transactionId,
        status: "paid",
      });
    } catch (err) {
      console.error("Purchase failed:", err);
      if (err.message && err.message.includes("cancelled")) {
        setError("Transaction was cancelled.");
      } else {
        setError(
          "Purchase failed. Make sure you have enough ALGO and try again."
        );
      }
    }

    setBuying(false);
  }

  if (loading) return <div className="loading">Loading...</div>;
  if (!item)
    return (
      <div className="page">
        <p>Item not found.</p>
      </div>
    );

  // show success screen after purchase
  if (txId) {
    return (
      <div className="page">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2>Purchase Complete!</h2>
          <p>
            You bought <strong>{item.title}</strong> for {item.price} ALGO
          </p>
          <div className="tx-info">
            <label>Transaction ID:</label>
            <a
              href={`https://testnet.explorer.perawallet.app/tx/${txId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {txId.slice(0, 12)}...{txId.slice(-8)}
            </a>
          </div>
          <div className="success-actions">
            <button
              onClick={() => navigate("/")}
              className="btn btn-primary"
            >
              Back to Marketplace
            </button>
            <button
              onClick={() => navigate("/orders")}
              className="btn btn-secondary"
            >
              View Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Checkout</h1>

      <div className="checkout-layout">
        <div className="checkout-item">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="checkout-image"
          />
          <div className="checkout-details">
            <h2>{item.title}</h2>
            <p className="checkout-desc">{item.description}</p>
            <span className={`category-badge cat-${item.category}`}>
              {item.category}
            </span>
            <div className="checkout-price">{item.price} ALGO</div>
          </div>
        </div>

        <div className="checkout-action">
          {!connected ? (
            <div>
              <p>Connect your Algorand wallet to pay</p>
              <button onClick={connectWallet} className="btn btn-primary">
                Connect Wallet
              </button>
            </div>
          ) : (
            <div>
              <p className="wallet-info">
                Paying from: {address.slice(0, 6)}...{address.slice(-4)}
              </p>
              <button
                onClick={handleBuy}
                className="btn btn-primary btn-large"
                disabled={buying}
              >
                {buying ? "Processing..." : `Pay ${item.price} ALGO`}
              </button>
            </div>
          )}
          {error && <p className="error-msg">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default BuyerCheckout;

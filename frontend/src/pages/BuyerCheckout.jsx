import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { getItemById, updateItemStatus, addOrder, saveUserProfile, getUserProfile } from "../services/firebase";
import { buyItem, getBalance } from "../services/algorand";

function BuyerCheckout() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { address, connected, connectWallet, peraWallet } = useWallet();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [txId, setTxId] = useState(null);
  const [error, setError] = useState("");
  const [balance, setBalance] = useState(null);

  // buyer profile
  const [buyerName, setBuyerName] = useState("");
  const [buyerRoll, setBuyerRoll] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    loadItem();
  }, [itemId]);

  // fetch wallet balance whenever address changes
  useEffect(() => {
    if (address) {
      getBalance(address).then(setBalance);
      // load buyer profile
      getUserProfile(address).then((p) => {
        if (p) {
          setBuyerName(p.name || "");
          setBuyerRoll(p.rollNo || "");
          setBuyerPhone(p.phone || "");
        }
        setProfileLoaded(true);
      });
    } else {
      setBalance(null);
    }
  }, [address]);

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

    // require buyer name and roll
    if (!buyerName || !buyerRoll) {
      setError("Please enter your name and roll number below before buying.");
      setBuying(false);
      return;
    }

    // save buyer profile
    try {
      await saveUserProfile(address, { name: buyerName, rollNo: buyerRoll, phone: buyerPhone });
    } catch (_) { /* non-critical */ }

    // use item's seller address, or fall back to your wallet if missing
    const seller = item.sellerAddress || "BUDQTGGDE4JTLNIPXA2IW4VBRZ2M22VMG4LLPSPCB5RMTR2GBL36KZHICE";

    // check balance: price + 0.001 fee + 0.1 min balance the account must keep
    const FEE = 0.001;
    const MIN_BALANCE = 0.1;
    const needed = item.price + FEE + MIN_BALANCE;
    if (balance !== null && balance < needed) {
      setError(
        `Not enough ALGO. You need ~${needed.toFixed(3)} ALGO (${item.price} price + ${FEE} fee + ${MIN_BALANCE} min balance) but you only have ${balance.toFixed(3)} ALGO. Get testnet ALGO from the faucet.`
      );
      setBuying(false);
      return;
    }

    try {
      // send ALGO payment to the item's seller
      const transactionId = await buyItem(
        address,
        seller,
        item.price,
        item.id,
        peraWallet
      );
      setTxId(transactionId);

      // mark item as sold in firebase
      await updateItemStatus(item.id, "sold");

      // save order record with buyer contact info
      await addOrder({
        buyerAddress: address,
        buyerName,
        buyerRoll,
        buyerPhone,
        sellerAddress: seller,
        sellerName: item.sellerName || "",
        sellerRoll: item.sellerRoll || "",
        sellerPhone: item.sellerPhone || "",
        pickupLocation: item.pickupLocation || "",
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
      } else if (err.message && err.message.includes("Seller address")) {
        setError("This listing is missing a seller address. Contact the seller.");
      } else if (err.message && err.message.includes("overspend")) {
        setError(
          `Not enough ALGO. You need ~${(item.price + 0.101).toFixed(3)} ALGO (price + fee + min balance). Get free testnet ALGO from the faucet.`
        );
      } else {
        setError(
          "Purchase failed: " + (err.message || "Make sure you have enough ALGO and try again.")
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

          {/* Blockchain Details */}
          <div className="chain-details">
            <h3>Blockchain Receipt</h3>
            <div className="chain-row">
              <span className="label">Transaction ID:</span>
              <a
                href={`https://testnet.explorer.perawallet.app/tx/${txId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="chain-link"
              >
                {txId.slice(0, 16)}...{txId.slice(-6)}
              </a>
            </div>
            <div className="chain-row">
              <span className="label">Network:</span>
              <span>Algorand Testnet</span>
            </div>
            <div className="chain-row">
              <span className="label">From (you):</span>
              <span className="mono-text">{address.slice(0, 8)}...{address.slice(-4)}</span>
            </div>
            <div className="chain-row">
              <span className="label">To (seller):</span>
              <span className="mono-text">{item.sellerAddress?.slice(0, 8)}...{item.sellerAddress?.slice(-4)}</span>
            </div>
            <div className="chain-row">
              <span className="label">Amount:</span>
              <span>{item.price} ALGO</span>
            </div>
          </div>

          {/* Seller Contact for Pickup */}
          {(item.sellerName || item.pickupLocation) && (
            <div className="contact-card">
              <h3>Seller Contact — Pickup Info</h3>
              {item.sellerName && (
                <p><span className="label">Name:</span> {item.sellerName}</p>
              )}
              {item.sellerRoll && (
                <p><span className="label">Roll No:</span> {item.sellerRoll}</p>
              )}
              {item.sellerPhone && (
                <p><span className="label">Phone:</span> {item.sellerPhone}</p>
              )}
              {item.pickupLocation && (
                <p><span className="label">Pickup:</span> {item.pickupLocation}</p>
              )}
            </div>
          )}

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
              {balance !== null && (
                <p className="wallet-info" style={{ marginTop: 4 }}>
                  Balance: <strong>{balance.toFixed(3)} ALGO</strong>
                  {balance < item.price + 0.101 && (
                    <span style={{ color: "#e74c3c", marginLeft: 8 }}>
                      (need ~{(item.price + 0.101).toFixed(3)} ALGO)
                    </span>
                  )}
                </p>
              )}

              {/* Buyer Info for the seller */}
              <div className="buyer-info-form">
                <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "0.5rem" }}>
                  Your info — seller needs this for delivery/pickup
                </p>
                <div className="form-group">
                  <input
                    type="text" value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Your Name *"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text" value={buyerRoll}
                    onChange={(e) => setBuyerRoll(e.target.value)}
                    placeholder="Roll Number *"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text" value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="Phone / WhatsApp (optional)"
                  />
                </div>
              </div>

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

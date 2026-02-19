import { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import {
  addItem,
  getItemsBySeller,
  updateItemStatus,
  saveUserProfile,
  getUserProfile,
  getOrdersBySeller,
} from "../services/firebase";
import ImageUpload from "../components/ImageUpload";

function SellerDashboard() {
  const { address, connected, connectWallet } = useWallet();
  const [myItems, setMyItems] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Profile state
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("books");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (address) {
      loadMyItems();
      loadMyOrders();
      loadProfile();
    }
  }, [address]);

  async function loadProfile() {
    try {
      const profile = await getUserProfile(address);
      if (profile) {
        setName(profile.name || "");
        setRollNo(profile.rollNo || "");
        setPhone(profile.phone || "");
        setPickupLocation(profile.pickupLocation || "");
        setProfileSaved(true);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  }

  async function loadMyItems() {
    setLoading(true);
    try {
      const items = await getItemsBySeller(address);
      setMyItems(items);
    } catch (err) {
      console.error("Error loading your items:", err);
    }
    setLoading(false);
  }

  async function loadMyOrders() {
    try {
      const orders = await getOrdersBySeller(address);
      setMyOrders(orders);
    } catch (err) {
      console.error("Error loading seller orders:", err);
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    if (!name || !rollNo) {
      alert("Please fill in at least your name and roll number.");
      return;
    }
    try {
      await saveUserProfile(address, { name, rollNo, phone, pickupLocation });
      setProfileSaved(true);
      alert("Profile saved!");
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Could not save profile.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name || !rollNo) {
      alert("Please save your profile (name & roll number) before listing items.");
      return;
    }

    if (!title || !price || !imageUrl) {
      alert("Please fill in the title, price, and upload an image.");
      return;
    }

    setSubmitting(true);
    try {
      await addItem({
        title,
        description,
        price: parseFloat(price),
        category,
        imageUrl,
        sellerAddress: address,
        sellerName: name,
        sellerRoll: rollNo,
        sellerPhone: phone,
        pickupLocation,
      });

      // clear the form
      setTitle("");
      setDescription("");
      setPrice("");
      setCategory("books");
      setImageUrl("");

      // refresh the list
      await loadMyItems();
      alert("Item listed successfully!");
    } catch (err) {
      console.error("Error listing item:", err);
      alert("Failed to list item. Check console for details.");
    }
    setSubmitting(false);
  }

  async function handleMarkSold(itemId) {
    try {
      await updateItemStatus(itemId, "sold");
      await loadMyItems();
    } catch (err) {
      console.error("Error marking item as sold:", err);
    }
  }

  async function handleRelist(itemId) {
    try {
      await updateItemStatus(itemId, "available");
      await loadMyItems();
    } catch (err) {
      console.error("Error relisting item:", err);
    }
  }

  // if wallet not connected, show connect prompt
  if (!connected) {
    return (
      <div className="page">
        <h1>Seller Dashboard</h1>
        <div className="connect-prompt">
          <p>Connect your Algorand wallet to manage your listings</p>
          <button onClick={connectWallet} className="btn btn-primary">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Seller Dashboard</h1>
      <p className="wallet-info">
        Connected: {address.slice(0, 6)}...{address.slice(-4)}
      </p>

      {/* Profile Section */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2>{profileSaved ? "Your Profile" : "Setup Your Profile"}</h2>
        <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: "1rem" }}>
          Buyers will see this info after purchase so they can pick up the item.
        </p>
        <form onSubmit={handleSaveProfile}>
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="form-group">
              <label>Roll Number *</label>
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder="e.g. 22BCS001"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contact number"
              />
            </div>
            <div className="form-group">
              <label>Pickup Location</label>
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="e.g. Hostel A, Room 204"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-secondary">
            {profileSaved ? "Update Profile" : "Save Profile"}
          </button>
        </form>
      </div>

      <div className="dashboard-grid">
        {/* left side - add new listing */}
        <div className="card">
          <h2>Add New Listing</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What are you selling?"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your item..."
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price (ALGO)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="books">Books</option>
                  <option value="electronics">Electronics</option>
                  <option value="furniture">Furniture</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Image</label>
              <ImageUpload onUpload={(url) => setImageUrl(url)} />
              {imageUrl && (
                <img src={imageUrl} alt="preview" className="image-preview" />
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !profileSaved}
            >
              {submitting ? "Listing..." : "List Item"}
            </button>
            {!profileSaved && (
              <p style={{ color: "#e67700", fontSize: "0.8rem", marginTop: "0.5rem" }}>
                Save your profile above first
              </p>
            )}
          </form>
        </div>

        {/* right side - my listings */}
        <div className="card">
          <h2>My Listings</h2>
          {loading ? (
            <p>Loading...</p>
          ) : myItems.length === 0 ? (
            <p className="empty-text">You haven't listed anything yet</p>
          ) : (
            <div className="my-items">
              {myItems.map((item) => (
                <div key={item.id} className="my-item-row">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="thumb"
                  />
                  <div className="my-item-info">
                    <strong>{item.title}</strong>
                    <span>{item.price} ALGO</span>
                  </div>
                  <span className={`status-badge status-${item.status}`}>
                    {item.status}
                  </span>
                  {item.status === "available" && (
                    <button
                      onClick={() => handleMarkSold(item.id)}
                      className="btn btn-small"
                    >
                      Mark Sold
                    </button>
                  )}
                  {item.status === "sold" && (
                    <button
                      onClick={() => handleRelist(item.id)}
                      className="btn btn-small btn-secondary"
                    >
                      Relist
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Incoming orders / buyer info */}
          {myOrders.length > 0 && (
            <>
              <h2 style={{ marginTop: "1.5rem" }}>Incoming Orders</h2>
              <p style={{ color: "#888", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
                People who bought your items
              </p>
              <div className="my-items">
                {myOrders.map((order) => (
                  <div key={order.id} className="order-card" style={{ padding: "0.75rem" }}>
                    <div className="order-header">
                      <strong>{order.itemTitle}</strong>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="order-details">
                      <p><span className="label">Price:</span> {order.price} ALGO</p>
                      {order.buyerName && (
                        <p><span className="label">Buyer:</span> {order.buyerName} ({order.buyerRoll})</p>
                      )}
                      {order.buyerPhone && (
                        <p><span className="label">Phone:</span> {order.buyerPhone}</p>
                      )}
                      <p>
                        <span className="label">Buyer Wallet:</span>{" "}
                        <span className="mono-text">
                          {order.buyerAddress?.slice(0, 8)}...{order.buyerAddress?.slice(-4)}
                        </span>
                      </p>
                      <p>
                        <span className="label">Tx:</span>{" "}
                        <a
                          href={`https://testnet.explorer.perawallet.app/tx/${order.txId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="chain-link"
                        >
                          {order.txId?.slice(0, 12)}...
                        </a>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SellerDashboard;

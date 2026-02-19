import { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import {
  addItem,
  getItemsBySeller,
  updateItemStatus,
} from "../services/firebase";
import ImageUpload from "../components/ImageUpload";

function SellerDashboard() {
  const { address, connected, connectWallet } = useWallet();
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("books");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (address) loadMyItems();
  }, [address]);

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

  async function handleSubmit(e) {
    e.preventDefault();

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
              disabled={submitting}
            >
              {submitting ? "Listing..." : "List Item"}
            </button>
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
        </div>
      </div>
    </div>
  );
}

export default SellerDashboard;

import { useState, useEffect } from "react";
import { getItems } from "../services/firebase";
import ItemCard from "../components/ItemCard";

function ProductListing() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      const data = await getItems();
      setItems(data);
    } catch (err) {
      console.error("Failed to load items:", err);
    } finally {
      setLoading(false);
    }
  }

  // filter items based on what the user typed and selected
  const filtered = items.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      category === "all" || item.category === category;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="loading">Loading items...</div>;

  return (
    <div className="page">
      <h1>Campus Marketplace</h1>
      <p className="subtitle">Buy and sell stuff on campus using ALGO</p>

      <div className="filters">
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="category-select"
        >
          <option value="all">All Categories</option>
          <option value="books">Books</option>
          <option value="electronics">Electronics</option>
          <option value="furniture">Furniture</option>
          <option value="other">Other</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>
            {items.length === 0
              ? "No items listed yet. Be the first to sell something!"
              : "No items match your search. Try something else."}
          </p>
        </div>
      ) : (
        <div className="items-grid">
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductListing;

import { useState, useEffect, useCallback } from "react";
import { getItems, getCachedItems } from "../services/firebase";
import ItemCard from "../components/ItemCard";

function ProductListing() {
  // show cached items instantly while fresh data loads
  const cached = getCachedItems("cached_items");
  const [items, setItems] = useState(cached || []);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(!cached);

  const loadItems = useCallback(async () => {
    try {
      const data = await getItems();
      setItems(data);
    } catch (err) {
      console.error("Failed to load items:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // load items on mount and refresh every 30 seconds
  useEffect(() => {
    loadItems();
    const interval = setInterval(loadItems, 30000);
    return () => clearInterval(interval);
  }, [loadItems]);

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

      <button
        onClick={() => { setLoading(true); loadItems(); }}
        className="btn btn-secondary"
        style={{ marginTop: "1.5rem" }}
      >
        Refresh Items
      </button>
    </div>
  );
}

export default ProductListing;

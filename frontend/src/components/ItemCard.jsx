import { useNavigate } from "react-router-dom";

function ItemCard({ item }) {
  const navigate = useNavigate();

  return (
    <div className="item-card">
      <div className="item-image-wrapper">
        <img src={item.imageUrl} alt={item.title} className="item-image" />
        <span className={`category-badge cat-${item.category}`}>
          {item.category}
        </span>
      </div>
      <div className="item-info">
        <h3>{item.title}</h3>
        <p className="item-desc">{item.description}</p>
        <div className="item-seller">
          Seller: {item.sellerAddress?.slice(0, 4)}...{item.sellerAddress?.slice(-4)}
        </div>
        <div className="item-footer">
          <span className="item-price">{item.price} ALGO</span>
          <button
            onClick={() => navigate(`/checkout/${item.id}`)}
            className="btn btn-primary btn-small"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default ItemCard;

import { Link } from "react-router-dom";
import { useWallet } from "../context/WalletContext";

function Navbar() {
  const { address, connected, connectWallet, disconnectWallet } = useWallet();

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        🏪 Campus Market
      </Link>

      <div className="nav-links">
        <Link to="/">Browse</Link>
        <Link to="/sell">Sell</Link>
        <Link to="/orders">Orders</Link>
      </div>

      <div className="nav-wallet">
        {connected ? (
          <div className="wallet-connected">
            <span className="wallet-addr">
              {address.slice(0, 4)}...{address.slice(-4)}
            </span>
            <button
              onClick={disconnectWallet}
              className="btn btn-small btn-outline"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className="btn btn-small btn-primary"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

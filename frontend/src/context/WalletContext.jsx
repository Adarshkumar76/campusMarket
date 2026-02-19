import { createContext, useContext, useState, useEffect } from "react";
import { PeraWalletConnect } from "@perawallet/connect";

const WalletContext = createContext(null);

// one pera wallet instance for the whole app
const peraWallet = new PeraWalletConnect();

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);

  // try to reconnect if user was connected before
  useEffect(() => {
    peraWallet
      .reconnectSession()
      .then((accounts) => {
        if (accounts.length) {
          setAddress(accounts[0]);
        }
      })
      .catch(() => {
        // no previous session, that's fine
      });
  }, []);

  async function connectWallet() {
    try {
      const accounts = await peraWallet.connect();
      setAddress(accounts[0]);
      return accounts[0];
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      throw err;
    }
  }

  function disconnectWallet() {
    peraWallet.disconnect();
    setAddress(null);
  }

  const value = {
    address,
    connected: !!address,
    connectWallet,
    disconnectWallet,
    peraWallet, // pass this to algorand.js for signing
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}

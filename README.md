# Campus Marketplace with Crypto Payments

A peer-to-peer marketplace where students on campus can buy and sell items (books, electronics, furniture) and pay using **ALGO** on the **Algorand blockchain**.

Built for the **RIFT 2026 Hackathon** — Web3 / Blockchain Track powered by Algorand.

---

## Live Demo

> **URL:** https://campus-market-one.vercel.app/

---

## Demo Video

> **LinkedIn Post:**  LinkedIn video url

---

## Smart Contract

> **App ID (Testnet):** 
>
> **Explorer:** https://testnet.explorer.perawallet.app/application/YOUR_APP_ID

---

## Problem Statement

Build a peer-to-peer marketplace where students can buy and sell items using ALGO or stablecoins. The platform includes product listings, search functionality, and integrated crypto checkout.

---

## Tech Stack

| Layer            | Technology                          |
|------------------|-------------------------------------|
| Frontend         | React (Vite)                        |
| Styling          | Plain CSS                           |
| Blockchain       | Algorand Testnet                    |
| Smart Contract   | Algorand Python (Puya / algopy)     |
| Wallet           | Pera Wallet (@perawallet/connect)   |
| SDK              | algosdk (JavaScript)                |
| Database         | Firebase Firestore                  |
| Image Upload     | Cloudinary                          |
| Hosting          | Vercel                              |

---

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   React App  │──── │  Firebase         │     │  Algorand        │
│   (Vite)     │     │  Firestore        │     │  Testnet         │
│              │     │  (items, orders)  │     │                  │
│  - Browse    │     └──────────────────┘     │  - Smart Contract│
│  - Sell      │                               │  - ALGO Payments │
│  - Checkout  │──────────────────────────────│                  │
│  - Orders    │     ┌──────────────────┐     └──────────────────┘
│              │──── │  Cloudinary       │
└──────────────┘     │  (image uploads)  │
                     └──────────────────┘
```

**Flow:**
1. Seller connects Pera Wallet and lists an item (data saved to Firestore, image to Cloudinary)
2. Buyer browses items, picks one, connects wallet
3. Buyer confirms purchase → ALGO payment sent on Algorand Testnet → transaction confirmed
4. Order recorded in Firestore with the on-chain transaction ID
5. Both buyer and seller can track order status

---

## Features

- Product listing page with search and category filters
- Seller dashboard to add/manage listings
- Image upload via Cloudinary
- Buyer checkout with Pera Wallet integration
- ALGO payment on Algorand Testnet
- Order tracking with on-chain transaction links
- Responsive design (works on mobile)

---

## How to Run Locally

### Prerequisites

- Node.js 18+
- A Pera Wallet (set to Testnet) with test ALGO from the [faucet](https://bank.testnet.algorand.network)
- Firebase project with Firestore enabled
- Cloudinary account (free tier)

### Setup

```bash
# clone the repo
git clone https://github.com/YOUR_USERNAME/campus-marketplace.git
cd campus-marketplace

# go to frontend
cd frontend

# install dependencies
npm install

# create .env file with your config (see .env.example below)
cp .env.example .env

# start the dev server
npm run dev
```

Open http://localhost:5173 in your browser.

### Environment Variables (.env)

```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset

VITE_ALGORAND_APP_ID=0
VITE_SELLER_ADDRESS=YOUR_ALGORAND_WALLET_ADDRESS
```

---

## Smart Contract (Algorand Python)

Located in `smart_contracts/marketplace/contract.py`.

To compile and deploy (requires AlgoKit):

```bash
pip install algokit
algokit localnet start          # test locally
algokit project run build       # compile
algokit deploy testnet          # deploy to testnet
```

---

## Screenshots

> _[Add screenshots of the main pages here]_

---

## Known Limitations

- Smart contract is simplified for the hackathon (no escrow, single seller)
- No user authentication — wallet address is the identity
- Images are stored on Cloudinary (not IPFS)
- Order status is updated manually, not via on-chain events

---

## Team

| Name    | Role                        |
|---------|-----------------------------|
| _Name_  | _Frontend / Smart Contract_ |
| _Name_  | _Backend / Design_          |

---

## References

- [Algorand Developer Docs](https://developer.algorand.org)
- [AlgoKit Documentation](https://developer.algorand.org/algokit/)
- [Testnet Faucet](https://bank.testnet.algorand.network)
- [Testnet Explorer](https://testnet.explorer.perawallet.app)
- [Firebase Docs](https://firebase.google.com/docs)
- [Cloudinary Docs](https://cloudinary.com/documentation)

# Campus Marketplace — Crypto Payments on Algorand

> **RIFT 2026 Hackathon | PS4 — Web3 / Blockchain Track powered by Algorand**

A peer-to-peer campus marketplace where students buy and sell items (books, electronics, furniture) and pay with **ALGO** on the **Algorand blockchain**. Transactions are instant, transparent, and verifiable on-chain. Buyer and seller profiles (name, roll no., phone, pickup location) are exchanged after purchase so items can be picked up in person.

---

## Problem Statement

**PS4 — Algorand Web3 Track:**  
Build a peer-to-peer marketplace where students can buy and sell items using ALGO or stablecoins. The platform includes product listings, search functionality, and integrated crypto checkout.

---

## Live Demo

**https://campus-market-one.vercel.app/**

---

## Demo Video

**LinkedIn:** _[Add your LinkedIn video URL here]_

---

## Smart Contract — App ID (Testnet)

| Field | Value |
|-------|-------|
| **App ID** | _Not yet deployed — see note below_ |
| **Explorer** | `https://testnet.explorer.perawallet.app/application/<APP_ID>` |
| **Contract** | [`smart_contracts/marketplace/contract.py`](smart_contracts/marketplace/contract.py) |
| **Language** | Algorand Python (Puya / algopy) |

> **Where to find your App ID:**  
> When you deploy the smart contract to testnet using AlgoKit, the deploy command prints the App ID in the terminal output. You can also find it in the [Pera Testnet Explorer](https://testnet.explorer.perawallet.app/) by searching your deployer wallet address → "Created Apps" tab. The App ID is a number like `123456789`. Currently our marketplace uses direct ALGO payment transactions (no app call needed), so the contract is written but not deployed yet. You can deploy it with:
> ```bash
> cd smart_contracts
> algokit project run build
> algokit deploy testnet
> ```  
> The App ID will appear in the output. Update this README once deployed.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        USER (Browser)                            │
│                                                                  │
│  ┌────────────┐   ┌────────────────┐   ┌──────────────────────┐ │
│  │ React App  │   │  Pera Wallet   │   │  Algorand Testnet    │ │
│  │ (Vite)     │◄─►│  Extension     │◄─►│  (AlgoNode RPC)      │ │
│  └─────┬──────┘   └────────────────┘   └──────────┬───────────┘ │
│        │                                           │             │
│        │  items, orders,                           │  ALGO       │
│        │  profiles                                 │  payment    │
│        ▼                                           ▼             │
│  ┌─────────────┐                        ┌──────────────────────┐ │
│  │  Firebase   │                        │  Smart Contract      │ │
│  │  Firestore  │                        │  (Algorand Python)   │ │
│  │  + cache    │                        │  marketplace.py      │ │
│  └─────────────┘                        └──────────────────────┘ │
│        │                                                         │
│        │  images                                                 │
│        ▼                                                         │
│  ┌─────────────┐                                                 │
│  │ Cloudinary  │                                                 │
│  │ (CDN)       │                                                 │
│  └─────────────┘                                                 │
└──────────────────────────────────────────────────────────────────┘
```

**How it works:**

1. **Seller** connects Pera Wallet → fills profile (name, roll, phone, pickup location) → lists item with price, image, description
2. Item data → Firebase Firestore. Image → Cloudinary CDN.
3. **Buyer** browses items, picks one, connects wallet, enters their contact info
4. Buyer clicks "Pay" → Pera Wallet signs an ALGO payment transaction → sent to Algorand Testnet → confirmed on-chain
5. Order saved to Firestore with **on-chain transaction ID**, buyer + seller contact info
6. Buyer sees **blockchain receipt** (tx ID, wallets, amount) + **seller pickup info**
7. Seller sees **incoming orders** with buyer name, roll, phone so they can arrange handoff

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | **React 18** + **Vite** | Single-page app, code-split lazy loading |
| Styling | Plain CSS | Responsive, no framework overhead |
| Blockchain | **Algorand Testnet** | ALGO payment transactions |
| Smart Contract | **Algorand Python (Puya / algopy)** | On-chain marketplace logic |
| Wallet | **Pera Wallet** (`@perawallet/connect`) | Transaction signing |
| SDK | **algosdk v3** | Build & send Algorand transactions |
| Database | **Firebase Firestore** | Items, orders, user profiles (with offline cache) |
| Images | **Cloudinary** | Upload & CDN for product photos |
| Hosting | **Vercel** | Auto-deploy from GitHub |
| RPC Node | **AlgoNode** (free) | Algorand testnet API — no API key needed |

---

## Installation & Setup

### Prerequisites

- **Node.js 18+**
- **Pera Wallet** mobile app (set to Testnet) — [Download](https://perawallet.app/)
- **Test ALGO** from the faucet: https://bank.testnet.algorand.network
- **Firebase** project with Firestore enabled
- **Cloudinary** account (free tier) with an **unsigned** upload preset

### Clone & Install

```bash
git clone https://github.com/Adarshkumar76/campusMarket.git
cd campusMarket/frontend
npm install
```

### Configure Environment

Create `frontend/.env`:

```env
# Firebase
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset

# Algorand (optional — used in smart contract deploy)
VITE_ALGORAND_APP_ID=0
```

### Run Locally

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

### Build for Production

```bash
npm run build    # outputs to frontend/dist/
npm run preview  # preview production build locally
```

---

## Usage Guide

### 1. Connect Wallet
Open the app → click **Connect Wallet** → approve in Pera Wallet.

### 2. Sell an Item
Go to **Sell** tab → fill in your profile (name, roll no., phone, pickup location) → add item title, price (in ALGO), description, image → click **List Item**.

### 3. Browse & Buy
Go to **Browse** tab → search or filter by category → click **Buy Now** → enter your name and roll number → click **Pay X ALGO** → approve transaction in Pera Wallet.

### 4. After Purchase
- **Buyer** sees a blockchain receipt (Tx ID, wallets, amount) + seller's contact info for pickup.
- **Seller** sees an incoming order with buyer's name, roll, phone on their dashboard.

### 5. Track Orders
Go to **Orders** tab to see all your past purchases with blockchain transaction links.

### Screenshots

> _Add screenshots of: Browse page, Checkout page, Blockchain receipt, Seller dashboard_

---

## Known Limitations

- Smart contract is written but not yet deployed to testnet (marketplace currently uses direct ALGO payment transactions, which are fully on-chain)
- No escrow — payment goes directly from buyer to seller wallet
- No user authentication beyond wallet address
- Images stored on Cloudinary, not IPFS/on-chain
- Only supports ALGO payments (no ASA stablecoin support yet)
- Minimum balance requirement: accounts must keep 0.1 ALGO, so buying a 1 ALGO item requires ~1.101 ALGO

---

## Team Members

| Name | Role |
|------|------|
| **Adarsh Kumar** | Full-Stack Developer — Frontend, Smart Contract, Blockchain Integration |
| _Add teammate_ | _Role_ |

---

## References

- [Algorand Developer Docs](https://developer.algorand.org)
- [AlgoKit Documentation](https://developer.algorand.org/algokit/)
- [algosdk v3 Migration Guide](https://github.com/algorand/js-algorand-sdk)
- [Pera Wallet Connect](https://github.com/perawallet/connect)
- [Testnet Faucet](https://bank.testnet.algorand.network)
- [Testnet Explorer](https://testnet.explorer.perawallet.app)
- [Firebase Firestore Docs](https://firebase.google.com/docs/firestore)
- [Cloudinary Docs](https://cloudinary.com/documentation)

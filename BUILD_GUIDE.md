# Campus Marketplace with Crypto Payments
# Build Guide for RIFT 2026 Hackathon

This is your step by step guide to build the Campus Marketplace project. Read each
step fully before doing it. Every step builds on the previous one, so follow the
order. This project is for the RIFT 2026 Web3 / Blockchain track powered by Algorand.


---


## What You Are Building

A peer to peer marketplace where students on a campus can list items like books,
electronics, and furniture, and buyers can pay using ALGO or stablecoins. The entire
payment flow runs on the Algorand blockchain.


---


## Before You Start

Make sure you have these installed on your machine.

- Node.js version 18 or higher
- Python version 3.10 or higher
- Git
- AlgoKit (the Algorand official development toolkit)
- A code editor like VS Code

If you do not have AlgoKit, install it by running:

```
pip install algokit
```

Then confirm it works:

```
algokit --version
```

If you do not have Node.js, download it from nodejs.org and install it.


---


## Step 1 - Set Up the Project Folder

Open your terminal and create a folder for the project.

```
mkdir campus-marketplace
cd campus-marketplace
```

Now start a new AlgoKit project inside this folder. AlgoKit will ask you a few
questions. Choose the smart contract template when it asks.

```
algokit init
```

This creates the base folder structure for your Algorand smart contract.


---


## Step 2 - Set Up the Algorand Testnet Wallet

You need a wallet on the Algorand Testnet to deploy contracts and test payments.

1. Go to https://bank.testnet.algorand.network and create a test wallet, or use
   the Pera Wallet app on your phone and switch it to Testnet mode.
2. Copy your wallet address.
3. Go to https://bank.testnet.algorand.network and paste your address to get free
   test ALGO coins. This is called using the faucet.
4. Save your wallet mnemonic phrase somewhere safe. You will need it later.


---


## Step 3 - Write the Smart Contract

Inside the AlgoKit project, find the smart contract file. It will be in a folder
called contracts or similar.

Your smart contract needs to do the following things:

- Let a seller list an item with a price
- Let a buyer pay the exact price in ALGO
- Release the payment to the seller when payment is confirmed
- Mark the order as complete

Here is a simple starting point using PyTEAL style with Beaker. Open your contract
file and write this:

```python
from beaker import Application, GlobalStateValue
from beaker.lib.storage import BoxMapping
from pyteal import *

app = Application("CampusMarketplace")

# Global state to store the owner
owner = GlobalStateValue(stack_type=TealType.bytes, default=Global.creator_address())

@app.external
def list_item(price: abi.Uint64, item_id: abi.Uint64) -> Expr:
    # Seller calls this to register an item with a price
    return Seq(
        Assert(Txn.sender() == owner.get()),
        App.globalPut(Itob(item_id.get()), price.get()),
        Approve()
    )

@app.external
def buy_item(item_id: abi.Uint64) -> Expr:
    # Buyer calls this and attaches an ALGO payment
    price = App.globalGet(Itob(item_id.get()))
    return Seq(
        Assert(Gtxn[1].type_enum() == TxnType.Payment),
        Assert(Gtxn[1].amount() == price),
        Assert(Gtxn[1].receiver() == owner.get()),
        Approve()
    )
```

This is a starting point. You can expand it to track order status, multiple sellers,
or escrow logic as you build further.


---


## Step 4 - Test the Smart Contract Locally

AlgoKit gives you a local Algorand sandbox so you can test without spending real
ALGO. Start the local sandbox:

```
algokit localnet start
```

Then run your contract tests. AlgoKit projects include a tests folder. Write a simple
test that deploys your contract and calls list_item and buy_item.

Run the tests:

```
algokit project run test
```

Fix any errors before moving to the next step.


---


## Step 5 - Deploy to Testnet

Once your local tests pass, deploy the smart contract to the Algorand Testnet.

```
algokit deploy testnet
```

After deployment, you will see an App ID printed in the terminal. Save this App ID.
You will need to submit it as part of the hackathon requirements.

Also save the Testnet explorer link:
https://testnet.explorer.perawallet.app/application/YOUR_APP_ID


---


## Step 6 - Set Up the Frontend

Now build the part of the app that users see and interact with.

Inside your project folder, create a new React app:

```
npx create-react-app frontend
cd frontend
```

Install the Algorand SDK so the frontend can talk to the blockchain:

```
npm install algosdk
npm install @txnlab/use-wallet-react
```

The use-wallet library makes connecting to Pera Wallet and other Algorand wallets
very easy.


---


## Step 7 - Build the Main Pages

Your app needs four main pages. Build them one at a time.


### Page 1 - Product Listing Page

Show all items available for sale. Each item card shows:
- Item name
- Image
- Price in ALGO
- A Buy button

Store the item data in a Firebase database or a simple Node.js backend. The item
price and ID must match what is on the smart contract.


### Page 2 - Seller Dashboard

A page where a seller can:
- Connect their wallet
- Add a new listing with a name, image, and price
- See their existing listings
- Mark items as sold

When a seller adds a listing, call the list_item function on the smart contract
using the Algorand SDK.


### Page 3 - Buyer Checkout

When a buyer clicks Buy on an item:
1. Ask them to connect their Algorand wallet
2. Show the item details and price
3. Let them confirm the purchase
4. Send a grouped transaction that calls the buy_item function and sends the ALGO
   payment at the same time

Show a success message when the transaction is confirmed.


### Page 4 - Order Status Page

Show the buyer a simple status for their order:
- Pending (payment sent, waiting for confirmation)
- Paid (payment confirmed on chain)
- Completed (seller has marked it as delivered)

You can store order status in Firebase and update it when the blockchain confirms
the transaction.


---


## Step 8 - Connect the Frontend to the Smart Contract

In your React app, use the Algorand SDK to interact with the deployed contract.
Create a file called algorand.js in your src folder:

```javascript
import algosdk from "algosdk";

const algodClient = new algosdk.Algodv2(
  "",
  "https://testnet-api.algonode.cloud",
  ""
);

export async function buyItem(senderAddress, appId, itemId, price, signer) {
  const params = await algodClient.getTransactionParams().do();

  const appCall = algosdk.makeApplicationCallTxnFromObject({
    from: senderAddress,
    appIndex: appId,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    appArgs: [
      algosdk.encodeUint64(itemId),
    ],
    suggestedParams: params,
  });

  const payment = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: senderAddress,
    to: "SELLER_WALLET_ADDRESS",
    amount: price * 1_000_000,
    suggestedParams: params,
  });

  const grouped = algosdk.assignGroupID([appCall, payment]);
  const signed = await signer(grouped);
  const result = await algodClient.sendRawTransaction(signed).do();
  return result;
}
```

Call this function from your Buyer Checkout page when the user clicks confirm.


---


## Step 9 - Set Up the Backend

You need a simple backend to store item listings and order data. Firebase is the
easiest option for a hackathon.

1. Go to https://console.firebase.google.com and create a new project.
2. Enable Firestore Database.
3. Install Firebase in your frontend:

```
npm install firebase
```

4. Create a firebase.js file and connect it with your project keys.

Store each item as a document in Firestore with these fields:
- title
- description
- price (in ALGO)
- imageUrl
- sellerAddress
- itemId (match this with the smart contract ID)
- status (available, sold)

Store each order with these fields:
- buyerAddress
- sellerAddress
- itemId
- txId (the Algorand transaction ID)
- status (pending, paid, completed)


---


## Step 10 - Add Image Storage

For item images, use Cloudinary or Firebase Storage. Both have free tiers.

With Firebase Storage:
1. Enable Storage in your Firebase project.
2. Let the seller upload an image when creating a listing.
3. Save the image URL in Firestore with the listing.

Display the image URL in the product listing cards.


---


## Step 11 - Add Search and Filter

On the product listing page, add a search bar and filter options.

- Search by item name
- Filter by price range
- Filter by category (books, electronics, furniture)

You can do this using simple JavaScript array filter on the data you fetch from
Firestore.

```javascript
const filtered = items.filter(item =>
  item.title.toLowerCase().includes(searchText.toLowerCase())
);
```


---


## Step 12 - Host the Frontend

Your app needs a live public URL for the hackathon submission.

The easiest way is to deploy on Vercel.

1. Push your code to a public GitHub repository.
2. Go to https://vercel.com and sign in with GitHub.
3. Import your repository.
4. Set any environment variables like Firebase keys.
5. Click Deploy.

Vercel gives you a free public URL like https://your-app.vercel.app.


---


## Step 13 - Prepare the README

Your GitHub repository must have a README.md file. Include all of these sections:

- Project title and description
- Problem statement from the RIFT list
- Live demo URL (the Vercel link)
- LinkedIn demo video URL
- App ID on Testnet and the explorer link
- Architecture overview showing how the frontend talks to the smart contract
- Tech stack: AlgoKit, Beaker, React, Firebase, Algorand SDK
- How to install and run the project locally
- Screenshots of the main pages
- Any known limitations
- Team members and what each person worked on


---


## Step 14 - Record the Demo Video

Record a 2 to 3 minute video that shows the following:

1. A seller adding a new item listing
2. A buyer finding the item and connecting a wallet
3. The buyer completing a payment using ALGO on Testnet
4. The order status updating after the transaction is confirmed
5. A quick look at the smart contract App ID on the Testnet explorer

Post the video on LinkedIn. Make it public. Tag the RIFT LinkedIn page:
https://www.linkedin.com/company/rift-pwioi/

Save the LinkedIn post URL for the README and the submission form.


---


## Step 15 - Submit the Project

Before submitting, confirm you have all of the following ready:

- Problem statement selected on the RIFT website during the selection window
  (19 February 2026, 6:00 PM to 8:00 PM)
- GitHub repository set to public with all code pushed
- Live URL working and accessible
- App ID from Testnet deployment
- Demo video posted publicly on LinkedIn, tagging the RIFT page
- README with all required sections filled in

Submit through the RIFT website before the deadline.


---


## Quick Reference

| What                 | Where                                            |
|----------------------|--------------------------------------------------|
| Algorand Docs        | https://developer.algorand.org                  |
| AlgoKit Docs         | https://developer.algorand.org/algokit/         |
| Testnet Faucet       | https://bank.testnet.algorand.network           |
| Testnet Explorer     | https://testnet.explorer.perawallet.app         |
| Firebase Console     | https://console.firebase.google.com             |
| Vercel Hosting       | https://vercel.com                              |
| RIFT LinkedIn        | https://www.linkedin.com/company/rift-pwioi/   |


---


## Common Problems and Fixes

Problem: AlgoKit init fails
Fix: Make sure Python 3.10 or higher is installed and pip is up to date.

Problem: Testnet deployment fails
Fix: Make sure your wallet has enough test ALGO. Visit the faucet again.

Problem: Transaction gets rejected
Fix: Make sure the grouped transaction has the app call as the first transaction
and the payment as the second. The order matters.

Problem: Wallet connection does not work in browser
Fix: Install the Pera Wallet browser extension. Make sure the network is set
to Testnet in the wallet settings.

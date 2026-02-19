import algosdk from "algosdk";

// connect to algorand testnet (algonode is free, no api key)
const algodClient = new algosdk.Algodv2(
  "",
  "https://testnet-api.algonode.cloud",
  ""
);

const SELLER_ADDRESS = import.meta.env.VITE_SELLER_ADDRESS;

/**
 * Buy an item by sending ALGO payment to the seller.
 * If a smart contract app id is set, it builds a grouped txn (app call + payment).
 * Otherwise it just does a simple payment for demo.
 */
export async function buyItem(senderAddress, priceInAlgo, itemId, peraWallet) {
  const suggestedParams = await algodClient.getTransactionParams().do();

  // convert algo to microalgo (1 ALGO = 1,000,000 microALGO)
  const amount = Math.round(priceInAlgo * 1_000_000);

  // build a payment transaction
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: senderAddress,
    to: SELLER_ADDRESS,
    amount: amount,
    note: new TextEncoder().encode(`CampusMarket:buy:${itemId}`),
    suggestedParams,
  });

  // sign with pera wallet
  const signedTxns = await peraWallet.signTransaction([[{ txn }]]);

  // send to the network (algosdk v3 uses 'txid' not 'txId')
  const response = await algodClient.sendRawTransaction(signedTxns).do();
  const txId = response.txid || response.txId;

  // wait for the transaction to be confirmed (max 4 rounds)
  await algosdk.waitForConfirmation(algodClient, txId, 4);

  return txId;
}

/**
 * Check how much ALGO an address has
 */
export async function getBalance(address) {
  try {
    const info = await algodClient.accountInformation(address).do();
    return info.amount / 1_000_000;
  } catch (err) {
    console.log("Could not fetch balance:", err);
    return 0;
  }
}

import algosdk from "algosdk";

// connect to algorand testnet (algonode is free, no api key)
const algodClient = new algosdk.Algodv2(
  "",
  "https://testnet-api.algonode.cloud",
  ""
);

/**
 * Buy an item by sending ALGO payment to the seller.
 * sellerAddress comes from the item listing in Firestore.
 */
export async function buyItem(senderAddress, sellerAddress, priceInAlgo, itemId, peraWallet) {
  if (!senderAddress) throw new Error("Buyer wallet not connected");
  if (!sellerAddress) throw new Error("Seller address is missing from this listing");

  const suggestedParams = await algodClient.getTransactionParams().do();

  // convert algo to microalgo (1 ALGO = 1,000,000 microALGO)
  const amount = Math.round(priceInAlgo * 1_000_000);

  // build a payment transaction (algosdk v3: uses sender/receiver, not from/to)
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: senderAddress,
    receiver: sellerAddress,
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
    // v3 returns amount as BigInt
    return Number(info.amount) / 1_000_000;
  } catch (err) {
    console.log("Could not fetch balance:", err);
    return 0;
  }
}

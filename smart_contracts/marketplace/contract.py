"""
Campus Marketplace - Algorand Smart Contract
RIFT 2026 Hackathon - Web3 / Blockchain Track

Simple marketplace: seller lists items, buyers pay in ALGO.
Built with Algorand Python (algopy / Puya).

How to use:
  1. Install AlgoKit: pip install algokit
  2. Start local sandbox: algokit localnet start
  3. Compile: algokit project run build
  4. Deploy to testnet: algokit deploy testnet
"""

import algopy
from algopy import (
    ARC4Contract,
    Global,
    Txn,
    UInt64,
    arc4,
    gtxn,
    op,
)


class CampusMarketplace(ARC4Contract):
    """
    Marketplace contract.
    - The deployer is the seller
    - Seller lists items with prices (in microALGO)
    - Buyer pays ALGO to purchase items
    - Payment goes directly to the seller
    """

    def __init__(self) -> None:
        # how many items have been listed so far
        self.item_count = UInt64(0)

    @arc4.abimethod(create="require")
    def create(self) -> None:
        """Called once when the app is first created."""
        self.item_count = UInt64(0)

    @arc4.abimethod()
    def list_item(self, price: arc4.UInt64) -> arc4.UInt64:
        """
        List a new item for sale.
        Only the seller (contract creator) can call this.
        Price is in microALGO (1 ALGO = 1,000,000 microALGO).
        Returns the assigned item_id.
        """
        # only seller can list
        assert Txn.sender == Global.creator_address, "only seller can list"
        assert price.native > 0, "price must be > 0"

        # bump item counter
        self.item_count += 1

        # store the price in global state
        # key = 8-byte encoding of item_id, value = price
        op.app_global_put(op.itob(self.item_count), price.native)

        return arc4.UInt64(self.item_count)

    @arc4.abimethod()
    def buy_item(
        self,
        item_id: arc4.UInt64,
        pay_txn: gtxn.PaymentTransaction,
    ) -> None:
        """
        Buy an item. Must be called in an atomic group with a payment txn.
        The payment amount must match the listed price.
        The payment receiver must be the seller (creator).
        """
        # look up the price
        price = op.app_global_get(op.itob(item_id.native))
        assert price > 0, "item not available"

        # verify the payment
        assert pay_txn.receiver == Global.creator_address, "pay the seller"
        assert pay_txn.amount == price, "wrong payment amount"

        # mark as sold (set price to 0)
        op.app_global_put(op.itob(item_id.native), UInt64(0))

    @arc4.abimethod(readonly=True)
    def get_price(self, item_id: arc4.UInt64) -> arc4.UInt64:
        """Get the price of an item. Returns 0 if sold or not listed."""
        price = op.app_global_get(op.itob(item_id.native))
        return arc4.UInt64(price)

    @arc4.abimethod(readonly=True)
    def get_item_count(self) -> arc4.UInt64:
        """How many items have been listed total."""
        return arc4.UInt64(self.item_count)

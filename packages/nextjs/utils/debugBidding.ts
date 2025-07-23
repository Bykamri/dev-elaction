/**
 * Utility untuk debugging masalah bidding pada auction
 */
import { formatEther, parseEther } from "viem";

export const debugBidding = {
  /**
   * Log detail allowance dan bid amount untuk debugging
   */
  logBiddingDetails: (
    bidAmount: string,
    allowance: bigint,
    highestBid: bigint,
    startingBid: bigint,
    endTime: number,
    auctionAddress: string,
    userAddress: string | undefined,
  ) => {
    console.group("🔍 Debugging Bidding Details");
    console.log("📍 Auction Address:", auctionAddress);
    console.log("👤 User Address:", userAddress);
    console.log("💰 Bid Amount (input):", bidAmount, "ETH");
    console.log("💰 Bid Amount (wei):", parseEther(bidAmount).toString());
    console.log("✅ Current Allowance:", formatEther(allowance), "ETH");
    console.log("🏆 Highest Bid:", formatEther(highestBid), "ETH");
    console.log("🚀 Starting Bid:", formatEther(startingBid), "ETH");
    console.log("⏰ End Time:", new Date(endTime * 1000).toLocaleString());
    console.log("⏳ Is Expired:", Date.now() / 1000 > endTime);

    // Validations
    const bidWei = parseEther(bidAmount);
    console.group("🧪 Validations");
    console.log("✅ Bid > Highest:", bidWei > highestBid ? "✅ PASS" : "❌ FAIL");
    console.log("✅ Bid >= Starting:", bidWei >= startingBid ? "✅ PASS" : "❌ FAIL");
    console.log("✅ Allowance >= Bid:", allowance >= bidWei ? "✅ PASS" : "❌ FAIL");
    console.log("✅ Auction Active:", Date.now() / 1000 < endTime ? "✅ PASS" : "❌ FAIL");
    console.groupEnd();

    console.groupEnd();
  },

  /**
   * Log error details untuk transaksi yang gagal
   */
  logTransactionError: (error: any, type: "approval" | "bid") => {
    console.group(`❌ ${type.toUpperCase()} Transaction Error`);
    console.error("Error object:", error);

    if (error?.message) {
      console.error("Error message:", error.message);
    }

    if (error?.reason) {
      console.error("Error reason:", error.reason);
    }

    if (error?.code) {
      console.error("Error code:", error.code);
    }

    // Common error interpretations
    if (error?.message?.includes("insufficient allowance")) {
      console.warn("💡 Suggestion: Allowance tidak mencukupi, coba approve amount yang lebih besar");
    }

    if (error?.message?.includes("Bid must be higher")) {
      console.warn("💡 Suggestion: Tawaran harus lebih tinggi dari tawaran tertinggi saat ini");
    }

    if (error?.message?.includes("Auction is not active")) {
      console.warn("💡 Suggestion: Lelang sudah berakhir atau belum dimulai");
    }

    if (error?.message?.includes("IDRX transfer failed")) {
      console.warn("💡 Suggestion: Transfer ETH gagal, periksa balance dan allowance");
    }

    // MetaMask specific errors
    if (error?.code === -32603 || error?.message?.includes("Internal JSON-RPC error")) {
      console.warn("💡 MetaMask RPC Error Detected:");
      console.warn("   - Coba refresh halaman dan reconnect wallet");
      console.warn("   - Pastikan network RPC endpoint stabil");
      console.warn("   - Check gas settings di MetaMask");
      console.warn("   - Coba clear pending transactions di MetaMask");
    }

    if (error?.code === -32000) {
      console.warn("💡 Suggestion: Insufficient funds for gas atau pending transaction");
    }

    if (error?.code === 4001) {
      console.warn("💡 Suggestion: User rejected transaction");
    }

    console.groupEnd();
  },
};

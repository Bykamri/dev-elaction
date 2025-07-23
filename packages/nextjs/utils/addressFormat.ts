export const shortenAddress = (address: string): string => {
  if (!address || address.length < 10) {
    return "";
  }
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
};

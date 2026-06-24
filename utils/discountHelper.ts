export const calculateTotal = (
  price: number,
  discountPercentage: number,
): number => {
  if (price < 0 || discountPercentage < 0 || discountPercentage > 100) {
    return 0;
  }

  const discountAmount = (price * discountPercentage) / 100;
  return price - discountAmount;
};

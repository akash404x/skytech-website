import type { CartItem, Product } from './types';

export const CART_STORAGE_KEY = 'skytech_cart_v1';

// Helper function to extract image URL from either string or object format
export function getProductImageUrl(product: Product): string {
  const firstImage = product.images[0];
  if (!firstImage) return '';
  if (typeof firstImage === 'string') {
    return firstImage;
  }
  return (firstImage as { url: string }).url ?? '';
}

export function getProductPrice(product: Product) {
  return product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price
    ? product.discountPrice
    : product.price;
}

export function getCartItemPrice(item: CartItem) {
  return item.discountPrice && item.discountPrice > 0 && item.discountPrice < item.price
    ? item.discountPrice
    : item.price;
}

export function getCartSubtotal(items: CartItem[]) {
  return items.reduce((total, item) => total + getCartItemPrice(item) * item.quantity, 0);
}

export function productToCartItem(product: Product, quantity = 1): CartItem {
  return {
    productId: product.id,
    name: product.name,
    category: product.category,
    image: getProductImageUrl(product),
    price: product.price,
    discountPrice: product.discountPrice,
    stock: product.stock,
    quantity,
  };
}

export function sanitizeCartItems(items: CartItem[]) {
  return items
    .filter((item) => item.productId && item.quantity > 0)
    .map((item) => ({
      ...item,
      quantity: Math.max(1, Math.min(item.quantity, Math.max(item.stock, 1))),
    }));
}

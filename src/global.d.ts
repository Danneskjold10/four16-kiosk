// Global type definitions for your application
import type { MenuItem, CartItem } from '$lib/types';

interface Window {
    addToCartDirectly: (item: MenuItem) => void;
    showItemAddedToast: (itemName: string) => void;
    addItemToCart: (item: CartItem) => boolean;
}
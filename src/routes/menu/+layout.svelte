<script lang="ts">
    import type { CartItem } from "$lib/types";

    let { children } = $props();
    
    // Cart state
    let cartItems = $state<CartItem[]>([]);
    
    // Listen for addToCart events from any component
    $effect.root(() => {
        const handleAddToCart = (event: CustomEvent) => {
            // Add the item to the cart
            const item = event.detail.item;
            cartItems = [...cartItems, item];
            
            // Optionally show a toast or notification
            // ...
        };
        
        document.addEventListener('addToCart', handleAddToCart as EventListener);
        
        return () => {
            document.removeEventListener('addToCart', handleAddToCart as EventListener);
        };
    });
    
    // Helper functions
    function getItemCount(items: CartItem[]): number {
        return items.reduce((count: number, item: CartItem) => count + (item.quantity || 1), 0);
    }
    
    function getTotal(items: CartItem[]): string {
        return items.reduce((sum: number, item: CartItem) => {
            // Use totalPrice if available (for customized items), otherwise use the base price
            const itemPrice = item.totalPrice || item.price;
            return sum + (itemPrice * (item.quantity || 1));
        }, 0).toFixed(2);
    }
    
    function goToCheckout() {
        if (cartItems.length > 0) {
            // Store cart in localStorage or a store for the checkout page
            window.location.href = '/checkout';
        }
    }
</script>

<div class="flex flex-col w-full h-full">
    <div class="flex-1 overflow-auto">
        {@render children()}
    </div>
    
    <!-- Fixed Cart Overview at Bottom -->
    <div class="bg-base-300 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.2)] p-4">
        <div class="container mx-auto flex justify-between items-center">
            <div class="flex-1">
                <div class="flex items-center">
                    <span class="mr-2 font-bold">Items:</span>
                    <span class="badge badge-primary badge-lg" id="cart-item-count">{getItemCount(cartItems)}</span>
                    <span class="mx-4 font-bold">Total:</span>
                    <span class="text-xl font-bold" id="cart-total-price">$ {getTotal(cartItems)}</span>
                </div>
            </div>
            
            <button 
                class="relative overflow-hidden group px-8 py-4 h-auto min-h-16 border-4 border-success rounded-full {cartItems.length === 0 ? 'opacity-70 cursor-not-allowed bg-gray-500 text-white' : 'bg-success text-success-content hover:bg-success-focus'}" 
                onclick={goToCheckout}
                disabled={cartItems.length === 0}
            >
                <!-- Button content -->
                <div class="relative z-10 flex items-center justify-center font-bold tracking-wide text-lg">
                    <span>Proceed to Checkout</span>
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        class="h-6 w-6 ml-3" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                    >
                        <path 
                            fill-rule="evenodd" 
                            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
                            clip-rule="evenodd" 
                        />
                    </svg>
                </div>
            </button>
        </div>
    </div>
</div>
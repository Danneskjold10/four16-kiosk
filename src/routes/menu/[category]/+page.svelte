<script lang="ts">
import { goto } from "$app/navigation";
    import { menuItems, promoSlides } from "$lib/items";
    import { page } from "$app/stores";
    import type { MenuItem, MenuCategory, CartItem } from "$lib/types";
    import type { MenuItemProps, DietaryFilterProps, EditableOrderItemProps, CustomizationModalProps, PromoSlide } from "$lib/dtype";
    
    let { data } = $props();
    
    // Access the current category from URL params
    const currentCategoryName = $page.params.category;
    
    // State variables
    let diningOption = $state<string>("");
    let cartItems = $state<CartItem[]>([]);
    let isOrderSummaryOpen = $state(false);
    let showCustomizationModal = $state(false);
    let editingItem = $state<CartItem | null>(null);
    let hasActiveFilters = $state(false);
    let currentSlide = $state(0);
    let isArrowAnimating = $state(false);
    let slideInterval = $state<number | null>(null);
    
    // Initialize dining option from localStorage in client-side only
    $effect.root(() => {
        if (typeof window !== 'undefined') {
            diningOption = localStorage.getItem("diningOption") || "eat_in";
        }
    });
    // Computed properties for active category
    let activeMenuCategory = $state<MenuCategory | undefined>(undefined);
    let filteredMenuItems = $state<MenuItem[]>([]);
    
    // Helper function to find category by name - standalone to avoid recursion
    function findCategoryByName(name: string): MenuCategory | undefined {
        return menuItems.find(c => c.category === name);
    }
    
    // Menu Category Component (to be moved to a separate file later)
    function MenuItemComponent({ item }: MenuItemProps): string {
        if (!activeMenuCategory) return '';
        const categoryName = activeMenuCategory.category;
        const isCustomizable = ["Burgers", "Chicken", "Combos"].includes(categoryName);
        
        return `
            <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div class="relative h-48 bg-gray-100">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover" />
                </div>
                <div class="p-4">
                    <h3 class="text-lg font-bold mb-1">${item.name}</h3>
                    <p class="text-gray-600 text-sm mb-3">${item.description}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-lg font-bold">$${item.price.toFixed(2)}</span>
                        <a href="/menu/${categoryName}/${encodeURIComponent(item.name)}" class="btn ${isCustomizable ? 'btn-primary' : 'btn-success'} btn-sm">
                            ${isCustomizable ? 'Customize' : 'Add to Order'}
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Dietary Filter Component (to be moved to a separate file later)
    function DietaryFilter({ onFilterChange }: DietaryFilterProps): string {
        return `
            <div class="mb-6 p-4 bg-gray-50 rounded-xl">
                <h3 class="font-bold mb-2">Dietary Preferences</h3>
                <div class="flex flex-wrap gap-2">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" class="checkbox" value="vegetarian" />
                        <span>Vegetarian</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" class="checkbox" value="vegan" />
                        <span>Vegan</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" class="checkbox" value="gluten-free" />
                        <span>Gluten-Free</span>
                    </label>
                </div>
            </div>
        `;
    }
    
    // Editable Order Item Component (to be moved to a separate file later)
    function EditableOrderItem({ item, index, onIncrease, onDecrease, onEdit }: EditableOrderItemProps): string {
        return `
            <div class="flex items-center justify-between py-3 border-b border-gray-100">
                <div class="flex items-center">
                    <div class="mr-3 flex items-center">
                        <button class="btn btn-xs btn-circle" onclick="${onDecrease}(${index})">-</button>
                        <span class="mx-2 font-medium">${item.quantity}</span>
                        <button class="btn btn-xs btn-circle" onclick="${onIncrease}(${index})">+</button>
                    </div>
                    <div>
                        <p class="font-medium">${item.name}</p>
                        <p class="text-sm text-gray-500">$${item.price.toFixed(2)}</p>
                    </div>
                </div>
                <div class="flex items-center">
                    <span class="font-medium mr-3">$${(item.price * item.quantity).toFixed(2)}</span>
                    <button class="btn btn-xs btn-ghost" onclick="${onEdit}(${item}, ${index})">Edit</button>
                </div>
            </div>
        `;
    }
    
    // Customization Modal Component (to be moved to a separate file later)
    function CustomizationModal({ item, isOpen, onClose, onAddToCart }: CustomizationModalProps): string {
        return `
            <div class="modal ${isOpen ? 'modal-open' : ''}">
                <div class="modal-box">
                    <h3 class="font-bold text-lg">Customize ${item.name}</h3>
                    <p class="py-4">Customization options would go here</p>
                    <div class="modal-action">
                        <button class="btn" onclick="${onClose}">Cancel</button>
                        <button class="btn btn-primary" onclick="${onAddToCart}(${item})">Save</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Set initial active menu category without using $effect
    activeMenuCategory = findCategoryByName(currentCategoryName);
    if (!activeMenuCategory && menuItems.length > 0) {
        activeMenuCategory = menuItems[0];
    }
    
    // Update filtered items based on active category
    $effect(() => {
        if (activeMenuCategory) {
            // Make a local copy of the active menu category to avoid referencing state in its own scope
            const category = activeMenuCategory;
            filteredMenuItems = [...category.items];
        }
    });
    
    // Watch for URL parameter changes
    $effect(() => {
        const categoryName = $page.params.category;
        const category = findCategoryByName(categoryName);
        
        if (category) {
            activeMenuCategory = category;
        }
    });
    
    // Setup slideshow using runes
    $effect.root(() => {
        // Setup auto-advancing slideshow
        slideInterval = window.setInterval(() => {
            currentSlide = (currentSlide + 1) % promoSlides.length;
        }, 5000) as unknown as number;
        
        // Cleanup function will be called automatically when component is destroyed
        return () => {
            if (slideInterval !== null) {
                window.clearInterval(slideInterval);
            }
        };
    });
    
    // Add event listener for "addToCart" events
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
    function formatDiningOption(option: string): string {
        return option === "eat_in" ? "Dine In" : "Take Away";
    }
    
    function getTotal(items: CartItem[]): string {
        return items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0).toFixed(2);
    }
    
    function getItemCount(items: CartItem[]): number {
        return items.reduce((count: number, item: CartItem) => count + item.quantity, 0);
    }
    
    // Event handlers
    function goToSlide(index: number): void {
        currentSlide = index;
    }
    
    function changeCategory(category: string): void {
        // Simply navigate to the new URL - the effect will handle the category change
        goto(`/menu/${category}`);
    }
    
    function handleFilterChange(filters: Record<string, boolean>): void {
        // Apply filters logic would go here
        hasActiveFilters = Object.values(filters).some(v => v);
    }
    
    function handleScrollLeft(): void {
        const container = document.querySelector('.overflow-x-auto');
        if (container) {
            container.scrollBy({ left: -200, behavior: 'smooth' });
        }
    }
    
    function handleScrollRight(): void {
        const container = document.querySelector('.overflow-x-auto');
        if (container) {
            container.scrollBy({ left: 200, behavior: 'smooth' });
        }
    }
    
    function toggleOrderSummary(): void {
        isOrderSummaryOpen = !isOrderSummaryOpen;
    }
    
    function handleIncreaseQuantity(index: number): void {
        cartItems[index].quantity += 1;
        cartItems = [...cartItems]; // trigger reactivity
    }
    
    function handleDecreaseQuantity(index: number): void {
        if (cartItems[index].quantity > 1) {
            cartItems[index].quantity -= 1;
        } else {
            cartItems.splice(index, 1);
        }
        cartItems = [...cartItems]; // trigger reactivity
    }
    
    function handleEdit(item: CartItem, index: number): void {
        editingItem = { ...item, index };
        showCustomizationModal = true;
    }
    
    function closeModal(): void {
        showCustomizationModal = false;
        editingItem = null;
    }
    
    function handleSaveCustomization(item: CartItem): void {
        if (editingItem && editingItem.index !== undefined) {
            cartItems[editingItem.index] = { ...item };
            cartItems = [...cartItems]; // trigger reactivity
        }
        closeModal();
    }
    
    function restartOrder(): void {
        // Reset category to the first one (usually Burgers)
        if (menuItems.length > 0) {
            goto(`/menu/${menuItems[0].category}`);
        }
        // Close order summary panel
        isOrderSummaryOpen = false;
    }
    
    function goToCheckout() {
        if (cartItems.length > 0) {
            // Store cart in localStorage for the checkout page (browser-only)
            if (typeof window !== 'undefined') {
                localStorage.setItem('cartItems', JSON.stringify(cartItems));
            }
            window.location.href = '/checkout';
        }
    }
</script>

<div class="flex flex-col min-h-screen">
  <!-- Promotional Slideshow -->
  <div class="relative w-full h-64 md:h-80 overflow-hidden mb-6 rounded-xl shadow-lg">
    {#each promoSlides as slide, i}
        <div 
            class="absolute inset-0 w-full h-full transition-opacity duration-1000 bg-cover bg-center"
            style="background-image: url({slide.image}); opacity: {i === currentSlide ? '1' : '0'};"
        >
            <div class="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                <div class="text-white max-w-md p-8">
                    <h2 class="text-3xl md:text-4xl font-bold mb-2">{slide.title}</h2>
                    <p class="text-lg md:text-xl">{slide.description}</p>
                </div>
            </div>
        </div>
    {/each}
    
    <!-- Slide indicators -->
    <div class="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {#each promoSlides as _, i}
            <button 
                class="w-3 h-3 rounded-full transition-colors duration-300 {i === currentSlide ? 'bg-white' : 'bg-white/40'}"
                onclick={() => goToSlide(i)}
                aria-label="Go to slide {i + 1}"
            ></button>
        {/each}
    </div>
  </div>
  
  <div class="container mx-auto px-4">
    <!-- Header area -->
    <div class="flex flex-col mb-4">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-4xl font-bold">Our Menu</h1>
                {#if diningOption}
                    <div class="badge badge-primary badge-lg mt-2">{formatDiningOption(diningOption)}</div>
                {/if}
            </div>
        </div>
    </div>
    
    <!-- Horizontal Category Navigation - Framed Container -->
    <div class="relative mb-8 mx-auto max-w-4xl">
        <div class="rounded-3xl border border-gray-200 bg-white shadow-md p-2 overflow-hidden">
            <!-- Left scroll button -->
            <button 
                class="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 rounded-full p-2 shadow-md" 
                onclick={handleScrollLeft}
                aria-label="Scroll left"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
            </button>
            
            <!-- Scrollable category bar -->
            <div class="overflow-x-auto py-3 px-10 hide-scrollbar flex items-center justify-center space-x-6">
                {#each menuItems as category (category.id)}
                    <button 
                        id="category-{category.id}"
                        class="flex flex-col items-center min-w-20 transition-all duration-300 focus:outline-none {activeMenuCategory?.id === category.id ? 'text-primary font-bold' : ''}"
                        onclick={() => changeCategory(category.category)}
                    >
                <div class="w-20 h-20 rounded-xl bg-orange-50 flex items-center justify-center mb-3 overflow-hidden {activeMenuCategory?.id === category.id ? 'bg-orange-200' : ''}">
                  {#if category.imageUrl}
                    <img src={category.imageUrl} alt={category.category} class="w-14 h-14 object-contain" />
                  {:else}
                    <span class="text-4xl">{category.icon}</span>
                  {/if}
                </div>
                
                <span class="text-sm text-center leading-tight font-medium">{category.category}</span>
              </button>
                {/each}
            </div>
            
            <!-- Right scroll button -->
            <button 
                class="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 rounded-full p-2 shadow-md" 
                onclick={handleScrollRight}
                aria-label="Scroll right"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 01-1.414-1.414L9.586 10 5.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>
    </div>
    
    <!-- DietaryFilter Component -->
    <!-- Using function component inline as a temporary solution -->
    {@html DietaryFilter({ onFilterChange: handleFilterChange })}
    
    <!-- Category Content Section -->
    <div class="w-full">
        {#if activeMenuCategory}
            <div class="relative mb-6">
                <h2 class="text-3xl font-bold pb-2 inline-block">
                    <span class="mr-3">{activeMenuCategory.icon}</span>
                    {activeMenuCategory.category}
                    <span class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent rounded-full"></span>
                </h2>
                
                <!-- Filter indicator -->
                {#if hasActiveFilters}
                    <div class="inline-block ml-4 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                        Filtered Results
                    </div>
                {/if}
            </div>
            
            <!-- Show message if no items match filters -->
            {#if filteredMenuItems.length === 0}
                <div class="bg-gray-100 rounded-xl p-8 text-center">
                    <div class="text-5xl mb-4">😕</div>
                    <h3 class="text-xl font-bold mb-2">No items match your filters</h3>
                    <p class="text-gray-600">Try adjusting your dietary preferences or allergen settings.</p>
                </div>
            {:else}
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {#each filteredMenuItems as menuItem (menuItem.id)}
                        {@html MenuItemComponent({ item: menuItem })}
                    {/each}
                </div>
            {/if}
        {/if}
    </div>
  </div>
  
  <!-- Order Summary Section -->
  <div class="fixed bottom-0 left-0 right-0 z-20">
    <!-- Collapsible Order Panel with Editable Order Items -->
    {#if isOrderSummaryOpen && cartItems.length > 0}
    <div class="bg-white rounded-t-3xl shadow-lg p-6 order-panel">
            <div class="flex justify-between items-center mb-4">
                <div class="flex flex-col">
                    <h2 class="text-3xl font-bold">My Order</h2>
                    <span class="text-gray-600">{formatDiningOption(diningOption)}</span>
                </div>
                
                <!-- Dining Option Display -->
                <div class="px-4 py-2 bg-orange-100 rounded-full">
                    <span class="font-medium">{formatDiningOption(diningOption)}</span>
                </div>
            </div>
            
            <!-- Order Items - using EditableOrderItem component with direct handler functions -->
            <div class="mb-6 max-h-64 overflow-y-auto">
                {#each cartItems as item, i (i)}
                    {@html EditableOrderItem({ 
                        item,
                        index: i,
                        onIncrease: 'handleIncreaseQuantity',
                        onDecrease: 'handleDecreaseQuantity',
                        onEdit: 'handleEdit'
                    })}
                {/each}
            </div>
            
            <!-- Checkout Actions -->
            <div class="flex items-center justify-between pt-4 border-t border-gray-200">
                <button 
                    class="px-6 py-3 bg-orange-100 text-orange-500 rounded-full font-medium" 
                    onclick={restartOrder}
                >
                    Restart Menu
                </button>
                
                <div class="flex items-center">
                    <span class="mr-2 font-bold">Total:</span>
                    <span class="text-xl font-bold" id="summary-total">$ {getTotal(cartItems)}</span>
                </div>
            </div>
        </div>
    {/if}
    
    <!-- Fixed Payment Bar at Bottom -->
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
            
            <!-- Center Arrow Button -->
            <div class="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                <button 
                    class="bg-white rounded-full p-3 shadow-md z-30"
                    onclick={toggleOrderSummary}
                    aria-label="Toggle order summary"
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        class="h-6 w-6 transform transition-transform {isOrderSummaryOpen ? 'rotate-180' : ''}" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                    >
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
            
            <button 
                class="relative overflow-hidden group px-8 py-4 h-auto min-h-16 border-4 border-green-800 rounded-full {cartItems.length === 0 ? 'opacity-70 cursor-not-allowed' : 'bg-green-800 text-white hover:bg-green-600'}" 
                onclick={goToCheckout}
                disabled={cartItems.length === 0}
            >
                <!-- Animated border glow effect -->
                <span class="absolute inset-0 border-4 border-white/20 rounded-full opacity-0 group-hover:opacity-100 scale-105 transition-all duration-300"></span>
                
                <!-- Hover shine effect -->
                <span class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000"></span>
                
                <!-- Button content with increased spacing -->
                <div class="relative z-10 flex items-center justify-center font-bold tracking-wide text-lg">
                    <span>Proceed to Checkout</span>
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        class="h-6 w-6 ml-3 transition-transform duration-1000 ease-in-out {isArrowAnimating ? 'translate-x-2' : ''}" 
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
  
  <!-- Customization Modal for editing -->
  {#if showCustomizationModal && editingItem}
    {@html CustomizationModal({
        item: editingItem,
        isOpen: showCustomizationModal,
        onClose: 'closeModal',
        onAddToCart: 'handleSaveCustomization'
    })}
  {/if}
</div>
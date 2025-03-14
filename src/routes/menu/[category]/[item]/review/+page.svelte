<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { customizationStore } from "$lib/customizationStore";
    import type { CustomizationState } from "$lib/customizationStore";
    
    let customizationData = $state<CustomizationState | null>(null);
    let quantity = $state(1);
    
    // Load data from the store
    $effect(() => {
        const unsubscribe = customizationStore.subscribe(state => {
            customizationData = { ...state };
            quantity = state.quantity;
        });
        
        return unsubscribe;
    });
    
    // Update quantity
    function updateQuantity(newQuantity: number) {
        if (newQuantity >= 1) {
            quantity = newQuantity;
            customizationStore.setQuantity(newQuantity);
        }
    }
    
    // Navigate back to the previous step
    function moveBack() {
        const category = $page.params.category;
        const item = $page.params.item;
        goto(`/menu/${category}/${item}/extras`);
    }
    
    // Get formatted list of selected items of a certain type
    function getSelectedOptions(options: any[]) {
        return options
            .filter(opt => opt.selected)
            .map(opt => opt.name)
            .join(", ");
    }
    
    // Add to cart and return to menu
    function addToCart() {
        // Get the complete customized item
        const cartItem = customizationStore.getCustomizedItem();
        
        if (cartItem) {
            // Create and dispatch an addToCart event
            const event = new CustomEvent("addToCart", {
                detail: { item: cartItem }
            });
            document.dispatchEvent(event);
            
            // Navigate back to the category page
            const category = $page.params.category;
            goto(`/menu/${category}`);
        }
    }
</script>

<div class="w-full h-full flex flex-col bg-base-100 pt-6 pb-16">
    <!-- Header -->
    <div class="text-center mb-6 px-4">
        <h2 class="text-2xl font-bold text-primary">Review Your Order</h2>
        <p class="text-sm text-base-content/70 mt-1">Confirm your customizations</p>
    </div>
    
    {#if customizationData && customizationData.item}
        <div class="flex-1 overflow-y-auto px-4">
            <!-- Item Overview -->
            <div class="card bg-base-200 shadow-md mb-4">
                <div class="card-body p-4 flex flex-row">
                    <div class="w-24 h-24 bg-base-300 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                        <img 
                            src={customizationData.item.image} 
                            alt={customizationData.item.name}
                            class="w-full h-full object-cover"
                        />
                    </div>
                    <div class="flex-1">
                        <h3 class="card-title text-lg">{customizationData.item.name}</h3>
                        <p class="text-sm text-base-content/70">{customizationData.item.description}</p>
                        
                        <!-- Quantity Selector -->
                        <div class="flex items-center mt-3">
                            <span class="text-sm font-medium mr-2">Quantity:</span>
                            <button 
                                class="btn btn-circle btn-sm btn-ghost"
                                onclick={() => updateQuantity(quantity - 1)}
                                disabled={quantity <= 1}
                            >
                                <span class="text-lg font-bold">-</span>
                            </button>
                            <span class="mx-3 font-bold">{quantity}</span>
                            <button 
                                class="btn btn-circle btn-sm btn-ghost"
                                onclick={() => updateQuantity(quantity + 1)}
                            >
                                <span class="text-lg font-bold">+</span>
                            </button>
                        </div>
                    </div>
                    <div class="flex-shrink-0 text-right">
                        <div class="text-lg font-bold text-primary">${customizationData.totalPrice.toFixed(2)}</div>
                        <div class="text-xs text-base-content/60">
                            Base: ${customizationData.item.price.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Customizations Summary -->
            <div class="card bg-base-200 shadow-md mb-4">
                <div class="card-body">
                    <h3 class="card-title text-lg mb-2">Your Customizations</h3>
                    
                    <!-- Size -->
                    <div class="mb-3">
                        <h4 class="font-medium text-sm text-base-content/60">Size</h4>
                        <p class="ml-2">
                            {customizationData.size.options.find(s => s.selected)?.name || "Medium"}
                            {#if (customizationData.size.options.find(s => s.selected)?.price || 0) > 0}
                                <span class="badge badge-secondary badge-sm ml-1">
                                    +${(customizationData.size.options.find(s => s.selected)?.price || 0).toFixed(2)}
                                </span>
                            {/if}
                            {#if (customizationData.size.options.find(s => s.selected)?.price || 0) < 0}
                                <span class="badge badge-accent badge-sm ml-1">
                                    ${(customizationData.size.options.find(s => s.selected)?.price || 0).toFixed(2)}
                                </span>
                            {/if}
                        </p>
                    </div>
                    
                    <!-- Toppings -->
                    <div class="mb-3">
                        <h4 class="font-medium text-sm text-base-content/60">Toppings</h4>
                        <div class="ml-2">
                            {#if customizationData.toppings.some(t => t.selected)}
                                <div class="flex flex-wrap gap-1 mt-1">
                                    {#each customizationData.toppings.filter(t => t.selected) as topping}
                                        <span class="badge badge-outline">
                                            {topping.name}
                                            {#if topping.price > 0}
                                                <span class="ml-1 text-secondary">+${topping.price.toFixed(2)}</span>
                                            {/if}
                                        </span>
                                    {/each}
                                </div>
                            {:else}
                                <p class="text-base-content/50 italic">None selected</p>
                            {/if}
                        </div>
                    </div>
                    
                    <!-- Sauces -->
                    <div class="mb-3">
                        <h4 class="font-medium text-sm text-base-content/60">Sauces</h4>
                        <div class="ml-2">
                            {#if customizationData.sauces.some(s => s.selected)}
                                <div class="flex flex-wrap gap-1 mt-1">
                                    {#each customizationData.sauces.filter(s => s.selected) as sauce}
                                        <span class="badge badge-outline">
                                            {sauce.name} 
                                            <span class="opacity-70">
                                                ({sauce.intensity === 0 ? 'Light' : sauce.intensity === 1 ? 'Regular' : 'Extra'})
                                            </span>
                                            {#if sauce.price > 0}
                                                <span class="ml-1 text-secondary">+${sauce.price.toFixed(2)}</span>
                                            {/if}
                                        </span>
                                    {/each}
                                </div>
                            {:else}
                                <p class="text-base-content/50 italic">None selected</p>
                            {/if}
                        </div>
                    </div>
                    
                    <!-- Extras -->
                    <div class="mb-3">
                        <h4 class="font-medium text-sm text-base-content/60">Premium Extras</h4>
                        <div class="ml-2">
                            {#if customizationData.extras.some(e => e.selected)}
                                <div class="flex flex-wrap gap-1 mt-1">
                                    {#each customizationData.extras.filter(e => e.selected) as extra}
                                        <span class="badge badge-secondary">
                                            {extra.name}
                                            {#if extra.price > 0}
                                                <span class="ml-1">+${extra.price.toFixed(2)}</span>
                                            {/if}
                                        </span>
                                    {/each}
                                </div>
                            {:else}
                                <p class="text-base-content/50 italic">None selected</p>
                            {/if}
                        </div>
                    </div>
                    
                    <!-- Special Instructions -->
                    {#if customizationData.specialInstructions}
                        <div class="mb-3">
                            <h4 class="font-medium text-sm text-base-content/60">Special Instructions</h4>
                            <div class="ml-2 mt-1 p-3 bg-base-300 rounded-lg text-sm italic">
                                "{customizationData.specialInstructions}"
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
        
        <!-- Bottom Action Buttons -->
        <div class="w-full px-8 pb-4 mt-4">
            <div class="flex justify-between w-full">
                <!-- Back Button -->
                <button 
                    class="btn btn-outline"
                    onclick={moveBack}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                    </svg>
                    <span class="font-medium">Back</span>
                </button>
                
                <!-- Add to Cart Button -->
                <button 
                    class="btn btn-success text-success-content"
                    onclick={addToCart}
                >
                    <span class="font-medium">Add to Cart</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    {:else}
        <div class="flex-1 flex items-center justify-center">
            <div class="text-center">
                <span class="loading loading-spinner loading-lg text-primary"></span>
                <p class="text-lg mt-4">Loading item details...</p>
            </div>
        </div>
    {/if}
</div>
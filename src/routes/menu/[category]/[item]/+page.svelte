<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { customizationStore } from "$lib/customizationStore";
    import type { MenuItem } from "$lib/types";
    
    interface PageData {
        item: MenuItem | null;
        categoryName: string;
    }
    
    let { data } = $props<{ data: PageData }>();
    
    // Check if category is customizable
    const customizableCategories = ["Burgers", "Chicken", "Combos"];
    const isCustomizable = $derived(
        customizableCategories.includes(data.categoryName)
    );
    
    // Initialize the customization store with the current item
    $effect(() => {
        if (data.item) {
            customizationStore.initializeWithItem(data.item);
            
            // Check if we're at the base URL without a specific customization step
            const currentPath = $page.url.pathname;
            const needsRedirect = !currentPath.includes('/size') && 
                !currentPath.includes('/toppings') && 
                !currentPath.includes('/sauces') && 
                !currentPath.includes('/extras') && 
                !currentPath.includes('/review');
            
            // Redirect to the first customization step if needed and if category is customizable
            if (needsRedirect) {
                const category = $page.params.category;
                const item = $page.params.item;
                
                if (isCustomizable) {
                    goto(`/menu/${category}/${item}/size`);
                } else {
                    // For non-customizable items, add directly to cart and return to menu
                    const event = new CustomEvent("addToCart", {
                        detail: { 
                            item: {
                                ...data.item,
                                quantity: 1,
                                timestamp: Date.now()
                            }
                        }
                    });
                    document.dispatchEvent(event);
                    
                    // Navigate back to the category
                    goto(`/menu/${category}`);
                }
            }
        }
    });
</script>

{#if data.item}
    <div class="w-full h-full flex items-center justify-center bg-gray-50">
        <div class="text-center p-8 rounded-lg bg-white shadow-md max-w-md">
            <h2 class="text-xl font-bold mb-4">
                {isCustomizable ? "Preparing Your Customization" : "Adding to Order..."}
            </h2>
            <p class="mb-6">
                {isCustomizable 
                    ? `Setting up customization options for ${data.item.name}...`
                    : `Adding ${data.item.name} to your order...`}
            </p>
            <div class="loading-spinner mx-auto"></div>
        </div>
    </div>
{:else}
    <div class="w-full h-full flex items-center justify-center bg-gray-50">
        <div class="text-center p-8 rounded-lg bg-white shadow-md max-w-md">
            <h2 class="text-xl font-bold mb-4 text-red-600">Item Not Found</h2>
            <p class="mb-6">We couldn't find the item you're looking for.</p>
            <a href="/menu/{$page.params.category}" class="btn btn-primary">
                Return to Menu
            </a>
        </div>
    </div>
{/if}

<style>
    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-top-color: #ff8800;
        animation: spin 1s ease-in-out infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
</style>
<script lang="ts">
    import { page } from "$app/stores";
    import { customizationStore } from "$lib/customizationStore";
    import { menuItems } from "$lib/items";
    import type { MenuItem } from "$lib/types";
    
    let { children } = $props();
    
    // Customization step data
    const steps = [
        { id: "size", icon: "📏", label: "Size" },
        { id: "toppings", icon: "🥬", label: "Toppings" },
        { id: "sauces", icon: "🧂", label: "Sauces" },
        { id: "extras", icon: "🥓", label: "Extras" },
        { id: "review", icon: "✓", label: "Review" }
    ];
    
    // Get current step and item from URL parameters
    let currentStepIndex = $state(-1);
    let currentItem = $state<MenuItem | null>(null);
    let isLoading = $state(true);
    
    // Initialize from URL parameters
    $effect(() => {
        const category = $page.params.category;
        const itemName = decodeURIComponent($page.params.item);
        
        // Get current step from URL
        const url = $page.url.pathname;
        const stepId = getStepFromUrl(url);
        currentStepIndex = steps.findIndex(step => step.id === stepId);
        
        // If no step is found in URL, default to -1 (not started)
        if (currentStepIndex === -1 && url.includes("/size")) {
            currentStepIndex = 0;
        } else if (currentStepIndex === -1 && !url.includes("/review")) {
            currentStepIndex = -1;
        }
        
        // Manually load the item data
        loadItemData(category, itemName);
    });
    
    // Load item data from menuItems
    function loadItemData(category: string, itemName: string) {
        isLoading = true;
        
        // Find the category in menuItems
        const categoryData = menuItems.find(c => c.category === category);
        if (!categoryData) {
            isLoading = false;
            return;
        }
        
        // Find the item in the category
        const item = categoryData.items.find(i => i.name === itemName);
        if (!item) {
            isLoading = false;
            return;
        }
        
        // Set the current item and initialize the store
        currentItem = item;
        customizationStore.initializeWithItem(item);
        isLoading = false;
    }
    
    // Also try loading from store as backup
    $effect(() => {
        if (!currentItem) {
            const unsubscribe = customizationStore.subscribe(state => {
                if (state.item) {
                    currentItem = state.item;
                    isLoading = false;
                }
            });
            
            return unsubscribe;
        }
    });
    
    // Function to determine current step from URL
    function getStepFromUrl(url: string): string {
        if (url.includes("/size")) return "size";
        if (url.includes("/toppings")) return "toppings";
        if (url.includes("/sauces")) return "sauces";
        if (url.includes("/extras")) return "extras";
        if (url.includes("/review")) return "review";
        return "";
    }
    
    // Navigation function for steps
    function navigateToStep(index: number) {
        if (index < 0 || index >= steps.length || index > currentStepIndex + 1) return;
        
        const category = $page.params.category;
        const item = $page.params.item;
        const targetStep = steps[index].id;
        
        window.location.href = `/menu/${category}/${item}/${targetStep}`;
    }
    
    // Handle keyboard navigation
    function handleKeydown(event: KeyboardEvent, fn: () => void) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            fn();
        }
    }
    
    // Simple function to generate CSS for a category image 
    function getCategoryBackground() {
        const category = $page.params.category;
        
        // Default color
        let bgColor = "bg-primary";
        
        // Customize based on category
        if (category === "Burgers") bgColor = "bg-orange-700";
        if (category === "Chicken") bgColor = "bg-yellow-700";
        if (category === "Combos") bgColor = "bg-red-700";
        
        return bgColor;
    }
</script>

{#if currentItem || !isLoading}
    <div class="flex flex-col min-h-screen bg-base-100">
        <!-- Product image banner -->
        <div class="relative w-full h-48 {getCategoryBackground()} overflow-hidden">
            {#if currentItem}
                <img 
                    src={currentItem.image} 
                    alt={currentItem.name}
                    class="w-full h-full object-cover opacity-80"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div class="absolute bottom-0 left-0 w-full p-4">
                    <h1 class="text-2xl font-bold text-white">{currentItem.name}</h1>
                    <p class="text-sm text-white/80">Customize your order</p>
                </div>
            {:else}
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div class="absolute bottom-0 left-0 w-full p-4">
                    <h1 class="text-2xl font-bold text-white">{decodeURIComponent($page.params.item)}</h1>
                    <p class="text-sm text-white/80">Customize your order</p>
                </div>
            {/if}
        </div>
        
        <!-- Progress Steps Bar -->
        <div class="bg-orange-50 px-4 py-6 relative">
            <!-- Steps container with positioning -->
            <div class="flex justify-center items-center">
                <!-- Step boxes with connector lines -->
                <div class="flex items-center">
                    <!-- Size step -->
                    <button 
                        class="flex flex-col items-center focus:outline-none z-10"
                        onclick={() => navigateToStep(0)}
                        onkeydown={e => handleKeydown(e, () => navigateToStep(0))}
                        disabled={currentStepIndex < 0}
                        aria-label="Size step"
                    >
                        <div class="w-16 h-16 flex items-center justify-center mb-2 transition-colors border-2 border-dashed bg-white
                            {currentStepIndex === 0 
                                ? 'bg-orange-500 text-white border-orange-600' 
                                : (currentStepIndex > 0 
                                ? 'bg-orange-200 text-orange-800 border-orange-400' 
                                : 'bg-orange-50 text-gray-600 border-orange-300')}
                            rounded-lg shadow-md"
                        >
                            <span class="text-2xl">{steps[0].icon}</span>
                        </div>
                        <span class="text-sm font-medium {currentStepIndex === 0 ? 'text-orange-700' : 'text-gray-600'}">{steps[0].label}</span>
                    </button>
                    
                    <!-- First connecting line -->
                    <div class="w-16 h-0 border-t-2 border-dashed mx-1 {currentStepIndex > 0 ? 'border-orange-500' : 'border-orange-300'}"></div>
                    
                    <!-- Connecting steps -->
                    {#each steps.slice(1) as step, i}
                        <div class="flex items-center">
                            <button 
                                class="flex flex-col items-center focus:outline-none z-10"
                                onclick={() => navigateToStep(i + 1)}
                                onkeydown={e => handleKeydown(e, () => navigateToStep(i + 1))}
                                disabled={currentStepIndex < i}
                                aria-label="{step.label} step"
                            >
                                <div class="w-16 h-16 flex items-center justify-center mb-2 transition-colors border-2 border-dashed bg-white
                                    {currentStepIndex === i + 1 
                                        ? 'bg-orange-500 text-white border-orange-600' 
                                        : (currentStepIndex > i + 1 
                                        ? 'bg-orange-200 text-orange-800 border-orange-400' 
                                        : 'bg-orange-50 text-gray-600 border-orange-300')}
                                    rounded-lg shadow-md"
                                >
                                    <span class="text-2xl">{step.icon}</span>
                                </div>
                                <span class="text-sm font-medium {currentStepIndex === i + 1 ? 'text-orange-700' : 'text-gray-600'}">{step.label}</span>
                            </button>
                            
                            <!-- Don't add a connector after the last item -->
                            {#if i < steps.length - 2}
                                <div class="w-16 h-0 border-t-2 border-dashed mx-1 
                                    {currentStepIndex > i + 1 ? 'border-orange-500' : 'border-orange-300'}"
                                ></div>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
        </div>
        
        <!-- Main content -->
        <div class="flex-1 overflow-auto">
            {@render children()}
        </div>
    </div>
{:else}
    <!-- Loading state -->
    <div class="flex items-center justify-center min-h-screen bg-base-100">
        <div class="text-center">
            <div class="loading loading-spinner loading-lg"></div>
            <p class="mt-4">Loading product information...</p>
            <p class="mt-2 text-sm text-gray-500">This may take a moment...</p>
            
            <!-- Debug info to help troubleshoot -->
            <div class="mt-8 p-4 bg-gray-100 rounded-lg text-left text-sm">
                <p>Debug Information:</p>
                <ul class="list-disc pl-5 mt-2">
                    <li>Category: {$page.params.category}</li>
                    <li>Item: {decodeURIComponent($page.params.item)}</li>
                    <li>Current Path: {$page.url.pathname}</li>
                </ul>
                <button 
                    class="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                    onclick={() => { isLoading = false; }}
                >
                    Force Continue
                </button>
            </div>
        </div>
    </div>
{/if}
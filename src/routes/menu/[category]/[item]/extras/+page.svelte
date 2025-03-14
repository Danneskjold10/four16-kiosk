<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { customizationStore } from "$lib/customizationStore";
    import type { ExtraOption } from "$lib/customizationStore";
    
    // State for extras
    let allItems = $state<ExtraOption[]>([]);
    let selectedItems = $derived(allItems.filter(item => item.selected));
    let unselectedItems = $derived(allItems.filter(item => !item.selected));
    let leftArrowOffset = $state(false);
    let rightArrowOffset = $state(false);
    let specialInstructions = $state("");
    
    // Computed states for button disabling
    let allSelected = $derived(unselectedItems.length === 0);
    let allUnselected = $derived(selectedItems.length === 0);
    
    // Load extras from the store
    $effect(() => {
        const unsubscribe = customizationStore.subscribe(state => {
            allItems = [...state.extras];
            specialInstructions = state.specialInstructions;
        });
        
        return unsubscribe;
    });
    
    // Update special instructions
    function updateSpecialInstructions(event: Event) {
        const textarea = event.target as HTMLTextAreaElement;
        specialInstructions = textarea.value;
        customizationStore.setSpecialInstructions(specialInstructions);
    }
    
    // Helper functions for toggling items
    function toggleExtra(id: number) {
        customizationStore.toggleExtra(id);
    }
    
    // Select all or none
    function selectAll() {
        unselectedItems.forEach(item => {
            customizationStore.toggleExtra(item.id);
        });
    }
    
    function selectNone() {
        selectedItems.forEach(item => {
            customizationStore.toggleExtra(item.id);
        });
    }
    
    // Handle broken images
    function handleImageError(event: Event) {
        const target = event.target as HTMLImageElement;
        target.style.display = 'none';
        const emojiSpan = target.nextElementSibling;
        if (emojiSpan) {
            emojiSpan.classList.remove('hidden');
        }
    }
    
    // Get emoji for fallback
    function getEmojiForOption(name: string): string {
        const emojiMap: Record<string, string> = {
            "Bacon": "🥓",
            "Extra Cheese": "🧀",
            "Avocado": "🥑",
            "Fried Egg": "🍳"
        };
        
        return emojiMap[name] || "🍴";
    }
    
    // Animate arrows
    function animateLeftArrow() {
        leftArrowOffset = true;
        setTimeout(() => { leftArrowOffset = false; }, 300);
    }
    
    function animateRightArrow() {
        rightArrowOffset = true;
        setTimeout(() => { rightArrowOffset = false; }, 300);
    }
    
    // Navigation functions
    function moveForward() {
        animateRightArrow();
        setTimeout(() => {
            const category = $page.params.category;
            const item = $page.params.item;
            goto(`/menu/${category}/${item}/review`);
        }, 300);
    }
    
    function moveBackward() {
        animateLeftArrow();
        setTimeout(() => {
            const category = $page.params.category;
            const item = $page.params.item;
            goto(`/menu/${category}/${item}/sauces`);
        }, 300);
    }
</script>

<div class="flex flex-col h-full w-full px-6 py-4 bg-base-100">
    <!-- Selected items section -->
    <div class="flex-1 mb-4">
        <h2 class="text-lg font-bold text-primary mb-3 flex items-center">
            <span class="mr-2">✓</span> Selected Premium Add-ons
        </h2>
        
        {#if selectedItems.length > 0}
            <div class="grid grid-cols-2 gap-3 w-full">
                {#each selectedItems as item}
                    <button 
                        class="p-4 rounded-lg transition-all duration-200 flex items-center shadow-sm
                              border-2 border-solid border-primary bg-primary-content
                              hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary"
                        onclick={() => toggleExtra(item.id)}
                        aria-pressed={true}
                        aria-label="Remove {item.name} (+${item.price.toFixed(2)})"
                    >
                        <div class="flex-shrink-0 w-8 h-8 mr-3 flex items-center justify-center text-2xl">
                            {#if item.image}
                                <img 
                                    src={item.image || `/images/extras/${item.name.toLowerCase().replace(' ', '-')}.png`}
                                    alt=""
                                    class="w-full h-full object-contain"
                                    onerror={handleImageError}
                                    aria-hidden="true"
                                />
                                <span class="hidden">{getEmojiForOption(item.name)}</span>
                            {:else}
                                <span>{getEmojiForOption(item.name)}</span>
                            {/if}
                        </div>
                        <div class="flex-1 flex flex-col items-start">
                            <span class="font-medium">{item.name}</span>
                            <span class="text-sm text-accent">+${item.price.toFixed(2)}</span>
                        </div>
                        <div class="flex-shrink-0 text-success">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </button>
                {/each}
            </div>
        {:else}
            <div class="flex justify-center items-center h-28 bg-base-200 rounded-lg border-2 border-dashed border-base-300">
                <p class="text-base-content/70 text-center">No premium add-ons selected.<br>Select from options below for an enhanced experience.</p>
            </div>
        {/if}
    </div>
    
    <!-- Available options section -->
    <div class="flex-1 mb-6">
        <h2 class="text-lg font-bold text-primary mb-3">Premium Add-ons</h2>
        
        {#if unselectedItems.length > 0}
            <div class="grid grid-cols-2 gap-3 w-full">
                {#each unselectedItems as item}
                    <button 
                        class="p-4 rounded-lg transition-all duration-200 flex items-center shadow-sm
                              border-2 border-dashed border-base-300 bg-base-100
                              hover:shadow-md transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary"
                        onclick={() => toggleExtra(item.id)}
                        aria-pressed={false}
                        aria-label="Add {item.name} (+${item.price.toFixed(2)})"
                    >
                        <div class="flex-shrink-0 w-8 h-8 mr-3 flex items-center justify-center text-2xl">
                            {#if item.image}
                                <img 
                                    src={item.image || `/images/extras/${item.name.toLowerCase().replace(' ', '-')}.png`}
                                    alt=""
                                    class="w-full h-full object-contain"
                                    onerror={handleImageError}
                                    aria-hidden="true"
                                />
                                <span class="hidden">{getEmojiForOption(item.name)}</span>
                            {:else}
                                <span>{getEmojiForOption(item.name)}</span>
                            {/if}
                        </div>
                        <div class="flex-1 flex flex-col items-start">
                            <span class="font-medium">{item.name}</span>
                            <span class="text-sm text-accent">+${item.price.toFixed(2)}</span>
                        </div>
                        <div class="flex-shrink-0 text-base-300">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                    </button>
                {/each}
            </div>
        {:else}
            <div class="flex justify-center items-center h-28 bg-base-200 rounded-lg border-2 border-dashed border-base-300">
                <p class="text-base-content/70 text-center">All premium add-ons selected</p>
            </div>
        {/if}
    </div>
    
    <!-- Special Instructions -->
    <div class="mb-6">
        <h2 class="text-lg font-bold text-primary mb-3">Special Instructions</h2>
        <textarea 
            class="textarea textarea-bordered w-full h-24 bg-base-100"
            placeholder="Any special requests? (e.g., well-done, less salt, hold the pickle, etc.)"
            value={specialInstructions}
            oninput={updateSpecialInstructions}
        ></textarea>
    </div>
    
    <!-- All/None buttons -->
    <div class="flex justify-center gap-3 mb-4">
        <button 
            class="bg-primary-content hover:bg-primary/20 text-primary px-6 py-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onclick={selectAll}
            disabled={allSelected}
        >
            Select All
        </button>
        <button 
            class="bg-base-200 hover:bg-base-300 text-base-content px-6 py-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onclick={selectNone}
            disabled={allUnselected}
        >
            Select None
        </button>
    </div>
    
    <!-- Navigation buttons -->
    <div class="flex justify-between w-full">
        <button 
            class="bg-white text-primary border-2 border-primary hover:bg-primary/10 rounded-full px-8 py-3 focus:outline-none focus:ring-2 focus:ring-primary flex items-center"
            onclick={moveBackward}
        >
            <svg xmlns="http://www.w3.org/2000/svg" 
                class="h-5 w-5 mr-2 transition-transform duration-300"
                style={leftArrowOffset ? "transform: translateX(-8px)" : "transform: translateX(0)"}
                viewBox="0 0 20 20" 
                fill="currentColor">
                <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            <span>Back</span>
        </button>
        
        <button 
            class="bg-primary hover:bg-primary-focus text-primary-content rounded-full px-8 py-3 font-medium border-2 border-primary-focus focus:outline-none focus:ring-2 focus:ring-primary flex items-center"
            onclick={moveForward}
        >
            <span>Review Order</span>
            <svg xmlns="http://www.w3.org/2000/svg" 
                class="h-5 w-5 ml-2 transition-transform duration-300"
                style={rightArrowOffset ? "transform: translateX(8px)" : "transform: translateX(0)"}
                viewBox="0 0 20 20" 
                fill="currentColor">
                <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
        </button>
    </div>
</div>
<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { customizationStore } from "$lib/customizationStore";
    import type { ToppingOption } from "$lib/customizationStore";
    
    // State for toppings
    let allItems = $state<ToppingOption[]>([]);
    let selectedItems = $derived(allItems.filter(item => item.selected));
    let unselectedItems = $derived(allItems.filter(item => !item.selected));
    let leftArrowOffset = $state(false);
    let rightArrowOffset = $state(false);
    
    // Computed states for button disabling
    let allSelected = $derived(unselectedItems.length === 0);
    let allUnselected = $derived(selectedItems.length === 0);
    
    // Load toppings from the store
    $effect(() => {
        const unsubscribe = customizationStore.subscribe(state => {
            allItems = [...state.toppings];
        });
        
        return unsubscribe;
    });
    
    // Helper functions for toggling items
    function toggleSelectedItem(index: number) {
        const itemId = selectedItems[index].id;
        customizationStore.toggleTopping(itemId);
    }
    
    function toggleUnselectedItem(index: number) {
        const itemId = unselectedItems[index].id;
        customizationStore.toggleTopping(itemId);
    }
    
    // Select all or none
    function selectAll() {
        unselectedItems.forEach(item => {
            customizationStore.toggleTopping(item.id);
        });
    }
    
    function selectNone() {
        selectedItems.forEach(item => {
            customizationStore.toggleTopping(item.id);
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
            "Lettuce": "🥬",
            "Tomato": "🍅",
            "Onion": "🧅",
            "Pickles": "🥒",
            "Jalapeños": "🌶️"
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
            goto(`/menu/${category}/${item}/sauces`);
        }, 300);
    }
    
    function moveBackward() {
        animateLeftArrow();
        setTimeout(() => {
            const category = $page.params.category;
            const item = $page.params.item;
            goto(`/menu/${category}/${item}/size`);
        }, 300);
    }
</script>

<div class="flex flex-col h-full w-full px-6 py-4 bg-base-100">
    <!-- Selected items section -->
    <div class="flex-1 mb-4">
        <h2 class="text-lg font-bold text-primary mb-3 flex items-center">
            <span class="mr-2">✓</span> Selected
        </h2>
        
        {#if selectedItems.length > 0}
            <div class="grid grid-cols-2 gap-3 w-full">
                {#each selectedItems as item, index}
                    <button 
                        class="p-4 rounded-lg transition-all duration-200 flex items-center shadow-sm
                              border-2 border-solid border-primary bg-primary-content
                              hover:shadow-md transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary"
                        onclick={() => toggleSelectedItem(index)}
                        aria-pressed={true}
                        aria-label="{item.name} {item.price > 0 ? '(+$' + item.price.toFixed(2) + ')' : ''}"
                    >
                        <div class="flex-shrink-0 w-8 h-8 mr-3 flex items-center justify-center text-2xl">
                            {#if item.image}
                                <img 
                                    src={item.image || `/images/toppings/${item.name.toLowerCase()}.png`}
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
                            {#if item.price > 0}
                                <span class="text-sm text-accent">+${item.price.toFixed(2)}</span>
                            {/if}
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
                <p class="text-base-content/70 text-center">No items selected.<br>Select items from options below.</p>
            </div>
        {/if}
    </div>
    
    <!-- Available options section -->
    <div class="flex-1 mb-6">
        <h2 class="text-lg font-bold text-primary mb-3">Options</h2>
        
        {#if unselectedItems.length > 0}
            <div class="grid grid-cols-2 gap-3 w-full">
                {#each unselectedItems as item, index}
                    <button 
                        class="p-4 rounded-lg transition-all duration-200 flex items-center shadow-sm
                              border-2 border-dashed border-base-300 bg-base-100
                              hover:shadow-md transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary"
                        onclick={() => toggleUnselectedItem(index)}
                        aria-pressed={false}
                        aria-label="{item.name} {item.price > 0 ? '(+$' + item.price.toFixed(2) + ')' : ''}"
                    >
                        <div class="flex-shrink-0 w-8 h-8 mr-3 flex items-center justify-center text-2xl">
                            {#if item.image}
                                <img 
                                    src={item.image || `/images/toppings/${item.name.toLowerCase()}.png`}
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
                            {#if item.price > 0}
                                <span class="text-sm text-accent">+${item.price.toFixed(2)}</span>
                            {/if}
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
                <p class="text-base-content/70 text-center">All items selected</p>
            </div>
        {/if}
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
            <span>Next</span>
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
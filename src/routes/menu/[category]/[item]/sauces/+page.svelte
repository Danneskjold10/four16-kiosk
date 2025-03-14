<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { customizationStore } from "$lib/customizationStore";
    import type { SauceOption } from "$lib/customizationStore";
    
    // State for sauces
    let allItems = $state<SauceOption[]>([]);
    let selectedItems = $derived(allItems.filter(item => item.selected));
    let unselectedItems = $derived(allItems.filter(item => !item.selected));
    let leftArrowOffset = $state(false);
    let rightArrowOffset = $state(false);
    
    // Computed states for button disabling
    let allSelected = $derived(unselectedItems.length === 0);
    let allUnselected = $derived(selectedItems.length === 0);
    
    // Load sauces from the store
    $effect(() => {
        const unsubscribe = customizationStore.subscribe(state => {
            allItems = [...state.sauces];
        });
        
        return unsubscribe;
    });
    
    // Helper functions for toggling items
    function toggleSauce(id: number) {
        customizationStore.toggleSauce(id);
    }
    
    // Handle intensity change
    function handleIntensityChange(id: number, level: number) {
        // Make sure sauce is selected
        const sauce = allItems.find(s => s.id === id);
        if (sauce && !sauce.selected) {
            customizationStore.toggleSauce(id);
        }
        
        // Set intensity
        customizationStore.toggleSauce(id, level);
    }
    
    // Check for Enter or Space key for accessibility
    function handleKey(event: KeyboardEvent, level: number, id: number) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleIntensityChange(id, level);
        }
    }
    
    // Select all or none
    function selectAll() {
        unselectedItems.forEach(item => {
            customizationStore.toggleSauce(item.id);
        });
    }
    
    function selectNone() {
        selectedItems.forEach(item => {
            customizationStore.toggleSauce(item.id);
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
            "Ketchup": "🍅",
            "Mustard": "🟡",
            "Mayo": "⚪",
            "BBQ": "🔶",
            "Special Sauce": "🌶️"
        };
        
        return emojiMap[name] || "🥫";
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
            goto(`/menu/${category}/${item}/extras`);
        }, 300);
    }
    
    function moveBackward() {
        animateLeftArrow();
        setTimeout(() => {
            const category = $page.params.category;
            const item = $page.params.item;
            goto(`/menu/${category}/${item}/toppings`);
        }, 300);
    }
</script>

<div class="flex flex-col h-full w-full px-6 py-4 bg-base-100">
    <!-- Selected items section -->
    <div class="flex-1 mb-4">
        <h2 class="text-lg font-bold text-primary mb-3 flex items-center">
            <span class="mr-2">✓</span> Selected Sauces
        </h2>
        
        {#if selectedItems.length > 0}
            <div class="grid grid-cols-2 gap-3 w-full">
                {#each selectedItems as item}
                    <div class="p-4 rounded-lg shadow-sm border-2 border-solid border-primary bg-primary-content flex flex-col">
                        <div class="flex items-center mb-3">
                            <div class="flex-shrink-0 w-8 h-8 mr-3 flex items-center justify-center text-2xl">
                                {#if item.image}
                                    <img 
                                        src={item.image || `/images/sauces/${item.name.toLowerCase().replace(' ', '-')}.png`}
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
                            <button 
                                class="flex-shrink-0 text-error hover:bg-error/10 p-1 rounded-full"
                                onclick={() => toggleSauce(item.id)}
                                aria-label="Remove {item.name}"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <!-- Intensity Bar -->
                        <div class="flex flex-col items-center">
                            <span class="text-xs text-base-content/70 mb-1">
                                {item.intensity === 0 ? 'Light' : item.intensity === 1 ? 'Regular' : 'Extra'} Intensity
                            </span>
                            <div class="flex space-x-1 transform rotate-180 cursor-pointer mt-2">
                                <!-- Light level -->
                                <div
                                    class={`w-3 h-12 rounded-t-sm ${
                                        item.intensity >= 0 ? 'bg-success' : 'bg-base-300'
                                    } transition-all hover:opacity-80`}
                                    tabindex="0"
                                    role="button"
                                    aria-label="Light intensity"
                                    onclick={() => handleIntensityChange(item.id, 0)}
                                    onkeydown={(event) => handleKey(event, 0, item.id)}
                                ></div>
                                
                                <!-- Regular level -->
                                <div
                                    class={`w-3 h-16 rounded-t-sm ${
                                        item.intensity >= 1 ? 'bg-warning' : 'bg-base-300'
                                    } transition-all hover:opacity-80`}
                                    tabindex="0"
                                    role="button"
                                    aria-label="Regular intensity"
                                    onclick={() => handleIntensityChange(item.id, 1)}
                                    onkeydown={(event) => handleKey(event, 1, item.id)}
                                ></div>
                                
                                <!-- Extra level -->
                                <div
                                    class={`w-3 h-20 rounded-t-sm ${
                                        item.intensity >= 2 ? 'bg-error' : 'bg-base-300'
                                    } transition-all hover:opacity-80`}
                                    tabindex="0"
                                    role="button"
                                    aria-label="Extra intensity"
                                    onclick={() => handleIntensityChange(item.id, 2)}
                                    onkeydown={(event) => handleKey(event, 2, item.id)}
                                ></div>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <div class="flex justify-center items-center h-28 bg-base-200 rounded-lg border-2 border-dashed border-base-300">
                <p class="text-base-content/70 text-center">No sauces selected.<br>Select sauces from options below.</p>
            </div>
        {/if}
    </div>
    
    <!-- Available options section -->
    <div class="flex-1 mb-6">
        <h2 class="text-lg font-bold text-primary mb-3">Available Sauces</h2>
        
        {#if unselectedItems.length > 0}
            <div class="grid grid-cols-2 gap-3 w-full">
                {#each unselectedItems as item}
                    <button 
                        class="p-4 rounded-lg transition-all duration-200 flex items-center shadow-sm
                              border-2 border-dashed border-base-300 bg-base-100
                              hover:shadow-md transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary"
                        onclick={() => toggleSauce(item.id)}
                        aria-pressed={false}
                        aria-label="Add {item.name} {item.price > 0 ? '(+$' + item.price.toFixed(2) + ')' : ''}"
                    >
                        <div class="flex-shrink-0 w-8 h-8 mr-3 flex items-center justify-center text-2xl">
                            {#if item.image}
                                <img 
                                    src={item.image || `/images/sauces/${item.name.toLowerCase().replace(' ', '-')}.png`}
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
                <p class="text-base-content/70 text-center">All sauces selected</p>
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
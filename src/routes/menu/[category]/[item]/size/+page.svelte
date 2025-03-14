<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { customizationStore } from "$lib/customizationStore";
    
    // Size options
    let sizes = ["Small", "Medium", "Large", "X-Large"];
    let selectedSize = $state(1); // Default to Medium
    
    // Carousel parameters
    const perspectiveFactor: number = 2;
    const translationFactor: number = 1.1;
    const carouselArcDeg: number = 90;
    
    // State
    let carouselClientWidth = $state(0);
    let item3dtranslation = $state(0);
    let currdeg = $state(0);
    
    // Price adjustment constants - explicit typing
    const SIZE_UPGRADE_COST = 1.50;   // Cost per size upgrade
    const SIZE_DOWNGRADE_DISCOUNT = 0.75; // Discount per size downgrade
    const DEFAULT_SIZE_INDEX = 1;     // Medium is the default size (index 1)
    
    // Derived values
    const carousel3dLen = $derived(sizes.length);
    const carouselStepDeg = $derived(
        carouselArcDeg / (carousel3dLen > 1 ? carousel3dLen - 1 : carousel3dLen)
    );
    
    // Initialize with default values
    $effect(() => {
        // Set to medium initially if not already set
        if (selectedSize === undefined) {
            selectedSize = DEFAULT_SIZE_INDEX;
        }
        updateCarouselValues();
    });
    
    // Update values when selection changes
    $effect(() => {
        if (selectedSize !== undefined) {
            updateCarouselValues();
            customizationStore.setSize(selectedSize);
        }
    });
    
    // Load initial size from store
    $effect(() => {
        const unsubscribe = customizationStore.subscribe(state => {
            selectedSize = state.size.selected;
        });
        
        return unsubscribe;
    });
    
    function updateCarouselValues(): void {
        item3dtranslation = 0.5 * carouselClientWidth / Math.tan((0.5 * carouselStepDeg) * (Math.PI / 180));
        currdeg = selectedSize * carouselStepDeg;
    }
    
    function handleSizeSelection(d: number): void {
        selectedSize = d;
    }
    
    // Helper functions for price display
    function getSizeAdjustmentText(index: number): string {
        if (index === DEFAULT_SIZE_INDEX) return "Standard";
        
        const diff = index - DEFAULT_SIZE_INDEX;
        
        if (diff > 0) {
            // Price increase for larger sizes
            const amount = diff * SIZE_UPGRADE_COST;
            return "+$" + amount.toFixed(2);
        } else {
            // Price decrease for smaller sizes
            const amount = Math.abs(diff) * SIZE_DOWNGRADE_DISCOUNT;
            return "-$" + amount.toFixed(2);
        }
    }
    
    // Keyboard event handler for accessibility
    function handleKeyDown(event: KeyboardEvent, action: () => void): void {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            action();
        }
    }
    
    // Navigate to the next step
    function moveForward() {
        const category = $page.params.category;
        const item = $page.params.item;
        goto(`/menu/${category}/${item}/toppings`);
    }
</script>
  
<div class="w-full h-full relative flex flex-col justify-center items-center bg-pink-100 pt-6 pb-16">
    <!-- Size information -->
    <div class="text-center mb-6">
        <h2 class="text-xl font-bold text-orange-800">Select Your Size</h2>
        <p class="text-sm text-gray-700">
            Size {sizes[selectedSize]}: 
            <span class={selectedSize === DEFAULT_SIZE_INDEX ? "text-gray-600" : 
                       (selectedSize > DEFAULT_SIZE_INDEX ? "text-orange-600 font-semibold" : "text-green-600 font-semibold")}>
                {selectedSize === DEFAULT_SIZE_INDEX ? "Standard Price" : getSizeAdjustmentText(selectedSize)}
            </span>
        </p>
    </div>
    
    <!-- Carousel container -->
    <div class="carouselSize flex-grow flex items-center justify-center mb-20 mt-4 mx-auto relative">
        <div 
            class="h-full aspect-square relative preserve3d" 
            bind:clientWidth={carouselClientWidth} 
            style="perspective:{perspectiveFactor * carouselClientWidth}px;"
        >
            <div 
                class="w-full h-full absolute preserve3d chngng" 
                style="transform:translateZ(-{translationFactor * item3dtranslation}px) rotateY(-{currdeg}deg);"
            >
                {#each sizes as size, d}
                <button 
                onclick={() => handleSizeSelection(d)}
                onkeydown={e => handleKeyDown(e, () => handleSizeSelection(d))}
                class="btn {selectedSize === d ? 'bg-green-600 text-white' : 'bg-white/70 text-gray-700'} 
                     w-full h-full absolute opacity-80 flex flex-col items-center justify-center gap-2 border border-gray-300 
                     font-bold text-3xl rounded-lg shadow-md active:scale-95"
                style="transform: rotateY({d * carouselStepDeg}deg) translateZ({(selectedSize === d ? translationFactor : 1) * item3dtranslation}px); 
                       scale: 0.85; min-height: 120px; touch-action: manipulation;"
              >
                <span>{size}</span>
                <span class="text-sm mt-1 px-4 py-2 rounded-full {d === DEFAULT_SIZE_INDEX ? 'bg-gray-100 text-gray-800' : (d < DEFAULT_SIZE_INDEX ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800')}">
                  {d === DEFAULT_SIZE_INDEX ? "Standard" : getSizeAdjustmentText(d)}
                </span>
              </button>
                {/each}
            </div>
        </div>
    </div>
    
    <!-- Bottom Controls Container -->
    <div class="w-full px-8 pb-4 relative mt-auto">
        <!-- Carousel Navigation Controls -->
        <div class="w-full mb-4">
            <input 
                class="range range-xs w-full" 
                type="range" 
                min="0" 
                max={carousel3dLen - 1} 
                step="1" 
                bind:value={selectedSize} 
            />
        </div>
        
        <!-- Simplified size labels -->
        <div class="flex justify-between w-full px-1 mb-8 text-sm">
            {#each sizes as size, d}
                <div class="flex flex-col items-center">
                    <span class={selectedSize === d ? 'font-bold text-amber-800' : 'text-gray-600'}>{size}</span>
                    <span class="text-xs mt-1 {d === DEFAULT_SIZE_INDEX ? '' : d < DEFAULT_SIZE_INDEX ? 'text-green-600' : 'text-orange-600'}">
                        {d === DEFAULT_SIZE_INDEX ? "" : getSizeAdjustmentText(d)}
                    </span>
                </div>
            {/each}
        </div>
        
        <!-- Forward Button (Centered) -->
        <div class="flex justify-center w-full">
            <button 
                class="bg-amber-500 hover:bg-amber-600 text-white py-3 px-8 rounded-full flex items-center transition-colors"
                onclick={moveForward}
                onkeydown={e => handleKeyDown(e, moveForward)}
            >
                <span class="font-medium">Next</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>
    </div>
</div>
  
<style>
    .carouselSize {
        width: calc(.7 * min(100vw, 100vh));
        aspect-ratio: 2;
    }
    
    .preserve3d {
        transform-style: preserve-3d;
    }
    
    .chngng {
        transition: transform 0.5s ease;
    }
    

    
    input[type=range].range::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        height: 16px;
        width: 16px;
        border-radius: 50%;
        background: #f59e0b;
        cursor: pointer;
        box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
    }
    
    input[type=range].range::-moz-range-thumb {
        height: 16px;
        width: 16px;
        border-radius: 50%;
        background: #f59e0b;
        cursor: pointer;
        border: none;
        box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
    }
</style>
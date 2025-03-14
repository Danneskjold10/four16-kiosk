<script lang="ts">
    import { goto, pushState } from "$app/navigation";
    import type { MenuItem, Customization } from "$lib/types";

    interface ModalProps {
        item: MenuItem;
        isOpen: boolean;
        category: string;
    }
    
    let { item, isOpen, category } = $props<ModalProps>();
    
    // Customization options based on item type
    let sizeOptions = $state([
        { id: 1, name: "Small", selected: false, price: 0 },
        { id: 2, name: "Medium", selected: true, price: 1.00 },
        { id: 3, name: "Large", selected: false, price: 2.00 }
    ]);
    
    let vegetableOptions = $state([
        { id: 1, name: "Lettuce", selected: true, price: 0 },
        { id: 2, name: "Tomato", selected: true, price: 0 },
        { id: 3, name: "Onion", selected: false, price: 0 },
        { id: 4, name: "Pickles", selected: true, price: 0 },
        { id: 5, name: "Jalapeños", selected: false, price: 0.50 }
    ]);
    
    let sauceOptions = $state([
        { id: 1, name: "Ketchup", selected: true, price: 0 },
        { id: 2, name: "Mustard", selected: false, price: 0 },
        { id: 3, name: "Mayo", selected: true, price: 0 },
        { id: 4, name: "BBQ", selected: false, price: 0 },
        { id: 5, name: "Special Sauce", selected: false, price: 0.75 }
    ]);
    
    let cheeseOptions = $state([
        { id: 1, name: "American", selected: true, price: 0 },
        { id: 2, name: "Cheddar", selected: false, price: 0.50 },
        { id: 3, name: "Swiss", selected: false, price: 0.50 },
        { id: 4, name: "Pepper Jack", selected: false, price: 0.75 },
        { id: 5, name: "No Cheese", selected: false, price: 0 }
    ]);
    
    let quantity = $state(1);
    let specialInstructions = $state("");
    
    // Calculate the item price with all customizations
    $effect(() => {
        calculatedPrice = calculateTotalPrice();
    });
    
    let calculatedPrice = $state(0);
    
    function closeModal() {
        // Navigate back to the category page without the item in the URL
        goto(`/menu/${category}`);
    }
    
    // Setup dialog behavior when it's mounted
    $effect(() => {
        const dialogElement = document.querySelector('dialog.modal') as HTMLDialogElement;
        
        if (dialogElement) {
            // Add a click handler to close when clicking the backdrop
            dialogElement.addEventListener('click', (e) => {
                const dialogDimensions = dialogElement.getBoundingClientRect();
                if (
                    e.clientX < dialogDimensions.left ||
                    e.clientX > dialogDimensions.right ||
                    e.clientY < dialogDimensions.top ||
                    e.clientY > dialogDimensions.bottom
                ) {
                    closeModal();
                }
            });
            
            // Add escape key handler
            dialogElement.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    closeModal();
                }
            });
        }
    });
    
    function selectOption(options: any[], optionId: number) {
        // For radio-style options like size
        options.forEach(opt => {
            opt.selected = opt.id === optionId;
        });
    }
    
    function toggleOption(options: any[], optionId: number) {
        // For checkbox-style options like toppings
        const option = options.find(opt => opt.id === optionId);
        if (option) {
            option.selected = !option.selected;
        }
    }
    
    function increaseQuantity() {
        quantity += 1;
    }
    
    function decreaseQuantity() {
        if (quantity > 1) {
            quantity -= 1;
        }
    }
    
    function calculateTotalPrice() {
        let price = item.price;
        
        // Add size price
        price += sizeOptions.find(opt => opt.selected)?.price || 0;
        
        // Add prices of selected toppings/options
        vegetableOptions.forEach(opt => {
            if (opt.selected) price += opt.price;
        });
        
        sauceOptions.forEach(opt => {
            if (opt.selected) price += opt.price;
        });
        
        cheeseOptions.forEach(opt => {
            if (opt.selected) price += opt.price;
        });
        
        return price * quantity;
    }
    
    function addToCart() {
        // Gather all selected customizations
        const customizations: Customization[] = [];
        
        // Add size
        const selectedSize = sizeOptions.find(opt => opt.selected);
        if (selectedSize) {
            customizations.push({
                id: selectedSize.id,
                name: `Size: ${selectedSize.name}`,
                selected: true,
                price: selectedSize.price
            });
        }
        
        // Add vegetables
        vegetableOptions.filter(opt => opt.selected).forEach(opt => {
            customizations.push({
                id: opt.id,
                name: opt.name,
                selected: true,
                price: opt.price
            });
        });
        
        // Add sauces
        sauceOptions.filter(opt => opt.selected).forEach(opt => {
            customizations.push({
                id: opt.id,
                name: opt.name,
                selected: true,
                price: opt.price
            });
        });
        
        // Add cheese
        const selectedCheese = cheeseOptions.find(opt => opt.selected);
        if (selectedCheese) {
            customizations.push({
                id: selectedCheese.id,
                name: `Cheese: ${selectedCheese.name}`,
                selected: true,
                price: selectedCheese.price
            });
        }
        
        // Add special instructions if any
        if (specialInstructions) {
            customizations.push({
                id: 9999,
                name: `Note: ${specialInstructions}`,
                selected: true,
                price: 0
            });
        }
        
        // Create the cart item
        const cartItem = {
            ...item,
            quantity,
            customizations,
            timestamp: Date.now()
        };
        
        // Dispatch an event to add this item to the cart
        const event = new CustomEvent('addToCart', {
            detail: { item: cartItem }
        });
        document.dispatchEvent(event);
        
        // Close the modal and return to the category page
        closeModal();
    }
</script>

<dialog class="modal modal-open" open={isOpen}>
    <div class="modal-box max-w-3xl bg-white rounded-2xl">
        <!-- Header -->
        <div class="flex justify-between items-start mb-6">
            <div>
                <h2 class="text-2xl font-bold">{item.name}</h2>
                <p class="text-gray-600">{item.description}</p>
            </div>
            <button 
                class="btn btn-sm btn-circle"
                onclick={closeModal}
                aria-label="Close customization modal"
            >✕</button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Left Column: Item Image -->
            <div class="rounded-xl overflow-hidden bg-gray-100 shadow-md">
                <img 
                    src={item.image} 
                    alt={item.name} 
                    class="w-full h-full object-cover"
                />
            </div>
            
            <!-- Right Column: Customization Options -->
            <div class="space-y-6">
                <!-- Quantity Selector -->
                <div class="flex items-center space-x-6">
                    <span class="font-bold">Quantity:</span>
                    <div class="flex items-center">
                        <button 
                            class="btn btn-circle btn-sm bg-orange-100 border-none text-orange-500 hover:bg-orange-200" 
                            onclick={decreaseQuantity}
                        >-</button>
                        <span class="mx-4 font-bold text-xl">{quantity}</span>
                        <button 
                            class="btn btn-circle btn-sm bg-orange-100 border-none text-orange-500 hover:bg-orange-200" 
                            onclick={increaseQuantity}
                        >+</button>
                    </div>
                </div>
                
                <!-- Size Options -->
                <div>
                    <span class="font-bold block mb-2">Size:</span>
                    <div class="flex flex-wrap gap-2">
                        {#each sizeOptions as size (size.id)}
                            <label class="cursor-pointer flex items-center space-x-2">
                                <input 
                                    type="radio" 
                                    name="size" 
                                    class="radio radio-primary" 
                                    checked={size.selected} 
                                    onclick={() => selectOption(sizeOptions, size.id)}
                                />
                                <span>{size.name} {size.price > 0 ? `+$${size.price.toFixed(2)}` : ''}</span>
                            </label>
                        {/each}
                    </div>
                </div>
                
                <!-- Vegetables -->
                <div>
                    <span class="font-bold block mb-2">Vegetables:</span>
                    <div class="grid grid-cols-2 gap-y-2">
                        {#each vegetableOptions as veg (veg.id)}
                            <label class="cursor-pointer flex items-center space-x-2">
                                <input 
                                    type="checkbox" 
                                    class="checkbox checkbox-primary" 
                                    checked={veg.selected} 
                                    onclick={() => toggleOption(vegetableOptions, veg.id)}
                                />
                                <span>{veg.name} {veg.price > 0 ? `+$${veg.price.toFixed(2)}` : ''}</span>
                            </label>
                        {/each}
                    </div>
                </div>
                
                <!-- Sauces -->
                <div>
                    <span class="font-bold block mb-2">Sauces:</span>
                    <div class="grid grid-cols-2 gap-y-2">
                        {#each sauceOptions as sauce (sauce.id)}
                            <label class="cursor-pointer flex items-center space-x-2">
                                <input 
                                    type="checkbox" 
                                    class="checkbox checkbox-primary" 
                                    checked={sauce.selected} 
                                    onclick={() => toggleOption(sauceOptions, sauce.id)}
                                />
                                <span>{sauce.name} {sauce.price > 0 ? `+$${sauce.price.toFixed(2)}` : ''}</span>
                            </label>
                        {/each}
                    </div>
                </div>
                
                <!-- Cheese -->
                <div>
                    <span class="font-bold block mb-2">Cheese:</span>
                    <div class="flex flex-wrap gap-2">
                        {#each cheeseOptions as cheese (cheese.id)}
                            <label class="cursor-pointer flex items-center space-x-2">
                                <input 
                                    type="radio" 
                                    name="cheese" 
                                    class="radio radio-primary" 
                                    checked={cheese.selected} 
                                    onclick={() => selectOption(cheeseOptions, cheese.id)}
                                />
                                <span>{cheese.name} {cheese.price > 0 ? `+$${cheese.price.toFixed(2)}` : ''}</span>
                            </label>
                        {/each}
                    </div>
                </div>
                
                <!-- Special Instructions -->
                <div>
                    <span class="font-bold block mb-2">Special Instructions:</span>
                    <textarea 
                        class="textarea textarea-bordered w-full" 
                        placeholder="Any special requests?"
                        bind:value={specialInstructions}
                    ></textarea>
                </div>
            </div>
        </div>
        
        <!-- Footer with Price and Add to Cart Button -->
        <div class="mt-8 flex justify-between items-center">
            <div>
                <span class="text-sm text-gray-500">Total Price:</span>
                <div class="text-2xl font-bold">${calculatedPrice.toFixed(2)}</div>
            </div>
            
            <button 
                class="btn btn-primary px-8 py-3 text-white"
                onclick={addToCart}
            >
                Add to Order
            </button>
        </div>
    </div>
</dialog>
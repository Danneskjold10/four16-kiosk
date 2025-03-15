import { writable } from 'svelte/store';
import type { MenuItem, Customization } from '$lib/types';

// Define types for customization data
export interface CustomizationState {
  item: MenuItem | null;
  size: {
    selected: number;        // Index of selected size
    options: SizeOption[];
  };
  toppings: ToppingOption[];
  sauces: SauceOption[];
  extras: ExtraOption[];
  quantity: number;
  specialInstructions: string;
  totalPrice: number;
}

export interface SizeOption {
  id: number;
  name: string;
  selected: boolean;
  price: number;
}

export interface ToppingOption {
  id: number;
  name: string;
  selected: boolean;
  price: number;
  image?: string;
}

export interface SauceOption {
  id: number;
  name: string;
  selected: boolean;
  price: number;
  intensity: number; // 0: Light, 1: Regular, 2: Extra
  image?: string;
}

export interface ExtraOption {
  id: number;
  name: string;
  selected: boolean;
  price: number;
  image?: string;
}

// Initial empty state
const initialState: CustomizationState = {
  item: null,
  size: {
    selected: 2, // Default to medium (updated for X-Small)
    options: [
      { id: 1, name: "X-Small", selected: false, price: -0.75 },
      { id: 2, name: "Small", selected: false, price: 0 },
      { id: 3, name: "Medium", selected: true, price: 1.00 },
      { id: 4, name: "Large", selected: false, price: 2.00 },
      { id: 5, name: "X-Large", selected: false, price: 3.00 }
    ]
  },
  toppings: [
    { id: 1, name: "Lettuce", selected: true, price: 0 },
    { id: 2, name: "Tomato", selected: true, price: 0 },
    { id: 3, name: "Onion", selected: false, price: 0 },
    { id: 4, name: "Pickles", selected: true, price: 0 },
    { id: 5, name: "Jalapeños", selected: false, price: 0.50 }
  ],
  sauces: [
    { id: 1, name: "Ketchup", selected: true, price: 0, intensity: 1 },
    { id: 2, name: "Mustard", selected: false, price: 0, intensity: 1 },
    { id: 3, name: "Mayo", selected: true, price: 0, intensity: 1 },
    { id: 4, name: "BBQ", selected: false, price: 0, intensity: 1 },
    { id: 5, name: "Special Sauce", selected: false, price: 0.75, intensity: 1 }
  ],
  extras: [
    { id: 1, name: "Bacon", selected: false, price: 1.50 },
    { id: 2, name: "Extra Cheese", selected: false, price: 1.00 },
    { id: 3, name: "Avocado", selected: false, price: 1.50 },
    { id: 4, name: "Fried Egg", selected: false, price: 1.00 }
  ],
  quantity: 1,
  specialInstructions: "",
  totalPrice: 0
};

// Get the customized item for cart
getCustomizedItem: () => {
  let result: any = null;
  
  // Get the current state (synchronously)
  const unsubscribe = customizationStore.subscribe(state => {
    // Use type assertion to avoid TypeScript errors
    const typedState = state as unknown as CustomizationState;
    result = typedState;
  });
  unsubscribe();
  
  if (!result || !result.item) return null;
  
  // Create customizations array for cart item
  const customizations: Customization[] = [];
  
  // ... rest of the function remains the same
}

// Helper function to calculate the total price
function calculateTotalPrice(basePrice: number, state: CustomizationState): number {
  let total = basePrice;
  
  // Add size price
  const selectedSize = state.size.options.find(s => s.selected);
  if (selectedSize) {
    total += selectedSize.price;
  }
  
  // Add selected toppings prices
  state.toppings
    .filter(t => t.selected)
    .forEach(t => {
      total += t.price;
    });
  
  // Add selected sauces prices
  state.sauces
    .filter(s => s.selected)
    .forEach(s => {
      total += s.price;
    });
  
  // Add selected extras prices
  state.extras
    .filter(e => e.selected)
    .forEach(e => {
      total += e.price;
    });
  
  // Multiply by quantity
  total *= state.quantity;
  
  return total;
}

// Create the customization store
const createStore = () => {
  const { subscribe, set, update } = writable(initialState);
  
  // Define store functions with manual type casting to fix TypeScript errors
  function typeSafeUpdate(updateFn: (state: CustomizationState) => CustomizationState) {
    update(state => updateFn(state as unknown as CustomizationState));
  }
  
  return {
    subscribe,
    
    // Initialize with a menu item
    initializeWithItem: (item: MenuItem) => {
      typeSafeUpdate(state => {
        state.item = item;
        state.totalPrice = calculateTotalPrice(item.price, state);
        return state;
      });
    },
    
    // Set selected size
    setSize: (sizeIndex: number) => {
      typeSafeUpdate(state => {
        // Reset all size selections
        state.size.options.forEach(option => option.selected = false);
        // Select the chosen size
        state.size.options[sizeIndex].selected = true;
        state.size.selected = sizeIndex;
        
        // Update total price
        if (state.item) {
          state.totalPrice = calculateTotalPrice(state.item.price, state);
        }
        
        return state;
      });
    },
    
    // Toggle a topping
    toggleTopping: (id: number) => {
      typeSafeUpdate(state => {
        const topping = state.toppings.find(t => t.id === id);
        if (topping) {
          topping.selected = !topping.selected;
        }
        
        // Update total price
        if (state.item) {
          state.totalPrice = calculateTotalPrice(state.item.price, state);
        }
        
        return state;
      });
    },
    
    // Toggle sauce and set intensity
    toggleSauce: (id: number, intensity?: number) => {
      typeSafeUpdate(state => {
        const sauce = state.sauces.find(s => s.id === id);
        if (sauce) {
          if (intensity !== undefined) {
            sauce.intensity = intensity;
          } else {
            sauce.selected = !sauce.selected;
          }
        }
        
        // Update total price
        if (state.item) {
          state.totalPrice = calculateTotalPrice(state.item.price, state);
        }
        
        return state;
      });
    },
    
    // Toggle extra
    toggleExtra: (id: number) => {
      typeSafeUpdate(state => {
        const extra = state.extras.find(e => e.id === id);
        if (extra) {
          extra.selected = !extra.selected;
        }
        
        // Update total price
        if (state.item) {
          state.totalPrice = calculateTotalPrice(state.item.price, state);
        }
        
        return state;
      });
    },
    
    // Update quantity
    setQuantity: (quantity: number) => {
      typeSafeUpdate(state => {
        state.quantity = quantity;
        
        // Update total price
        if (state.item) {
          state.totalPrice = calculateTotalPrice(state.item.price, state);
        }
        
        return state;
      });
    },
    
    // Set special instructions
    setSpecialInstructions: (instructions: string) => {
      typeSafeUpdate(state => {
        state.specialInstructions = instructions;
        return state;
      });
    },
    
    // Reset the store
    reset: () => set(initialState),
    
    getCustomizedItem: () => {
      console.log("getCustomizedItem called");
      let result: any = null;
      
      // Get the current state (synchronously)
      const unsubscribe = customizationStore.subscribe(state => {
          console.log("Current customization state:", state);
          // Use type assertion to avoid TypeScript errors
          const typedState = state as unknown as CustomizationState;
          result = typedState;
      });
      unsubscribe();
      
      if (!result || !result.item) {
          console.error("No item in customization state");
          return null;
      }
      
      // Create customizations array for cart item
      const customizations: Customization[] = [];
      
      // Add size
      const selectedSize = result.size.options.find((s: SizeOption) => s.selected);
      if (selectedSize) {
          customizations.push({
              id: selectedSize.id,
              name: `Size: ${selectedSize.name}`,
              selected: true,
              price: selectedSize.price
          });
      }
      // Add toppings
      result.toppings
        .filter((t: ToppingOption) => t.selected)
        .forEach((t: ToppingOption) => {
          customizations.push({
            id: t.id,
            name: t.name,
            selected: true,
            price: t.price
          });
        });
      
      // Add sauces
      result.sauces
        .filter((s: SauceOption) => s.selected)
        .forEach((s: SauceOption) => {
          const intensityLabel = 
            s.intensity === 0 ? 'Light' : 
            s.intensity === 1 ? 'Regular' : 'Extra';
          
          customizations.push({
            id: s.id,
            name: `${s.name} (${intensityLabel})`,
            selected: true,
            price: s.price
          });
        });
      
      // Add extras
      result.extras
        .filter((e: ExtraOption) => e.selected)
        .forEach((e: ExtraOption) => {
          customizations.push({
            id: e.id,
            name: e.name,
            selected: true,
            price: e.price
          });
        });
      
      // Add special instructions if any
      if (result.specialInstructions) {
        customizations.push({
          id: 9999,
          name: `Note: ${result.specialInstructions}`,
          selected: true,
          price: 0
        });
      }
      
      // Return cart item
      return {
        ...result.item,
        quantity: result.quantity,
        customizations,
        totalPrice: result.totalPrice,
        timestamp: Date.now()
      };
    }
  };
};

// Export the store
export const customizationStore = createStore();
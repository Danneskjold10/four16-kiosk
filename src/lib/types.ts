// Define the type interfaces in a regular TypeScript file instead of a declaration file
export interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
}

export interface MenuCategory {
    id: number;
    category: string;
    icon: string;
    imageUrl?: string;
    items: MenuItem[];
}

export interface CartItem extends MenuItem {
    quantity: number;
    customizations?: Customization[];
    isComboItem?: boolean;
    mainItemId?: number;  // Reference to the main item if this is part of a combo
    timestamp?: number;   // Added for reactivity tracking
    index?: number;       // Added for editing
}

export interface Customization {
    id: number;
    name: string;
    selected: boolean;
    price?: number;
}

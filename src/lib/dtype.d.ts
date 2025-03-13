declare namespace F16 {
    interface MenuItem {
        id: number;
        name: string;
        description: string;
        price: number;
        image: string;
    }

    interface MenuCategory {
        id: number;
        category: string;
        icon: string;
        imageUrl?: string;
        items: MenuItem[];
    }

    interface CartItem extends MenuItem {
        quantity: number;
        customizations?: Customization[];
        isComboItem?: boolean;
        mainItemId?: number;  // Reference to the main item if this is part of a combo
        timestamp?: number;   // Added for reactivity tracking
    }
}
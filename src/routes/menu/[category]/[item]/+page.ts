import { menuItems } from "$lib/items";
import type { MenuItem } from "$lib/types";

export const load = async ({ params }: { params: { category: string; item: string } }) => {
    const category = menuItems.find(c => c.category === params.category);
    
    if (!category) {
        return { item: null, categoryName: params.category };
    }
    
    // Find the item by name (URL-decoded)
    const itemName = decodeURIComponent(params.item);
    const item = category.items.find(i => i.name === itemName);
    
    return { 
        item,
        categoryName: params.category
    };
};
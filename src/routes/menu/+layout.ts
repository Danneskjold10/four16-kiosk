import type { LayoutLoad } from './$types';
import { menuItems } from "$lib/items";

export const load: LayoutLoad = async () => {
    let categories: string[] = [];
    for (let c of menuItems) {
        categories.push(c.category)
    }
    return { categories };
};
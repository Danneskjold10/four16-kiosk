import type { LayoutLoad } from './$types';
import { menuItems } from "$lib/items";

export const load: LayoutLoad = async ({ params }) => {
    let meals = menuItems.filter((c) => c.category == params.category)[0].items
    return {
        meals
    };
};
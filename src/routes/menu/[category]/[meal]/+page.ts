import type { PageLoad } from './$types';
import { menuItems } from "$lib/items";

export const load: PageLoad = async ({ params }) => {
    let meals: F16.MenuItem[] = menuItems.filter((c) => c.category == params.category)[0].items
    let item: F16.MenuItem = meals.filter((m) => m.name == params.meal)[0]
    return { item };
};
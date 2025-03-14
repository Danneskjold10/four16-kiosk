import type { LayoutLoad } from './$types';
import { menuItems } from "$lib/items";

export const load: LayoutLoad = async () => {
    return { menuItems };
};
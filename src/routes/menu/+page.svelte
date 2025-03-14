<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { menuItems } from "$lib/items";

    // Redirect to /menu/Burgers when this page loads
    onMount(() => {
        // Default to Burgers, or the first category if Burgers doesn't exist
        const defaultCategory = menuItems.find(item => item.category === "Burgers")?.category || 
                               (menuItems.length > 0 ? menuItems[0].category : "Burgers");
        
        goto(`/menu/${defaultCategory}`, { replaceState: true });
    });
</script>

<div class="flex justify-center items-center min-h-screen">
    <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading menu...</p>
    </div>
</div>
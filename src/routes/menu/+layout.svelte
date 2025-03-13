<script lang="ts">
    let { children } = $props();
</script>

<div class="flex flex-col w-full h-full">
    <div class="flex-1">
        {@render children()}
    </div>
    <div class="bg-red-500 navbar">
        <p class="flex-1">Cart Overview</p>
        <a href="/checkout">Go to Checkout</a>
    </div>
</div>

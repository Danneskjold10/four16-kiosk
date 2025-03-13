<script lang="ts">
    import { goto } from "$app/navigation";

    let dining_option: string = $state("eat_here");
</script>

<h1>Welcome to Kiosk</h1>
<div>
    <button
        class="btn btn-lg"
        onclick={() => {
            dining_option = "eat_here";
            goto("/menu");
        }}>Eat Here</button
    >
    <button
        class="btn btn-lg"
        onclick={() => {
            dining_option = "take_away";
            goto("/menu");
        }}>Take Away</button
    >
</div>

<script lang="ts">
    import "../app.css";

    let { children } = $props();
</script>

<main class="flex flex-col w-lvw h-lvh">
    <div class="navbar justify-end bg-amber-700">
        <select class="select select-ghost">
            <option disabled selected>Choose Language</option>
            <option>Deutsch</option>
            <option>English</option>
            <option>Francais</option>
        </select>
    </div>
    <div class="flex-1 bg-amber-300 flex flex-col items-center justify-center">
        {@render children()}
    </div>
</main>

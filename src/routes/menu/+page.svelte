<script lang="ts">
    let { data } = $props();
</script>

<div class="grid grid-cols-3 gap-12 p-12">
    {#each data.categories as category}
        <div class="card bg-base-200">
            <a class="card-body" href="/menu/{category}">
                {category}
            </a>
        </div>
    {/each}
</div>

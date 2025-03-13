<script lang="ts">
    import { goto, preloadData, pushState } from "$app/navigation";
    import { page } from "$app/state";
    import MealPage from "./[meal]/+page.svelte";
    import Modal from "$lib/Modal.svelte";

    let { data } = $props();

    async function shallow_call(
        e: MouseEvent & {
            currentTarget: EventTarget & HTMLAnchorElement;
        },
    ) {
        e.preventDefault();
        const { href } = e.currentTarget;
        const result = await preloadData(href);
        if (result.type === "loaded" && result.status === 200) {
            pushState(href, { modalOpen: true, selected: result.data });
        } else {
            goto(href);
        }
    }
</script>

<div class="grid grid-cols-3 gap-12 p-12">
    {#each data.meals as meal}
        <div class="card bg-base-200">
            <a
                class="card-body"
                onclick={shallow_call}
                href="{page.url.pathname}/{meal.name}"
            >
                {meal.name}
            </a>
        </div>
    {/each}
</div>

{#if page.state.selected}
    <Modal>
        <MealPage data={page.state.selected} />
    </Modal>
{/if}

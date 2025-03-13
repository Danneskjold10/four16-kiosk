<script lang="ts">
    import type { Snippet } from "svelte";
    import { page } from "$app/state";

    let modal: HTMLDialogElement | undefined = $state();
    let modalOpen = $derived(page.state.modalOpen);
    let { children }: { children: Snippet } = $props();

    $effect(() => {
        if (modalOpen) {
            modal!.showModal();
        } else {
            modal!.close();
        }
    });
</script>

<dialog id="modal" class="modal" bind:this={modal}>
    <div class="modal-box bg-base-200 relative">
        {@render children()}
        <button
            class="absolute top-2 right-2 btn btn-sm btn-circle font-bold"
            onclick={() => history.back()}>X</button
        >
    </div>
</dialog>

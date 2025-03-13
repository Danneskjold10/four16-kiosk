<script lang="ts">
    let { data } = $props();
</script>

<div class="list">
    <div class="list-item">{data.item.id}</div>
    <div class="list-item">{data.item.name}</div>
    <div class="list-item">{data.item.description}</div>
    <div class="list-item">{data.item.price}</div>
</div>
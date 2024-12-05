<script lang="ts">
  import { page } from '$app/stores';
  import { get } from 'svelte/store';
  import Map from "$lib/components/Map.svelte";
  import Footer from "$lib/components/Footer.svelte";

  const p = get(page);
  const id = p.params.slug;
</script>

<Map { id }/>
<Footer />
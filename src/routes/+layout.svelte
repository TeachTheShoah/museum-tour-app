<script lang="ts">
  import '../app.css';
	import type { PageData } from './$types';
  import type { Snippet } from 'svelte';
	let { children }: { children: Snippet} = $props();
</script>

{@render children()}
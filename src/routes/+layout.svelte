<script lang="ts">
  import '../app.css';
	import type { PageData } from './$types';
  import type { Snippet } from 'svelte';
	let { data, children }: { data: PageData, children: Snippet} = $props();
	const title = data?.seo?.title || 'SWIGGI Holocaust Museum Tour';
	const description = data?.seo?.description || 'An interactive Holocaust museum tour guide app for Vienna, Austria. \
	Part of a collaborative effort betweeen SWIGGI and Teach the Shoah.';
	import '../app.css';
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content="website" />
</svelte:head>

{@render children()}
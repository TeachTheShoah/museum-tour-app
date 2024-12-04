<script lang="ts">
  import HeroImage from '$lib/assets/hero-image.jpg'
  import Seo from '$lib/components/Seo.svelte'
  import Navbar from '$lib/components/Navbar.svelte'
  import Tour from '$lib/components/Tour.svelte'
  import About from '$lib/components/About.svelte'
  import Footer from '$lib/components/Footer.svelte'
  let innerWidth = $state(390);
</script>

<Seo
  title="SWIGGI Holocaust Museum Tour"
  description="An interactive Holocaust museum tour guide app for Vienna, Austria. \
Part of a collaborative effort betweeen SWIGGI and Teach the Shoah."
/>

<svelte:window bind:innerWidth/>

<div class="relative flex flex-col" >
  <!-- Header -->
  <Navbar {innerWidth}/>
  <div class="flex-grow">
    <Tour
      {innerWidth}
    />
    <About image={HeroImage}/>
  </div>
  <Footer />
</div>





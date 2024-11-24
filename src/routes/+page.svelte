<script lang="ts">
  import HeroImage from '$lib/assets/hero-image.jpg'
  import Zone1Cover from '$lib/assets/zone-1-cover.jpg'
  import Zone1CoverBW from '$lib/assets/zone-1-cover-bw.jpg'
  import Zone2Cover from '$lib/assets/zone-2-cover.jpg'
  import Zone2CoverBW from '$lib/assets/zone-2-cover-bw.jpg'
  import Navbar from '$lib/Navbar.svelte'
  import Tour from '$lib/Tour.svelte'
  import About from '$lib/About.svelte'
  import Footer from '$lib/Footer.svelte'
</script>

<div class="relative flex flex-col" >
  <!-- Header -->
  <Navbar/>
  <div class="flex-grow">
    <Tour
      tours={[
        {
          title: 'District 2 Tour:',
          subtitle: 'Leopoldstadt',
          dateRange: 'Available Now',
          href: '/',
          image: Zone2CoverBW,
          hoverImage: Zone2Cover,
          hoverBackgroundColor: '#5e96ff',
        },
        {
          title: 'District 1 Tour:',
          subtitle: 'Inner Stadt',
          dateRange: 'Coming Soon...',
          href: '/',
          image: Zone1CoverBW,
          hoverImage: Zone1Cover,
          hoverBackgroundColor: '#6bdcc5',
        },
      ]}
    />
    <About image={HeroImage}/>
  </div>
  <Footer />
</div>





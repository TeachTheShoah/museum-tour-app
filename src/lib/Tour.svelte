<script lang="ts">
  export let tours: Array<{
    title: string;
    subtitle: string;
    dateRange: string;
    href: string;
    image: string;
    hoverImage: string;
    hoverBackgroundColor: string;
  }>;
  
</script>

<div class="grid border-t border-b border-black divide-y divide-black">
  {#each tours as tour, index}
    <div
      class="flex h-[calc(25vh)] lg:h-[calc(35vh)] group transition-colors duration-500 ease-in-out"
      style="--hover-bg-color: {tour.hoverBackgroundColor};"
    >
      <!-- Link Wrapper -->
      <a
        href={tour.href}
        class="flex items-center w-full text-black group-hover:text-white group-active:text-white group-hover:bg-[var(--hover-bg-color)] group-active:bg-[var(--hover-bg-color)]"
      >
        {#if index % 2 === 1}
          <div class="h-full w-1/2 lg:w-3/5 relative">
            <img
              src={tour.image}
              alt="{tour.title}"
              class="w-full h-full object-cover group-hover:opacity-0 group-active:opacity-0"
              loading="lazy"
            />
            <img
              src={tour.hoverImage}
              alt="{tour.title}"
              class="w-full h-full object-cover absolute top-0 left-0 opacity-0 group-active:opacity-100 group-hover:opacity-100"
              loading="lazy"
            />
          </div>

          <div
            class="w-1/2 lg:w-2/5 h-full px-8 lg:px-16 flex-shrink-0 group-active:border-0 group-hover:border-0 border-s-2 border-black"
          >
            <div class="flex flex-col justify-between h-full">
              <!-- Title -->
              <h3 class="text-base text-2xl lg:text-4xl font-bold mt-8 lg:mt-20">
                <p>{tour.title}</p>
                {#if tour.subtitle}
                  <p class="italic text-2xl lg:text-4xl">{tour.subtitle}</p>
                {/if}
              </h3>
              <div class="mb-8 lg:mb-20 font-bold text-2xl lg:text-2xl text-gray-600">
                <p>{tour.dateRange}</p>
              </div>
            </div>
          </div>
        {:else}
          <div
            class="w-1/2 lg:w-2/5 h-full px-8 md:px-16 lg:px-32 flex-shrink-0 group-active:border-0 group-hover:border-0 border-e-2 border-black"
          >
            <div class="flex flex-col justify-between h-full">
              <!-- Title -->
              <h3 class="text-base text-2xl lg:text-4xl font-bold mt-8 lg:mt-20">
                <p>{tour.title}</p>
                {#if tour.subtitle}
                  <p class="italic text-2xl lg:text-4xl">{tour.subtitle}</p>
                {/if}
              </h3>

              <!-- Date Range -->
              <div class="mb-8 lg:mb-20 font-bold text-2xl lg:text-2xl text-gray-600">
                <p>{tour.dateRange}</p>
              </div>
            </div>
          </div>

          <!-- Right Section: Image -->
          <div class="h-full w-1/2 lg:w-3/5 relative">
            <img
              src={tour.image}
              alt="{tour.title}"
              class="w-full h-full object-cover group-hover:opacity-0 group-active:opacity-0"
              loading="lazy"
            />
            <img
              src={tour.hoverImage}
              alt="{tour.title}"
              class="w-full h-full object-cover absolute top-0 left-0 opacity-0 group-active:opacity-100 group-hover:opacity-100"
              loading="lazy"
            />
          </div>
        {/if}
      </a>
    </div>
  {/each}
</div>

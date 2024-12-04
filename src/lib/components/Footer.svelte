<script lang="ts">
  let links = [
    {
      href: "/",
      ariaLabel: "Home",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="shrink-0 w-6 h-6 lg:w-8 lg:h-8 mb-1 text-gray-500 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400" viewBox="0 0 24 24">
        <path fill-rule="evenodd" d="M11.293 3.293a1 1 0 0 1 1.414 0l6 6 2 2a1 1 0 0 1-1.414 1.414L19 12.414V19a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-3h-2v3a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-6.586l-.293.293a1 1 0 0 1-1.414-1.414l2-2 6-6Z" clip-rule="evenodd"></path>
      </svg>`,
    },
    {
      href: "/",
      ariaLabel: "Tour",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="shrink-0 w-6 h-6 lg:w-8 lg:h-8 mb-1 text-gray-500 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400" viewBox="0 0 24 24">
        <path fill-rule="evenodd" d="M11.906 1.994a8.002 8.002 0 0 1 8.09 8.421 7.996 7.996 0 0 1-1.297 3.957.996.996 0 0 1-.133.204l-.108.129c-.178.243-.37.477-.573.699l-5.112 6.224a1 1 0 0 1-1.545 0L5.982 15.26l-.002-.002a18.146 18.146 0 0 1-.309-.38l-.133-.163a.999.999 0 0 1-.13-.202 7.995 7.995 0 0 1 6.498-12.518ZM15 9.997a3 3 0 1 1-5.999 0 3 3 0 0 1 5.999 0Z" clip-rule="evenodd"></path>
      </svg>`,
    },
    {
      href: "https://www.teachtheshoah.org/",
      ariaLabel: "Teach the Shoah",
      target: "_blank",
      rel: "noopener noreferrer",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="shrink-0 w-6 h-6 lg:w-8 lg:h-8 mb-1 text-gray-500 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400" viewBox="0 0 24 24">
        <path fill-rule="evenodd" d="M11.403 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6.403a3.01 3.01 0 0 1-1.743-1.612l-3.025 3.025A3 3 0 1 1 9.99 9.768l3.025-3.025A3.01 3.01 0 0 1 11.403 5Z" clip-rule="evenodd"></path>
        <path fill-rule="evenodd" d="M13.232 4a1 1 0 0 1 1-1H20a1 1 0 0 1 1 1v5.768a1 1 0 1 1-2 0V6.414l-6.182 6.182a1 1 0 0 1-1.414-1.414L17.586 5h-3.354a1 1 0 0 1-1-1Z" clip-rule="evenodd"></path>
      </svg>`,
    },
  ];
</script>

<footer
  class="w-full mt-auto bg-white border-t border-gray-200 z-50 pb-1 lg:pb-0"
>
  <div class="grid h-full max-w-lg mx-auto grid-cols-3 lg:gap-x-64">
    {#each links as link}
      <a
        href={link.href}
        aria-label={link.ariaLabel}
        class="group flex items-center justify-center px-5 py-3 lg:py-5 hover:bg-gray-50"
        target={link.target}
        rel={link.rel}
      >
        {@html link.icon}
      </a>
    {/each}
  </div>
</footer>


<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let dots = '....';
  let interval: ReturnType<typeof setInterval>;

  // Start the animation
  function startAnimation() {
    let count = 0;
    interval = setInterval(() => {
      count = (count % 4) + 1; // Cycle through 1 to 4
      dots = '.'.repeat(count);
    }, 500); // Adjust interval speed as needed
  }

  // Stop the animation
  function stopAnimation() {
    clearInterval(interval);
    dots = '....';
  }

  onMount(() => startAnimation());
  // Cleanup on component destroy
  onDestroy(() => stopAnimation());
</script>

<span>{dots}</span>

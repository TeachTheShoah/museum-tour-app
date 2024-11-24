import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
  server: {
    proxy: {
      '/maps-api': {
        target: 'https://maps.googleapis.com', // Google Maps API base URL
        changeOrigin: true, // Ensure the Host header matches the target
        rewrite: (path) => path.replace(/^\/maps-api/, ''), // Remove /maps-api prefix
      },
    },
  },
	define: {
		'process.env': process.env
	},
	resolve: process.env.VITEST
	? {
			conditions: ['browser']
		}
	: undefined
});

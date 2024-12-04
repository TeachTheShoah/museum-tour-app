import aspectRatio from '@tailwindcss/aspect-ratio';
import containerQueries from '@tailwindcss/container-queries';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import flowbitePlugin from 'flowbite/plugin'
import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'],
	darkMode: 'selector',
  theme: {
    extend: {
      fontFamily: {
        fette: ["Fette Fraktur"],
        gothic: ["News Gothic"],
      },
      colors: {
        bg: {
          dark: '#EAF0F5', // Soft grayish-blue background
          light: '#F5F5F5', // Muted white background
        }
      }
    }
  },

	plugins: [flowbitePlugin, typography, forms, containerQueries, aspectRatio]
} satisfies Config;
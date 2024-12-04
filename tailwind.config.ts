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
        primary: {
          50: '#F5F9FC',
          100: '#EBF3FA',
          200: '#D6E7F5',
          300: '#B7D3ED',
          400: '#8BB8E2',
          500: '#5C9DCE',
          600: '#4A86B4',
          700: '#3A6D96',
          800: '#2B5578',
          900: '#1E3C57',
        },
        bg: {
          dark: '#EAF0F5', // Soft grayish-blue background
          light: '#F5F5F5', // Muted white background
        }
      }
    }
  },

	plugins: [flowbitePlugin, typography, forms, containerQueries, aspectRatio]
} satisfies Config;
/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./index.html",
	  	"./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
	},
	variants: {
	  backgroundColor: ['responsive', 'focus', 'active', 'hover']
  },
  plugins: [],
}


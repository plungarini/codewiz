/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
		extend: {
			screens: {
				'xs': '490px',
			}
		},
  },
  plugins: [
		require('@tailwindcss/forms'),
	],
}
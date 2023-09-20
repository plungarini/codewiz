export const checkbox = (checked: boolean) => `
	<input type="checkbox" disabled ${checked ? 'checked ' : ''}class="h-4 w-4 bg-zinc-800 focus:ring-offset-zinc-950 mr-2 transition-all duration-300 rounded border-zinc-600 text-indigo-600 focus:ring-indigo-600">
`.trim();
export const table = (header: string, body: string) => `
	<table class="my-4 rounded-md overflow-hidden bg-zinc-950 w-full shadow-md">
		<thead class="bg-zinc-800 empty:hidden text-sm md:text-base">${header}</thead>
		<tbody>${body}</tbody>
	</table>
`.trim();

export const tablecell = (content: string, flags: { header: boolean; align: "center" | "left" | "right" | null; }) => `
	<${flags.header ? 'th' : 'td'} align="${flags.align}" class="${flags.header ? 'text-zinc-200 text-sm md:text-base font-normal empty:hidden' : 'text-zinc-400'} px-4 truncate py-2">${content}</${flags.header ? 'th' : 'td'}>
`.trim();

export const tablerow = (content: string) => `
	<tr class="empty:hidden text-sm md:text-base">${content}</tr>
`.trim();
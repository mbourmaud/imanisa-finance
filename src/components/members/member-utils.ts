export function getInitials(name: string): string {
	return name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2)
}

export function getContrastColor(bgColor: string): string {
	const hex = bgColor.replace('#', '')
	const r = Number.parseInt(hex.substring(0, 2), 16)
	const g = Number.parseInt(hex.substring(2, 4), 16)
	const b = Number.parseInt(hex.substring(4, 6), 16)

	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

	return luminance > 0.5 ? '#000000' : '#ffffff'
}

const defaultMemberColors = [
	'#6366f1', // Indigo
	'#f43f5e', // Rose
	'#10b981', // Emerald
	'#f59e0b', // Amber
	'#8b5cf6', // Violet
	'#06b6d4', // Cyan
	'#ec4899', // Pink
	'#14b8a6', // Teal
]

export function getDefaultColor(index: number): string {
	return defaultMemberColors[index % defaultMemberColors.length]
}

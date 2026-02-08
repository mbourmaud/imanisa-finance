export function formatTransactionDate(date: Date | string): string {
	const dateObj = typeof date === 'string' ? new Date(date) : date
	const today = new Date()
	const yesterday = new Date(today)
	yesterday.setDate(yesterday.getDate() - 1)

	if (dateObj.toDateString() === today.toDateString()) {
		return "Aujourd'hui"
	}
	if (dateObj.toDateString() === yesterday.toDateString()) {
		return 'Hier'
	}
	return new Intl.DateTimeFormat('fr-FR', {
		day: 'numeric',
		month: 'short',
	}).format(dateObj)
}

export function getRelativeDate(date: Date | string): string {
	const dateObj = typeof date === 'string' ? new Date(date) : date
	return new Intl.DateTimeFormat('fr-FR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	}).format(dateObj)
}

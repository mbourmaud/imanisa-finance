import { HttpResponse, http } from 'msw';

export const handlers = [
	http.get('/api/accounts', () => {
		return HttpResponse.json([{ id: '1', name: 'Compte Courant', balance: 1500, currency: 'EUR' }]);
	}),
	http.get('/api/categories', () => {
		return HttpResponse.json([
			{ id: '1', name: 'Alimentation', icon: '🍔', color: '#FF5733', parentId: null },
		]);
	}),
];

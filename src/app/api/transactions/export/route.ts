/**
 * Transaction Export API Route
 * GET /api/transactions/export - Export filtered transactions as CSV
 */

import { type NextRequest, NextResponse } from 'next/server'
import type { TransactionType } from '@/lib/prisma'
import { type TransactionFilters, transactionRepository } from '@/server/repositories'

function formatDate(date: Date): string {
	const d = new Date(date)
	return d.toLocaleDateString('fr-FR', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	})
}

function formatAmount(amount: number): string {
	return amount.toFixed(2).replace('.', ',')
}

function escapeCsvField(value: string): string {
	if (value.includes(';') || value.includes('"') || value.includes('\n')) {
		return `"${value.replace(/"/g, '""')}"`
	}
	return value
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)

		const filters: TransactionFilters = {}

		const accountId = searchParams.get('accountId')
		if (accountId) filters.accountId = accountId

		const memberId = searchParams.get('memberId')
		if (memberId) filters.memberId = memberId

		const type = searchParams.get('type')
		if (type) filters.type = type as TransactionType

		const categoryId = searchParams.get('categoryId')
		if (categoryId) filters.categoryId = categoryId

		const startDate = searchParams.get('startDate')
		if (startDate) filters.startDate = new Date(startDate)

		const endDate = searchParams.get('endDate')
		if (endDate) filters.endDate = new Date(endDate)

		const search = searchParams.get('search')
		if (search) filters.search = search

		const excludeInternal = searchParams.get('excludeInternal')
		if (excludeInternal === 'true') filters.excludeInternal = true

		// Fetch all matching transactions (no pagination limit)
		const result = await transactionRepository.getAll(filters, { page: 1, pageSize: 10000 })

		const header = 'Date;Description;Montant;Type;Catégorie;Compte;Banque'
		const rows = result.items.map((tx) => {
			const date = formatDate(tx.date)
			const description = escapeCsvField(tx.description)
			const amount = formatAmount(tx.amount)
			const txType = tx.type === 'INCOME' ? 'Revenu' : 'Dépense'
			const category = tx.transactionCategory?.category?.name ?? ''
			const account = escapeCsvField(tx.account.name)
			const bank = escapeCsvField(tx.account.bank.name)

			return `${date};${description};${amount};${txType};${category};${account};${bank}`
		})

		// BOM for Excel UTF-8 compatibility
		const bom = '\uFEFF'
		const csv = bom + [header, ...rows].join('\n')

		return new NextResponse(csv, {
			status: 200,
			headers: {
				'Content-Type': 'text/csv; charset=utf-8',
				'Content-Disposition': 'attachment; filename=transactions-export.csv',
			},
		})
	} catch (error) {
		console.error('Error exporting transactions:', error)
		return NextResponse.json(
			{ error: 'Impossible d\'exporter les transactions' },
			{ status: 500 },
		)
	}
}

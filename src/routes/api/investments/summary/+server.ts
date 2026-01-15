import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { InvestmentRepositoryImpl } from '@infrastructure/repositories/InvestmentRepository';

const investmentRepository = new InvestmentRepositoryImpl();

export const GET: RequestHandler = async () => {
	const summary = await investmentRepository.getInvestmentSummary();

	return json({
		total_invested: summary.totalInvested,
		current_value: summary.currentValue,
		total_gain_loss: summary.totalGainLoss,
		total_gain_loss_percent: summary.totalGainLossPercent
	});
};

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';

	Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

	interface Props {
		data: { label: string; value: number; color: string }[];
		title?: string;
	}

	let { data, title }: Props = $props();
	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	onMount(() => {
		createChart();
	});

	onDestroy(() => {
		chart?.destroy();
	});

	$effect(() => {
		if (chart && data) {
			chart.data.labels = data.map((d) => d.label);
			chart.data.datasets[0].data = data.map((d) => d.value);
			chart.data.datasets[0].backgroundColor = data.map((d) => d.color);
			chart.update();
		}
	});

	function createChart() {
		if (!canvas) return;

		chart = new Chart(canvas, {
			type: 'doughnut',
			data: {
				labels: data.map((d) => d.label),
				datasets: [{
					data: data.map((d) => d.value),
					backgroundColor: data.map((d) => d.color),
					borderWidth: 0,
					hoverOffset: 4
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				cutout: '65%',
				plugins: {
					legend: {
						position: 'bottom',
						labels: {
							padding: 16,
							usePointStyle: true,
							pointStyle: 'circle'
						}
					},
					tooltip: {
						callbacks: {
							label: (context) => {
								const value = context.parsed;
								return `${context.label}: ${value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`;
							}
						}
					}
				}
			}
		});
	}
</script>

<div class="chart-container">
	{#if title}
		<h3 class="chart-title">{title}</h3>
	{/if}
	<div class="chart-wrapper">
		<canvas bind:this={canvas}></canvas>
	</div>
</div>

<style>
	.chart-container {
		background: var(--glass-bg);
		backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
		-webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
		border-radius: var(--radius-2xl);
		padding: var(--spacing-6);
		box-shadow: var(--shadow-glass);
		border: 1px solid var(--glass-border);
		transition: 
			transform var(--transition-normal),
			box-shadow var(--transition-normal);
	}

	.chart-container:hover {
		box-shadow: var(--shadow-glass-hover);
	}

	.chart-title {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		margin-bottom: var(--spacing-5);
		color: var(--color-gray-800);
		letter-spacing: -0.01em;
	}

	.chart-wrapper {
		height: 280px;
		position: relative;
	}

	@media (max-width: 768px) {
		.chart-container {
			padding: var(--spacing-4);
			border-radius: var(--radius-xl);
		}

		.chart-wrapper {
			height: 240px;
		}
	}

	@media (max-width: 480px) {
		.chart-wrapper {
			height: 220px;
		}
	}

	@media (max-width: 375px) {
		.chart-container {
			padding: var(--spacing-3);
		}

		.chart-wrapper {
			height: 200px;
		}
	}
</style>

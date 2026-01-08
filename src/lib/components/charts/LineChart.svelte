<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler } from 'chart.js';

	Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler);

	interface Dataset {
		label: string;
		data: number[];
		color: string;
		fill?: boolean;
	}

	interface Props {
		labels: string[];
		datasets: Dataset[];
		title?: string;
	}

	let { labels, datasets, title }: Props = $props();
	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	onMount(() => {
		createChart();
	});

	onDestroy(() => {
		chart?.destroy();
	});

	$effect(() => {
		if (chart && labels && datasets) {
			chart.data.labels = labels;
			chart.data.datasets = datasets.map((ds) => ({
				label: ds.label,
				data: ds.data,
				borderColor: ds.color,
				backgroundColor: ds.fill ? `${ds.color}20` : 'transparent',
				fill: ds.fill ?? false,
				tension: 0.3,
				pointRadius: 3,
				pointHoverRadius: 6
			}));
			chart.update();
		}
	});

	function createChart() {
		if (!canvas) return;

		chart = new Chart(canvas, {
			type: 'line',
			data: {
				labels,
				datasets: datasets.map((ds) => ({
					label: ds.label,
					data: ds.data,
					borderColor: ds.color,
					backgroundColor: ds.fill ? `${ds.color}20` : 'transparent',
					fill: ds.fill ?? false,
					tension: 0.3,
					pointRadius: 3,
					pointHoverRadius: 6
				}))
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					intersect: false,
					mode: 'index'
				},
				scales: {
					y: {
						beginAtZero: false,
						ticks: {
							callback: (value) => {
								if (typeof value === 'number') {
									return value >= 1000 ? `${(value / 1000).toFixed(0)}k€` : `${value}€`;
								}
								return value;
							}
						},
						grid: {
							color: '#E5E7EB'
						}
					},
					x: {
						grid: {
							display: false
						}
					}
				},
				plugins: {
					legend: {
						position: 'top',
						align: 'end',
						labels: {
							usePointStyle: true,
							pointStyle: 'circle'
						}
					},
					tooltip: {
						callbacks: {
							label: (context) => {
								const value = context.parsed.y ?? 0;
								return `${context.dataset.label ?? ''}: ${value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`;
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
		height: 300px;
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
			height: 200px;
		}
	}

	@media (max-width: 375px) {
		.chart-container {
			padding: var(--spacing-3);
		}

		.chart-wrapper {
			height: 180px;
		}
	}
</style>

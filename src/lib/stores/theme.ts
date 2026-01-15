/**
 * Theme store for managing dark/light mode with system preference support
 *
 * Features:
 * - Respects prefers-color-scheme system default
 * - Persists user choice in localStorage
 * - Updates document.documentElement.classList and color-scheme
 * - Updates theme-color meta tag dynamically
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const THEME_KEY = 'imanisa-theme';

// Theme colors for meta tag
const THEME_COLORS = {
	light: '#FFFFFF',
	dark: '#FA8072'
} as const;

/**
 * Gets the system color scheme preference
 */
function getSystemTheme(): ResolvedTheme {
	if (!browser) return 'dark';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Gets the initial theme from localStorage or defaults to 'system'
 */
function getInitialTheme(): Theme {
	if (!browser) return 'system';

	const stored = localStorage.getItem(THEME_KEY);
	if (stored === 'light' || stored === 'dark' || stored === 'system') {
		return stored;
	}
	return 'system';
}

/**
 * Resolves the theme to either 'light' or 'dark'
 */
function resolveTheme(theme: Theme): ResolvedTheme {
	if (theme === 'system') {
		return getSystemTheme();
	}
	return theme;
}

/**
 * Applies the theme to the document
 */
function applyTheme(resolved: ResolvedTheme): void {
	if (!browser) return;

	const html = document.documentElement;

	// Update class
	html.classList.remove('light', 'dark');
	html.classList.add(resolved);

	// Update color-scheme CSS property for native element styling
	html.style.colorScheme = resolved;

	// Update theme-color meta tag
	const themeColorMeta = document.querySelector('meta[name="theme-color"]');
	if (themeColorMeta) {
		themeColorMeta.setAttribute('content', THEME_COLORS[resolved]);
	}
}

// Create the theme store
function createThemeStore() {
	const initialTheme = getInitialTheme();
	const { subscribe, set, update } = writable<Theme>(initialTheme);

	// Apply initial theme
	if (browser) {
		applyTheme(resolveTheme(initialTheme));

		// Listen for system preference changes
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQuery.addEventListener('change', () => {
			// Only re-apply if using system theme
			update((currentTheme) => {
				if (currentTheme === 'system') {
					applyTheme(getSystemTheme());
				}
				return currentTheme;
			});
		});
	}

	return {
		subscribe,

		/**
		 * Set the theme and persist to localStorage
		 */
		setTheme(theme: Theme) {
			set(theme);
			if (browser) {
				localStorage.setItem(THEME_KEY, theme);
				applyTheme(resolveTheme(theme));
			}
		},

		/**
		 * Toggle between light and dark (skips system)
		 */
		toggle() {
			update((current) => {
				const resolved = resolveTheme(current);
				const next: Theme = resolved === 'dark' ? 'light' : 'dark';
				if (browser) {
					localStorage.setItem(THEME_KEY, next);
					applyTheme(next);
				}
				return next;
			});
		},

		/**
		 * Reset to system preference
		 */
		reset() {
			set('system');
			if (browser) {
				localStorage.removeItem(THEME_KEY);
				applyTheme(getSystemTheme());
			}
		},

		/**
		 * Get the resolved theme (light or dark)
		 */
		getResolved(): ResolvedTheme {
			return resolveTheme(getInitialTheme());
		}
	};
}

export const theme = createThemeStore();

/**
 * Derived store for the resolved theme (always 'light' or 'dark')
 */
export function getResolvedTheme(themeValue: Theme): ResolvedTheme {
	return resolveTheme(themeValue);
}

/**
 * CSV Encoding Detection & Decoding
 *
 * Auto-detects encoding (UTF-8 vs Windows-1252) for French bank CSV files.
 * French banks historically export in Windows-1252 but modern exports may use UTF-8.
 *
 * Strategy:
 * 1. Check for UTF-8 BOM (0xEF 0xBB 0xBF)
 * 2. Validate UTF-8 byte sequences
 * 3. Fallback to Windows-1252 (standard for French bank CSVs)
 */

/**
 * Check if bytes start with UTF-8 BOM
 */
function hasUtf8Bom(bytes: Uint8Array): boolean {
	return bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf
}

/**
 * Check if the bytes form valid UTF-8.
 * Scans the first ~4KB for invalid sequences.
 */
function isValidUtf8(bytes: Uint8Array): boolean {
	const limit = Math.min(bytes.length, 4096)
	let i = 0

	while (i < limit) {
		const byte = bytes[i]

		if (byte <= 0x7f) {
			// ASCII
			i++
		} else if ((byte & 0xe0) === 0xc0) {
			// 2-byte sequence
			if (i + 1 >= bytes.length || (bytes[i + 1] & 0xc0) !== 0x80) return false
			i += 2
		} else if ((byte & 0xf0) === 0xe0) {
			// 3-byte sequence
			if (
				i + 2 >= bytes.length ||
				(bytes[i + 1] & 0xc0) !== 0x80 ||
				(bytes[i + 2] & 0xc0) !== 0x80
			)
				return false
			i += 3
		} else if ((byte & 0xf8) === 0xf0) {
			// 4-byte sequence
			if (
				i + 3 >= bytes.length ||
				(bytes[i + 1] & 0xc0) !== 0x80 ||
				(bytes[i + 2] & 0xc0) !== 0x80 ||
				(bytes[i + 3] & 0xc0) !== 0x80
			)
				return false
			i += 4
		} else if (byte > 0x7f) {
			// Byte > 127 that doesn't start a valid multi-byte sequence → not valid UTF-8
			// This catches Windows-1252 characters like 0xB0 (°), 0xE9 (é) used as single bytes
			return false
		} else {
			i++
		}
	}

	return true
}

/**
 * Decode an ArrayBuffer to string with auto-detected encoding.
 * Prefers UTF-8 if valid, falls back to Windows-1252.
 */
export function decodeCsvBuffer(buffer: ArrayBuffer, preferredEncoding?: string): string {
	const bytes = new Uint8Array(buffer)

	// 1. UTF-8 BOM → definitely UTF-8
	if (hasUtf8Bom(bytes)) {
		return new TextDecoder('utf-8').decode(buffer)
	}

	// 2. Valid UTF-8 sequences (with non-ASCII chars) → UTF-8
	if (isValidUtf8(bytes)) {
		// Check if there are actually non-ASCII bytes; if all ASCII, encoding doesn't matter
		const hasNonAscii = bytes.some((b) => b > 0x7f)
		if (hasNonAscii) {
			return new TextDecoder('utf-8').decode(buffer)
		}
		// All ASCII — encoding doesn't matter, use UTF-8
		return new TextDecoder('utf-8').decode(buffer)
	}

	// 3. Not valid UTF-8 → use preferred encoding or Windows-1252
	const encoding = preferredEncoding ?? 'windows-1252'
	return new TextDecoder(encoding).decode(buffer)
}

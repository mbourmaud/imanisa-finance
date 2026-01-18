import * as v from 'valibot'
import { describe, expect, it } from 'vitest'
import { profileFormSchema, type ProfileFormValues } from '../profile-form-schema'

describe('profileFormSchema', () => {
	describe('valid inputs', () => {
		it('should accept valid name and email', () => {
			const validData: ProfileFormValues = {
				name: 'Jean Dupont',
				email: 'jean@example.com',
			}

			const result = v.safeParse(profileFormSchema, validData)
			expect(result.success).toBe(true)
		})

		it('should accept minimal valid name', () => {
			const validData: ProfileFormValues = {
				name: 'A',
				email: 'a@b.co',
			}

			const result = v.safeParse(profileFormSchema, validData)
			expect(result.success).toBe(true)
		})
	})

	describe('name validation', () => {
		it('should reject empty name', () => {
			const invalidData = {
				name: '',
				email: 'test@example.com',
			}

			const result = v.safeParse(profileFormSchema, invalidData)
			expect(result.success).toBe(false)
			if (!result.success) {
				const nameError = result.issues.find((issue) => issue.path?.[0]?.key === 'name')
				expect(nameError?.message).toBe('Le nom est requis')
			}
		})

		it('should reject name exceeding 100 characters', () => {
			const invalidData = {
				name: 'A'.repeat(101),
				email: 'test@example.com',
			}

			const result = v.safeParse(profileFormSchema, invalidData)
			expect(result.success).toBe(false)
			if (!result.success) {
				const nameError = result.issues.find((issue) => issue.path?.[0]?.key === 'name')
				expect(nameError?.message).toBe('Le nom ne peut pas dépasser 100 caractères')
			}
		})

		it('should accept name with exactly 100 characters', () => {
			const validData = {
				name: 'A'.repeat(100),
				email: 'test@example.com',
			}

			const result = v.safeParse(profileFormSchema, validData)
			expect(result.success).toBe(true)
		})
	})

	describe('email validation', () => {
		it('should reject invalid email format', () => {
			const invalidData = {
				name: 'Jean',
				email: 'not-an-email',
			}

			const result = v.safeParse(profileFormSchema, invalidData)
			expect(result.success).toBe(false)
			if (!result.success) {
				const emailError = result.issues.find((issue) => issue.path?.[0]?.key === 'email')
				expect(emailError?.message).toBe('Veuillez entrer un email valide')
			}
		})

		it('should reject email without domain', () => {
			const invalidData = {
				name: 'Jean',
				email: 'test@',
			}

			const result = v.safeParse(profileFormSchema, invalidData)
			expect(result.success).toBe(false)
		})

		it('should reject email without @', () => {
			const invalidData = {
				name: 'Jean',
				email: 'testexample.com',
			}

			const result = v.safeParse(profileFormSchema, invalidData)
			expect(result.success).toBe(false)
		})
	})

	describe('error messages in French', () => {
		it('should provide French error messages for name validation', () => {
			const result = v.safeParse(profileFormSchema, { name: '', email: 'valid@email.com' })
			expect(result.success).toBe(false)
			if (!result.success) {
				expect(result.issues[0].message).toBe('Le nom est requis')
			}
		})

		it('should provide French error messages for email validation', () => {
			const result = v.safeParse(profileFormSchema, { name: 'Valid', email: 'invalid' })
			expect(result.success).toBe(false)
			if (!result.success) {
				expect(result.issues[0].message).toBe('Veuillez entrer un email valide')
			}
		})
	})
})

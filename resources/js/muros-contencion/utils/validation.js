import { SYSTEM_CONSTANTS } from '../config/constants.js'

export class ValidationManager {
    static validateNumber(value, min = null, max = null, fieldName = 'Campo') {
        const errors = []
        
        if (value === '' || value === null || value === undefined) {
            errors.push(`${fieldName} es requerido`)
            return { isValid: false, errors }
        }

        const numValue = parseFloat(value)
        
        if (isNaN(numValue)) {
            errors.push(`${fieldName} debe ser un número válido`)
            return { isValid: false, errors }
        }

        if (min !== null && numValue < min) {
            errors.push(`${fieldName} debe ser mayor o igual a ${min}`)
        }

        if (max !== null && numValue > max) {
            errors.push(`${fieldName} debe ser menor o igual a ${max}`)
        }

        return {
            isValid: errors.length === 0,
            errors,
            value: numValue
        }
    }

    static validateDimensions(height, width) {
        const errors = []
        
        const heightValidation = this.validateNumber(
            height, 
            SYSTEM_CONSTANTS.VALIDATION_RULES.MIN_HEIGHT, 
            SYSTEM_CONSTANTS.VALIDATION_RULES.MAX_HEIGHT, 
            'Altura'
        )
        
        const widthValidation = this.validateNumber(
            width, 
            SYSTEM_CONSTANTS.VALIDATION_RULES.MIN_WIDTH, 
            SYSTEM_CONSTANTS.VALIDATION_RULES.MAX_WIDTH, 
            'Ancho'
        )

        errors.push(...heightValidation.errors)
        errors.push(...widthValidation.errors)

        return {
            isValid: errors.length === 0,
            errors,
            values: {
                height: heightValidation.value,
                width: widthValidation.value
            }
        }
    }

    static validateFormData(formData, validationRules) {
        const errors = []
        const validatedData = {}

        for (const [field, rules] of Object.entries(validationRules)) {
            const value = formData[field]
            
            if (rules.required && (value === '' || value === null || value === undefined)) {
                errors.push(`${rules.label || field} es requerido`)
                continue
            }

            if (value !== '' && value !== null && value !== undefined) {
                if (rules.type === 'number') {
                    const validation = this.validateNumber(
                        value, 
                        rules.min, 
                        rules.max, 
                        rules.label || field
                    )
                    
                    if (!validation.isValid) {
                        errors.push(...validation.errors)
                    } else {
                        validatedData[field] = validation.value
                    }
                } else {
                    validatedData[field] = value
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            data: validatedData
        }
    }
}

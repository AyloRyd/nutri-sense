package com.nutrisense.mobile.ui.components

object NutritionMapper {
    fun toPer100g(value: Double, weightGrams: Double): Double {
        return if (weightGrams > 0) value * (100.0 / weightGrams) else 0.0
    }
}

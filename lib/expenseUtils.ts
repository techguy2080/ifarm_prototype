import { Expense, ExternalAnimalHireAgreement } from '@/types';

/**
 * Unified expense interface that includes source information
 */
export interface UnifiedExpense extends Expense {
  source: 'manual' | 'medical' | 'animal_hire';
  source_id?: number; // ID of the source record (e.g., agreement_id)
  source_reference?: string; // Human-readable reference (e.g., "Hire Agreement #123")
}

/**
 * Aggregates expenses from all sources:
 * 1. Manual expenses (logged by users)
 * 2. Medical expenses (from vet activities)
 * 3. Animal hire expenses (from external animal hire agreements)
 */
export function aggregateAllExpenses(
  expenses: Expense[],
  externalHireAgreements: ExternalAnimalHireAgreement[]
): UnifiedExpense[] {
  const unifiedExpenses: UnifiedExpense[] = [];

  // 1. Add manual expenses
  expenses.forEach(expense => {
    // Determine if it's a medical expense
    const isMedical = expense.expense_type === 'medicine' || 
                     expense.description.toLowerCase().includes('medical') ||
                     expense.description.toLowerCase().includes('veterinary') ||
                     expense.description.toLowerCase().includes('vet');
    
    unifiedExpenses.push({
      ...expense,
      source: isMedical ? 'medical' : 'manual',
    });
  });

  // 2. Add animal hire expenses from external hire agreements
  // Only include agreements where payment has been made (paid_amount > 0)
  externalHireAgreements.forEach(agreement => {
    if (agreement.paid_amount && agreement.paid_amount > 0) {
      // Create expense record from hire agreement
      const hireExpense: UnifiedExpense = {
        expense_id: 10000 + agreement.agreement_id, // Use high ID to avoid conflicts
        tenant_id: agreement.tenant_id,
        farm_id: agreement.farm_id,
        expense_type: 'animal_hire',
        description: `Animal hire: ${agreement.external_animal_tag || 'External Animal'} from ${agreement.external_farm?.farm_name || 'External Farm'}`,
        amount: agreement.paid_amount,
        expense_date: agreement.payment_date || agreement.start_date,
        vendor: agreement.external_farm?.farm_name || 'External Farm',
        payment_method: agreement.payment_method,
        receipt_url: agreement.payment_reference ? `Reference: ${agreement.payment_reference}` : undefined,
        created_by_user_id: agreement.created_by_user_id,
        created_at: agreement.payment_date ? new Date(agreement.payment_date).toISOString() : agreement.created_at,
        source: 'animal_hire',
        source_id: agreement.agreement_id,
        source_reference: `Hire Agreement #${agreement.agreement_id}`
      };
      unifiedExpenses.push(hireExpense);
    }
  });

  // Sort by date (most recent first)
  return unifiedExpenses.sort((a, b) => {
    const dateA = new Date(a.expense_date).getTime();
    const dateB = new Date(b.expense_date).getTime();
    return dateB - dateA;
  });
}

/**
 * Get expenses by source type
 */
export function getExpensesBySource(
  unifiedExpenses: UnifiedExpense[],
  source?: 'manual' | 'medical' | 'animal_hire'
): UnifiedExpense[] {
  if (!source) return unifiedExpenses;
  return unifiedExpenses.filter(e => e.source === source);
}

/**
 * Get total expenses by source
 */
export function getTotalBySource(unifiedExpenses: UnifiedExpense[]) {
  return {
    total: unifiedExpenses.reduce((sum, e) => sum + e.amount, 0),
    manual: unifiedExpenses.filter(e => e.source === 'manual').reduce((sum, e) => sum + e.amount, 0),
    medical: unifiedExpenses.filter(e => e.source === 'medical').reduce((sum, e) => sum + e.amount, 0),
    animal_hire: unifiedExpenses.filter(e => e.source === 'animal_hire').reduce((sum, e) => sum + e.amount, 0),
  };
}

/**
 * Get expenses by type (across all sources)
 */
export function getExpensesByType(
  unifiedExpenses: UnifiedExpense[],
  expenseType?: Expense['expense_type']
): UnifiedExpense[] {
  if (!expenseType) return unifiedExpenses;
  return unifiedExpenses.filter(e => e.expense_type === expenseType);
}




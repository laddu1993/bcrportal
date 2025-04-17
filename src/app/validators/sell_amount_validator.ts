import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function validateSellAmount(): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const sellAmount = formGroup.get('sell_amount')?.value;
    const currentAmount = formGroup.get('current')?.value;
    // const sellAmountControl = formGroup.get('sell_amount');
    if (sellAmount !== null && 
      currentAmount !== null && 
      Number(sellAmount) < Number(currentAmount)
    ) {
      return { validateSellAmount: true }; // Validation error
    }

    return null; // Valid case
  };
}

import { MargaritaFormValidator } from '../margarita-form-types';

export const slugValidator: (
  errorMessage?: string
) => MargaritaFormValidator<boolean> =
  (errorMessage = 'Value must be a valid slug!') =>
  ({ value, params }) => {
    if (!params || !value) return { valid: true };
    const regex = new RegExp(/\/?[^\s]/gi);
    const stringValue = typeof value === 'string' ? value : String(value);
    const valueIsInvalid = !regex.test(stringValue);
    const error = valueIsInvalid ? errorMessage : null;
    return { valid: !valueIsInvalid, error };
  };

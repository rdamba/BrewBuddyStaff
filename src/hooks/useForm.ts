import { useCallback, useState } from "react";

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export function useForm<T extends object>(
  initialValues: T,
  validate: (values: T) => FormErrors<T>,
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});

  // K is "one of the keys of T", so value must match that key's type.
  function setField<K extends keyof T>(field: K, value: T[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validateAll(): boolean {
    const next = validate(values);
    setErrors(next);
    return !Object.values(next).some(Boolean);
  }

  const reset = useCallback((next: T) => {
    setValues(next);
    setErrors({});
  }, []);

  return { values, errors, setField, validateAll, reset };
}

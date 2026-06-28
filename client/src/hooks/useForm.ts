import { useCallback, useState } from 'react';
import { z, type ZodType } from 'zod';
import { zodErrors } from '../lib/validations';

interface UseFormOptions<T extends Record<string, unknown>> {
  initialValues: T;
  schema?: ZodType<T>;
}

interface UseFormReturn<T extends Record<string, unknown>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  validate: () => boolean;
  reset: () => void;
}

export function useForm<T extends Record<string, unknown>>({
  initialValues,
  schema,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
      setValuesState((prev) => ({ ...prev, [name]: val }));
    },
    [],
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      if (schema) {
        const result = schema.safeParse(values);
        if (!result.success) {
          setErrors(zodErrors(result.error) as Partial<Record<keyof T, string>>);
        } else {
          setErrors({});
        }
      }
    },
    [schema, values],
  );

  const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValuesState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setValues = useCallback((next: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...next }));
  }, []);

  const validate = useCallback((): boolean => {
    if (!schema) return true;
    const result = schema.safeParse(values);
    if (!result.success) {
      setErrors(zodErrors(result.error) as Partial<Record<keyof T, string>>);
      const allTouched = Object.keys(values).reduce(
        (acc, k) => ({ ...acc, [k]: true }),
        {} as Partial<Record<keyof T, boolean>>,
      );
      setTouched(allTouched);
      return false;
    }
    setErrors({});
    return true;
  }, [schema, values]);

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    setValues,
    validate,
    reset,
  };
}

void z;

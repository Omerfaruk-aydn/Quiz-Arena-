import { useState } from 'react';
import { useForm } from '../../hooks/useForm';
import { loginSchema } from '../../lib/validations';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input, PasswordInput, Field } from '../ui/Input';
import { extractApiError } from '../../services/api';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { values, errors, handleChange, handleBlur, validate, touched } = useForm({
    initialValues: { email: '', password: '' },
    schema: loginSchema,
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      await login(values.email, values.password);
      onSuccess?.();
    } catch (err) {
      setServerError(extractApiError(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {serverError && (
        <div className="rounded-xl border border-wrong/40 bg-wrong/10 px-4 py-3 text-sm text-wrong">
          {serverError}
        </div>
      )}
      <Field label="E-posta" error={touched.email ? errors.email : undefined}>
        <Input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="ornek@email.com"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={!!errors.email && touched.email}
        />
      </Field>
      <Field label="Şifre" error={touched.password ? errors.password : undefined}>
        <PasswordInput
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={!!errors.password && touched.password}
        />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={submitting}>
        Giriş Yap
      </Button>
    </form>
  );
}

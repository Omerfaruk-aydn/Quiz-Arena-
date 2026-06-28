import { useState } from 'react';
import { useForm } from '../../hooks/useForm';
import { registerSchema } from '../../lib/validations';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input, PasswordInput, Field } from '../ui/Input';
import { cn } from '../../lib/utils';
import { extractApiError } from '../../services/api';

interface RegisterFormProps {
  onSuccess?: () => void;
}

type Role = 'teacher' | 'student';

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { register } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { values, errors, handleChange, handleBlur, validate, touched, setFieldValue } = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'teacher' as Role,
    },
    schema: registerSchema,
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      });
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

      <div className="grid grid-cols-2 gap-2">
        {(['teacher', 'student'] as Role[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setFieldValue('role', r)}
            className={cn(
              'rounded-xl border px-3 py-2.5 text-sm font-medium transition-all',
              values.role === r
                ? 'border-primary bg-primary/15 text-white shadow-glow'
                : 'border-border bg-surface-2 text-text-muted hover:border-primary/50',
            )}
          >
            {r === 'teacher' ? '👨‍🏫 Öğretmen' : '🎓 Öğrenci'}
          </button>
        ))}
      </div>

      <Field label="Ad Soyad" error={touched.name ? errors.name : undefined}>
        <Input
          name="name"
          placeholder="Adınız Soyadınız"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={!!errors.name && touched.name}
        />
      </Field>
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Şifre"
          error={touched.password ? errors.password : undefined}
          hint="En az 8 karakter"
        >
          <PasswordInput
            name="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.password && touched.password}
          />
        </Field>
        <Field
          label="Şifre Tekrar"
          error={touched.confirmPassword ? errors.confirmPassword : undefined}
        >
          <PasswordInput
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="••••••••"
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.confirmPassword && touched.confirmPassword}
          />
        </Field>
      </div>
      <Button type="submit" size="lg" className="w-full" loading={submitting}>
        Hesap Oluştur
      </Button>
    </form>
  );
}

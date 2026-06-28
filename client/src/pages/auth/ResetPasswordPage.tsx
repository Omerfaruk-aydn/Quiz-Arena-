import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { PasswordInput, Field } from '../../components/ui/Input';
import { authService } from '../../services/authService';
import { extractApiError } from '../../services/api';
import { ROUTES } from '../../lib/constants';
import { pageVariants } from '../../lib/animations';
import toast from 'react-hot-toast';

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }
    if (password.length < 8) {
      toast.error('Şifre en az 8 karakter');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      toast.success('Şifre güncellendi, giriş yapabilirsin');
      navigate(ROUTES.login);
    } catch (err) {
      toast.error(extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative flex min-h-screen items-center justify-center px-4"
    >
      <div className="w-full max-w-md glass p-8">
        <h1 className="mb-1 text-2xl font-bold">Yeni şifre belirle</h1>
        <p className="mb-6 text-sm text-text-muted">Hesabın için yeni bir şifre oluştur.</p>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Yeni şifre" hint="En az 8 karakter">
            <PasswordInput
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>
          <Field label="Şifre tekrar">
            <PasswordInput
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
            />
          </Field>
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Şifreyi Güncelle
          </Button>
        </form>
      </div>
    </motion.div>
  );
}

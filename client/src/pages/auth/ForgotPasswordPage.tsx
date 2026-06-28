import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Field } from '../../components/ui/Input';
import { authService } from '../../services/authService';
import { extractApiError } from '../../services/api';
import { ROUTES } from '../../lib/constants';
import { pageVariants } from '../../lib/animations';
import toast from 'react-hot-toast';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success('Talimatlar gönderildi (e-posta varsa)');
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
        <Link
          to={ROUTES.login}
          className="mb-4 inline-flex items-center gap-1 text-sm text-text-muted hover:text-white"
        >
          <ArrowLeft size={16} /> Girişe dön
        </Link>
        <h1 className="mb-1 text-2xl font-bold">Şifremi unuttum</h1>
        <p className="mb-6 text-sm text-text-muted">
          E-posta adresini gir, sıfırlama bağlantısı gönderelim.
        </p>
        {sent ? (
          <div className="rounded-xl border border-correct/40 bg-correct/10 p-4 text-sm text-correct">
            <Mail className="mb-2" size={20} />
            Eğer bu e-posta kayıtlıysa talimatlar gönderildi.
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <Field label="E-posta">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
              />
            </Field>
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Sıfırlama Bağlantısı Gönder
            </Button>
          </form>
        )}
        <Button variant="ghost" className="mt-4 w-full" onClick={() => navigate(ROUTES.login)}>
          Giriş yap
        </Button>
      </div>
    </motion.div>
  );
}

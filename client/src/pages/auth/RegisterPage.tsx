import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RegisterForm } from '../../components/auth/RegisterForm';
import { pageVariants } from '../../lib/animations';
import { ROUTES } from '../../lib/constants';

export function RegisterPage() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative flex min-h-screen items-center justify-center px-4 py-8"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid-glow [background-size:32px_32px] opacity-20" />
      <div className="relative z-10 w-full max-w-md glass p-8">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-accent-pink" />
          <span className="font-display text-xl font-bold">
            Quiz<span className="gradient-text">Arena</span>
          </span>
        </Link>
        <h1 className="mb-1 text-center text-2xl font-bold">Hesap oluştur</h1>
        <p className="mb-6 text-center text-sm text-text-muted">Quiz yapmaya ve yarışmaya başla</p>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-text-muted">
          Zaten hesabın var mı?{' '}
          <Link to={ROUTES.login} className="font-medium text-primary hover:underline">
            Giriş yap
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

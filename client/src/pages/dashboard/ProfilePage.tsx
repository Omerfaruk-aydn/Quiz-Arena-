import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Input, Field } from '../../components/ui/Input';
import { Avatar } from '../../components/common/Avatar';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { useAuthStore } from '../../stores/authStore';
import { profileSchema } from '../../lib/validations';
import { zodErrors } from '../../lib/validations';
import { pageVariants } from '../../lib/animations';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const { user } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const profileMut = useMutation({
    mutationFn: () => userService.updateProfile({ name, email }),
    onSuccess: (data) => {
      setUser(data.user);
      void queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      toast.success('Profil güncellendi');
    },
    onError: () => toast.error('Güncelleme başarısız'),
  });

  const avatarMut = useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(file),
    onSuccess: (data) => {
      setUser({ ...user!, avatar: { url: data.url, publicId: data.publicId } });
      toast.success('Avatar güncellendi');
    },
    onError: () => toast.error('Avatar yüklenemedi'),
  });

  const save = () => {
    const result = profileSchema.safeParse({ name, email });
    if (!result.success) {
      setErrors(zodErrors(result.error));
      return;
    }
    setErrors({});
    profileMut.mutate();
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Dosya 5MB'dan küçük olmalı");
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(f.type)) {
      toast.error('Sadece PNG, JPEG, WebP formatları desteklenir');
      return;
    }
    avatarMut.mutate(f);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="mx-auto max-w-2xl space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold">Profil</h1>
        <p className="text-text-muted">Hesap bilgilerini yönet</p>
      </div>

      <div className="glass flex items-center gap-4 p-6">
        <div className="relative">
          {avatarMut.isPending ? (
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-surface-2">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <Avatar
              url={user?.avatar?.url}
              emoji={user?.role === 'student' ? '🎓' : undefined}
              name={user?.name}
              size={72}
            />
          )}
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 rounded-full bg-primary p-2 text-white shadow-glow btn-focus disabled:opacity-50"
            aria-label="Avatar değiştir"
            disabled={avatarMut.isPending}
          >
            <Camera size={14} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={onFile}
          />
        </div>
        <div>
          <p className="text-lg font-semibold">{user?.name}</p>
          <p className="text-sm text-text-muted">{user?.email}</p>
          <p className="mt-1 inline-block rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
            {user?.role === 'teacher' ? 'Öğretmen' : 'Öğrenci'}
          </p>
        </div>
      </div>

      <div className="glass space-y-4 p-6">
        <h2 className="font-semibold">Bilgileri Düzenle</h2>
        <Field label="Ad Soyad" error={errors.name}>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="E-posta" error={errors.email}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Button onClick={save} loading={profileMut.isPending}>
          <Save size={16} /> Kaydet
        </Button>
      </div>

      {user && (
        <div className="glass p-6">
          <h2 className="mb-3 font-semibold">İstatistikler</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Stat label="Açılan oyun" value={user.stats.totalGamesHosted} />
            <Stat label="Oynanan oyun" value={user.stats.totalGamesPlayed} />
            <Stat label="Cevaplanan soru" value={user.stats.totalQuestionsAnswered} />
            <Stat label="Doğru cevap" value={user.stats.correctAnswers} />
            <Stat label="En yüksek skor" value={user.stats.highScore} />
          </div>
        </div>
      )}
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-surface-2 p-3">
      <p className="text-2xl font-bold font-display">{value.toLocaleString()}</p>
      <p className="text-xs text-text-muted">{label}</p>
    </div>
  );
}

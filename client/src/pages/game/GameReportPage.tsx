import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { gameService, type GameReport } from '../../services/gameService';
import { pageVariants } from '../../lib/animations';
import { formatNumber } from '../../lib/utils';

export function GameReportPage() {
  const { pin } = useParams<{ pin: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['game-report', pin],
    queryFn: () => gameService.getReport(pin!),
    enabled: !!pin,
  });

  if (isLoading) return <LoadingSpinner fullscreen label="Rapor yükleniyor…" />;

  const report = data as GameReport | undefined;
  if (!report) {
    return (
      <EmptyState
        icon="📋"
        title="Rapor bulunamadı"
        description="Bu oyun henüz tamamlanmamış veya rapor mevcut değil."
        action={<Button onClick={() => navigate('/history')}>Geri dön</Button>}
      />
    );
  }

  const participants = (report.participants ?? []) as Array<Record<string, unknown>>;
  const answers = (report.answers ?? []) as Array<Record<string, unknown>>;
  const session = report.session ?? {};
  const quizTitle = (session.quiz as { title?: string } | undefined)?.title ?? 'Quiz';

  const exportCsv = () => {
    const rows = [
      ['Sıra', 'Takma ad', 'Skor', 'Doğru', 'Seri'],
      ...participants.map((p, i) => [
        String(i + 1),
        String(p.nickname ?? ''),
        String(p.totalScore ?? 0),
        String(p.correctAnswers ?? 0),
        String(p.streak ?? 0),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quizarena-rapor-${pin}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/history">
            <Button size="icon" variant="ghost">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{quizTitle}</h1>
            <p className="text-text-muted">
              PIN: {pin} · {participants.length} katılımcı
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={exportCsv}>
          <Download size={16} /> CSV İndir
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass p-5">
          <p className="text-sm text-text-muted">Toplam Katılımcı</p>
          <p className="text-3xl font-bold font-display">{participants.length}</p>
        </div>
        <div className="glass p-5">
          <p className="text-sm text-text-muted">Toplam Cevap</p>
          <p className="text-3xl font-bold font-display">{answers.length}</p>
        </div>
        <div className="glass p-5">
          <p className="text-sm text-text-muted">Ortalama Skor</p>
          <p className="text-3xl font-bold font-display">
            {formatNumber(
              participants.length > 0
                ? Math.round(
                    participants.reduce((s, p) => s + Number(p.totalScore ?? 0), 0) /
                      participants.length,
                  )
                : 0,
            )}
          </p>
        </div>
      </div>

      <div className="glass overflow-hidden">
        <div className="border-b border-border p-4">
          <h3 className="font-semibold">Katılımcı Tablosu</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="p-3">Sıra</th>
                <th className="p-3">Oyuncu</th>
                <th className="p-3 text-right">Skor</th>
                <th className="p-3 text-right">Doğru</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-surface-2">
                  <td className="p-3 font-display font-bold">{i + 1}</td>
                  <td className="p-3">
                    <span className="mr-2">
                      {String((p.avatar as { emoji?: string } | undefined)?.emoji ?? '🎮')}
                    </span>
                    {String(p.nickname ?? '—')}
                  </td>
                  <td className="p-3 text-right font-mono">
                    {formatNumber(Number(p.totalScore ?? 0))}
                  </td>
                  <td className="p-3 text-right">{String(p.correctAnswers ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

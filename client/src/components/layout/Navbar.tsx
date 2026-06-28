import { Link, useNavigate } from 'react-router-dom';
import { Menu, Plus, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { useUiStore } from '../../stores/uiStore';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../lib/constants';
import { Avatar } from '../common/Avatar';

export function Navbar() {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/70 px-4 backdrop-blur-xl md:px-6">
      <button
        onClick={toggleSidebar}
        className="rounded-lg p-2 text-text-muted hover:bg-surface-2 hover:text-white md:hidden"
        aria-label="Menü"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1" />

      <Button size="sm" variant="ghost" onClick={() => navigate(ROUTES.gameJoin)}>
        <Sparkles size={16} /> Katıl
      </Button>
      <Button size="sm" onClick={() => navigate(ROUTES.quizCreate)}>
        <Plus size={16} /> Yeni Quiz
      </Button>
      <Link to={ROUTES.profile} className="ml-1">
        <Avatar
          url={user?.avatar?.url}
          emoji={user?.role === 'student' ? '🎓' : undefined}
          name={user?.name}
          size={36}
        />
      </Link>
    </header>
  );
}

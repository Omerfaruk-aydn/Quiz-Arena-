import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Library,
  BookOpen,
  Gamepad2,
  History,
  User as UserIcon,
  LogOut,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { ROUTES } from '../../lib/constants';
import { useAuth } from '../../hooks/useAuth';
import { useUiStore } from '../../stores/uiStore';
import { Avatar } from '../common/Avatar';

const navItems = [
  { to: ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.quizzes, label: 'Quizlerim', icon: Library },
  { to: ROUTES.publicQuizzes, label: 'Kütüphane', icon: BookOpen },
  { to: ROUTES.gameJoin, label: 'Oyuna Katıl', icon: Gamepad2 },
  { to: '/history', label: 'Geçmiş', icon: History },
  { to: ROUTES.profile, label: 'Profil', icon: UserIcon },
];

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const { user, logout } = useAuth();

  return (
    <>
      <div className="flex h-16 items-center justify-between gap-2 px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent-pink" />
          <span className="font-display text-lg font-bold tracking-tight">
            Quiz<span className="gradient-text">Arena</span>
          </span>
        </div>
        <button
          onClick={onNavClick}
          className="rounded-lg p-2 text-text-muted hover:bg-surface-2 hover:text-white md:hidden"
          aria-label="Kapat"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavClick}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/15 text-white shadow-glow'
                    : 'text-text-muted hover:bg-surface-2 hover:text-white',
                )
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          <Avatar
            url={user?.avatar?.url}
            emoji={user?.role === 'student' ? '🎓' : undefined}
            name={user?.name}
            size={36}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-text-muted">{user?.email}</p>
          </div>
          <button
            onClick={() => void logout()}
            className="rounded-lg p-2 text-text-muted hover:bg-surface-2 hover:text-wrong"
            aria-label="Çıkış"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </>
  );
}

export function Sidebar() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebar = useUiStore((s) => s.setSidebar);

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-border bg-surface/50 backdrop-blur-xl">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar — slide-in drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setSidebar(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface backdrop-blur-xl md:hidden"
            >
              <SidebarContent onNavClick={() => setSidebar(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

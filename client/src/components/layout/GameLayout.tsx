import { type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

export function GameLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-grid-glow [background-size:32px_32px] opacity-40" />
      <main className="relative z-10 flex flex-1 flex-col">{children ?? <Outlet />}</main>
    </div>
  );
}

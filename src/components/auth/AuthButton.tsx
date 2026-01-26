'use client';

import { useAuth } from '@/context/AuthContext';
import { User, LogOut, Loader2 } from 'lucide-react';

export function AuthButton() {
  const { user, loading, signIn, logOut } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-[var(--color-steel)]">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        {/* User avatar/initial */}
        <div className="flex items-center gap-2">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-8 h-8 rounded-full border-2 border-[var(--color-bronze-muted)]"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[var(--color-bronze-muted)]
                          flex items-center justify-center">
              <span className="text-sm font-semibold text-[var(--color-bronze-dark)]">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
              </span>
            </div>
          )}
          <span className="hidden sm:block text-sm text-[var(--color-steel)] max-w-[120px] truncate">
            {user.displayName || user.email}
          </span>
        </div>

        {/* Sign out button */}
        <button
          onClick={logOut}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                   text-sm text-[var(--color-steel)] hover:text-[var(--color-ink)]
                   hover:bg-[var(--color-pearl)] transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={signIn}
      className="flex items-center gap-2 px-4 py-2 rounded-full
               bg-[var(--color-bronze)] text-white text-sm font-medium
               hover:bg-[var(--color-bronze-dark)] transition-colors"
    >
      <User className="w-4 h-4" />
      <span>Sign in</span>
    </button>
  );
}

'use client';

import { useState } from 'react';
import { Mail, Loader2, Check, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { Article } from '@/types';

interface AIEmailDigestProps {
  articles: Article[];
}

export function AIEmailDigest({ articles }: AIEmailDigestProps) {
  const { user, getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Only show for allowed users
  const allowedEmails = ['hillier.dave@gmail.com', 'dave@davehillier.com'];
  const isAllowed = user?.email && allowedEmails.includes(user.email.toLowerCase());

  if (!isAllowed) return null;

  const sendEmailDigest = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/ai/email-digest', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articles: articles.map(a => ({
            title: a.title,
            description: a.description,
            category: a.category,
            source: a.source.name,
            publishedAt: a.publishedAt,
          })),
        }),
      });

      if (response.status === 403) {
        throw new Error('Not authorised for this feature');
      }

      if (response.status === 429) {
        const data = await response.json();
        throw new Error(data.error || 'Email limit reached. Please try again later.');
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send email');
      }

      setSuccess(true);
      setShowToast(true);

      // Hide toast after 4 seconds
      setTimeout(() => {
        setShowToast(false);
        setSuccess(false);
      }, 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setShowToast(true);

      // Hide error toast after 5 seconds
      setTimeout(() => {
        setShowToast(false);
        setError(null);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Email digest button - positioned above Weekly Bios on left */}
      <button
        onClick={sendEmailDigest}
        disabled={loading || success}
        className="fixed bottom-42 left-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full
                 bg-gradient-to-r from-[var(--color-bronze)] to-[var(--color-ink)]
                 text-white font-medium shadow-lg
                 hover:from-[var(--color-bronze-dark)] hover:to-[var(--color-steel)]
                 hover:shadow-xl hover:scale-105
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                 transition-all duration-200"
        title="Send email digest to yourself"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : success ? (
          <Check className="w-5 h-5" />
        ) : (
          <Mail className="w-5 h-5" />
        )}
        <span className="hidden sm:inline">
          {loading ? 'Sending...' : success ? 'Sent!' : 'Email Digest'}
        </span>
      </button>

      {/* Toast notification */}
      {showToast && (
        <div
          className={`fixed bottom-60 left-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg
                     shadow-lg animate-fade-in
                     ${success
                       ? 'bg-green-50 border border-green-200 text-green-800'
                       : 'bg-red-50 border border-red-200 text-red-800'
                     }`}
        >
          {success ? (
            <>
              <Check className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">Email sent!</p>
                <p className="text-sm opacity-80">Check your inbox</p>
              </div>
            </>
          ) : (
            <>
              <X className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium">Failed to send</p>
                <p className="text-sm opacity-80">{error}</p>
              </div>
            </>
          )}
          <button
            onClick={() => setShowToast(false)}
            className="ml-2 p-1 rounded-full hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}

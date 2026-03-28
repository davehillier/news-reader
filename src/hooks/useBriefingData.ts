'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { Article } from '@/types';
import type { MorningBriefing, TalkingPoints, WeeklyBios, AIProvider } from '@/lib/aiTypes';

interface BriefingData {
  briefing: MorningBriefing | null;
  talkingPoints: TalkingPoints | null;
  people: WeeklyBios | null;
  isLoading: boolean;
  briefingLoading: boolean;
  talkingPointsLoading: boolean;
  peopleLoading: boolean;
  error: string | null;
  canRefresh: boolean;
  isCached: {
    briefing: boolean;
    talkingPoints: boolean;
    people: boolean;
  };
  refreshBriefing: (provider?: AIProvider) => Promise<void>;
  refreshTalkingPoints: (provider?: AIProvider) => Promise<void>;
  refreshPeople: () => Promise<void>;
}

export function useBriefingData(articles: Article[]): BriefingData {
  const { user, getToken } = useAuth();
  const [briefing, setBriefing] = useState<MorningBriefing | null>(null);
  const [talkingPoints, setTalkingPoints] = useState<TalkingPoints | null>(null);
  const [people, setPeople] = useState<WeeklyBios | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [talkingPointsLoading, setTalkingPointsLoading] = useState(false);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canRefresh, setCanRefresh] = useState(false);
  const [isCached, setIsCached] = useState({
    briefing: false,
    talkingPoints: false,
    people: false,
  });
  const [hasFetched, setHasFetched] = useState(false);

  const prepareArticles = useCallback(() =>
    articles.map(a => ({
      title: a.title,
      description: a.description,
      category: a.category,
      source: a.source.name,
      publishedAt: a.publishedAt,
    })), [articles]);

  const fetchBriefing = useCallback(async (token: string, forceRefresh = false, provider: AIProvider = 'gemini') => {
    setBriefingLoading(true);
    try {
      const res = await fetch('/api/ai/briefing', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles: prepareArticles(), provider, forceRefresh }),
      });
      if (res.status === 403) return; // No access and no cache
      if (!res.ok) return;
      const data = await res.json();
      setBriefing(data);
      setIsCached(prev => ({ ...prev, briefing: data.cached || false }));
      if (data.canRefresh) setCanRefresh(true);
    } catch (err) {
      console.error('[Briefing] Fetch failed:', err);
    } finally {
      setBriefingLoading(false);
    }
  }, [prepareArticles]);

  const fetchTalkingPoints = useCallback(async (token: string, forceRefresh = false, provider: AIProvider = 'gemini') => {
    setTalkingPointsLoading(true);
    try {
      const res = await fetch('/api/ai/talking-points', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles: prepareArticles(), provider, forceRefresh }),
      });
      if (res.status === 403) return;
      if (!res.ok) return;
      const data = await res.json();
      setTalkingPoints(data);
      setIsCached(prev => ({ ...prev, talkingPoints: data.cached || false }));
      if (data.canRefresh) setCanRefresh(true);
    } catch (err) {
      console.error('[TalkingPoints] Fetch failed:', err);
    } finally {
      setTalkingPointsLoading(false);
    }
  }, [prepareArticles]);

  const fetchPeople = useCallback(async (token: string, forceRefresh = false) => {
    setPeopleLoading(true);
    try {
      const res = await fetch('/api/ai/weekly-bios', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles: prepareArticles(), forceRefresh }),
      });
      if (res.status === 403) return;
      if (!res.ok) return;
      const data = await res.json();
      setPeople(data);
      setIsCached(prev => ({ ...prev, people: data.cached || false }));
      if (data.canRefresh) setCanRefresh(true);
    } catch (err) {
      console.error('[People] Fetch failed:', err);
    } finally {
      setPeopleLoading(false);
    }
  }, [prepareArticles]);

  // Auto-fetch all briefing data when articles are available
  useEffect(() => {
    if (!user || articles.length === 0 || hasFetched) return;

    const fetchAll = async () => {
      const token = await getToken();
      if (!token) return;

      setHasFetched(true);
      // Fetch all three in parallel
      await Promise.all([
        fetchBriefing(token),
        fetchTalkingPoints(token),
        fetchPeople(token),
      ]);
    };

    fetchAll();
  }, [user, articles.length, hasFetched, getToken, fetchBriefing, fetchTalkingPoints, fetchPeople]);

  const refreshBriefing = useCallback(async (provider: AIProvider = 'gemini') => {
    const token = await getToken();
    if (!token) return;
    await fetchBriefing(token, true, provider);
  }, [getToken, fetchBriefing]);

  const refreshTalkingPoints = useCallback(async (provider: AIProvider = 'gemini') => {
    const token = await getToken();
    if (!token) return;
    await fetchTalkingPoints(token, true, provider);
  }, [getToken, fetchTalkingPoints]);

  const refreshPeople = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    await fetchPeople(token, true);
  }, [getToken, fetchPeople]);

  const isLoading = briefingLoading || talkingPointsLoading || peopleLoading;

  return {
    briefing,
    talkingPoints,
    people,
    isLoading,
    briefingLoading,
    talkingPointsLoading,
    peopleLoading,
    error,
    canRefresh,
    isCached,
    refreshBriefing,
    refreshTalkingPoints,
    refreshPeople,
  };
}

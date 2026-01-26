'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type { UserPreferences } from '@/types';

const DEFAULT_PREFERENCES: Omit<UserPreferences, 'userId' | 'lastUpdated'> = {
  enabledSources: [], // Empty means all sources enabled
  mutedTopics: [],
  readArticles: [],
  savedArticles: [],
  aiSummariesEnabled: true,
};

const STORAGE_KEY = 'news-reader-preferences';

interface PreferencesContextType {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
  // Actions
  markAsRead: (articleId: string) => Promise<void>;
  toggleSaved: (articleId: string) => Promise<void>;
  muteTopic: (topic: string) => Promise<void>;
  unmuteTopic: (topic: string) => Promise<void>;
  toggleSource: (sourceId: string) => Promise<void>;
  setAiSummariesEnabled: (enabled: boolean) => Promise<void>;
  // Checks
  isRead: (articleId: string) => boolean;
  isSaved: (articleId: string) => boolean;
  isSourceEnabled: (sourceId: string) => boolean;
  isTopicMuted: (topic: string) => boolean;
}

const PreferencesContext = createContext<PreferencesContextType>({
  preferences: null,
  loading: true,
  error: null,
  markAsRead: async () => {},
  toggleSaved: async () => {},
  muteTopic: async () => {},
  unmuteTopic: async () => {},
  toggleSource: async () => {},
  setAiSummariesEnabled: async () => {},
  isRead: () => false,
  isSaved: () => false,
  isSourceEnabled: () => true,
  isTopicMuted: () => false,
});

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const { user, getToken } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load preferences from localStorage when user logs in
  useEffect(() => {
    if (!user) {
      setPreferences(null);
      setLoading(false);
      return;
    }

    const loadPreferences = () => {
      setLoading(true);
      setError(null);

      try {
        // Load from localStorage
        const stored = localStorage.getItem(`${STORAGE_KEY}-${user.uid}`);
        if (stored) {
          const parsed = JSON.parse(stored) as UserPreferences;
          setPreferences(parsed);
        } else {
          // Create default preferences
          const defaultPrefs: UserPreferences = {
            ...DEFAULT_PREFERENCES,
            userId: user.uid,
            lastUpdated: new Date().toISOString(),
          };
          setPreferences(defaultPrefs);
          localStorage.setItem(`${STORAGE_KEY}-${user.uid}`, JSON.stringify(defaultPrefs));
        }
      } catch (err) {
        console.error('Error loading preferences:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Fall back to default preferences
        setPreferences({
          ...DEFAULT_PREFERENCES,
          userId: user.uid,
          lastUpdated: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  // Update preferences in localStorage
  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    if (!user || !preferences) return;

    const updatedPrefs: UserPreferences = {
      ...preferences,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };

    // Update state
    setPreferences(updatedPrefs);

    // Persist to localStorage
    try {
      localStorage.setItem(`${STORAGE_KEY}-${user.uid}`, JSON.stringify(updatedPrefs));
    } catch (err) {
      console.error('Error saving preferences to localStorage:', err);
    }
  }, [user, preferences]);

  // Actions
  const markAsRead = useCallback(async (articleId: string) => {
    if (!preferences) return;
    if (preferences.readArticles.includes(articleId)) return;

    await updatePreferences({
      readArticles: [...preferences.readArticles, articleId],
    });
  }, [preferences, updatePreferences]);

  const toggleSaved = useCallback(async (articleId: string) => {
    if (!preferences) return;

    const isSaved = preferences.savedArticles.includes(articleId);
    await updatePreferences({
      savedArticles: isSaved
        ? preferences.savedArticles.filter(id => id !== articleId)
        : [...preferences.savedArticles, articleId],
    });
  }, [preferences, updatePreferences]);

  const muteTopic = useCallback(async (topic: string) => {
    if (!preferences) return;
    if (preferences.mutedTopics.includes(topic)) return;

    await updatePreferences({
      mutedTopics: [...preferences.mutedTopics, topic],
    });
  }, [preferences, updatePreferences]);

  const unmuteTopic = useCallback(async (topic: string) => {
    if (!preferences) return;

    await updatePreferences({
      mutedTopics: preferences.mutedTopics.filter(t => t !== topic),
    });
  }, [preferences, updatePreferences]);

  const toggleSource = useCallback(async (sourceId: string) => {
    if (!preferences) return;

    const isEnabled = preferences.enabledSources.length === 0 ||
                      preferences.enabledSources.includes(sourceId);

    if (preferences.enabledSources.length === 0) {
      // First toggle: disable this source (enable all others implicitly)
      // We need to get all source IDs first, but for now just add to disabled
      await updatePreferences({
        enabledSources: [sourceId], // This will be inverted logic
      });
    } else {
      await updatePreferences({
        enabledSources: isEnabled
          ? preferences.enabledSources.filter(id => id !== sourceId)
          : [...preferences.enabledSources, sourceId],
      });
    }
  }, [preferences, updatePreferences]);

  const setAiSummariesEnabled = useCallback(async (enabled: boolean) => {
    await updatePreferences({ aiSummariesEnabled: enabled });
  }, [updatePreferences]);

  // Checks
  const isRead = useCallback((articleId: string) => {
    return preferences?.readArticles.includes(articleId) ?? false;
  }, [preferences]);

  const isSaved = useCallback((articleId: string) => {
    return preferences?.savedArticles.includes(articleId) ?? false;
  }, [preferences]);

  const isSourceEnabled = useCallback((sourceId: string) => {
    if (!preferences || preferences.enabledSources.length === 0) return true;
    return preferences.enabledSources.includes(sourceId);
  }, [preferences]);

  const isTopicMuted = useCallback((topic: string) => {
    return preferences?.mutedTopics.includes(topic) ?? false;
  }, [preferences]);

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        loading,
        error,
        markAsRead,
        toggleSaved,
        muteTopic,
        unmuteTopic,
        toggleSource,
        setAiSummariesEnabled,
        isRead,
        isSaved,
        isSourceEnabled,
        isTopicMuted,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => useContext(PreferencesContext);

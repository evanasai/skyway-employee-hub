
import { useState, useEffect, useCallback } from 'react';

interface NavigationState {
  currentView: string;
  previousView?: string;
  viewStack: string[];
  data?: any;
}

const STORAGE_KEY = 'navigation_state';

export const useNavigationState = (initialView: string = 'dashboard') => {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentView: initialView,
    viewStack: [initialView]
  });

  // Load saved navigation state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate the saved state
        if (parsed.currentView && parsed.viewStack) {
          setNavigationState(parsed);
        }
      }
    } catch (error) {
      console.warn('Failed to load navigation state:', error);
    }
  }, []);

  // Save navigation state whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(navigationState));
      
      // Log navigation for debugging
      if (process.env.NODE_ENV === 'development') {
        localStorage.setItem(`debug_nav_${Date.now()}`, JSON.stringify({
          message: `Navigation: ${navigationState.previousView} → ${navigationState.currentView}`,
          state: navigationState
        }));
      }
    } catch (error) {
      console.warn('Failed to save navigation state:', error);
    }
  }, [navigationState]);

  const navigateTo = useCallback((view: string, data?: any) => {
    setNavigationState(prev => ({
      currentView: view,
      previousView: prev.currentView,
      viewStack: [...prev.viewStack.slice(-9), view], // Keep last 10 views
      data
    }));
  }, []);

  const goBack = useCallback(() => {
    setNavigationState(prev => {
      const newStack = prev.viewStack.slice(0, -1);
      const previousView = newStack[newStack.length - 1] || initialView;
      
      return {
        currentView: previousView,
        previousView: prev.currentView,
        viewStack: newStack.length > 0 ? newStack : [initialView],
        data: undefined
      };
    });
  }, [initialView]);

  const resetNavigation = useCallback(() => {
    setNavigationState({
      currentView: initialView,
      viewStack: [initialView]
    });
  }, [initialView]);

  return {
    currentView: navigationState.currentView,
    previousView: navigationState.previousView,
    viewData: navigationState.data,
    canGoBack: navigationState.viewStack.length > 1,
    navigateTo,
    goBack,
    resetNavigation
  };
};

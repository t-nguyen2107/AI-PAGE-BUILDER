import { useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import type { ComponentData } from '@puckeditor/core';

interface UseAutoPolishProps {
  projectId: string;
  pageId: string;
  generationStatus?: string | null;
  onComponentStream: (component: ComponentData, index: number, total: number, replacesSkelId?: string) => void;
  onComplete: () => void;
  onError: (error: string) => void;
}

export function useAutoPolish({
  projectId,
  pageId,
  generationStatus,
  onComponentStream,
  onComplete,
  onError,
}: UseAutoPolishProps) {
  const [isPolishing, setIsPolishing] = useState(false);
  const [progressLabel, setProgressLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const polishedRef = useRef(false);
  const streamRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Only trigger if status is pending and we haven't already polished
    if (generationStatus !== 'pending' || polishedRef.current || isPolishing) {
      return;
    }

    polishedRef.current = true;
    setIsPolishing(true);
    setProgressLabel('Starting automated polish...');

    // Trigger the stream API with isAutoPolish=true
    streamRef.current = apiClient.generateFromPromptStream(
      {
        prompt: 'Auto polish', // Dummy prompt, ignored by backend for isAutoPolish
        projectId,
        pageId,
        styleguideId: '', // Server can look this up
        isAutoPolish: true,
      },
      () => {}, // raw chunk, ignore
      (_result) => {
        // Polishing complete — no DB column needed.
        // Skeleton state is detected from treeData (skel_ IDs), so replacing
        // those components on the Puck canvas is sufficient to mark it "complete".
        setIsPolishing(false);
        onComplete();
      },
      (err) => {
        setError(err);
        setIsPolishing(false);
        onError(err);
      },
      (step, label) => {
        setProgressLabel(label);
      },
      (component, index, total, replacesSkelId) => {
        onComponentStream(component as ComponentData, index, total, replacesSkelId);
      }
    );

    return () => {
      if (streamRef.current) {
        streamRef.current.abort();
      }
    };
  }, [projectId, pageId, generationStatus, isPolishing, onComponentStream, onComplete, onError]);

  return {
    isPolishing,
    progressLabel,
    error,
  };
}

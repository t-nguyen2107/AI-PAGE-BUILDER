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

  // Store callbacks in refs to avoid aborting the stream on every re-render.
  // Inline arrow functions from parent create new references each render,
  // which would trigger effect cleanup → abort stream → immediate death.
  const onComponentStreamRef = useRef(onComponentStream);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);
  onComponentStreamRef.current = onComponentStream;
  onCompleteRef.current = onComplete;
  onErrorRef.current = onError;

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
        onCompleteRef.current();
      },
      (err) => {
        setError(err);
        setIsPolishing(false);
        onErrorRef.current(err);
      },
      (step, label) => {
        setProgressLabel(label);
      },
      (component, index, total, replacesSkelId) => {
        onComponentStreamRef.current(component as ComponentData, index, total, replacesSkelId);
      }
    );

    return () => {
      if (streamRef.current) {
        streamRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps — callbacks are via refs
  }, [projectId, pageId, generationStatus, isPolishing]);

  return {
    isPolishing,
    progressLabel,
    error,
  };
}

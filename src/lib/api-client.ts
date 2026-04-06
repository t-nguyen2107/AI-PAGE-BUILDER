import type { ApiResponse, Project, Page, Styleguide, GlobalSection, Revision, LibraryItem, AIGenerationRequest, AIGenerationResponse } from '@/types';
import type { WizardChatMessage, WinnieResponse, GenerateSettingsResponse, FinalizeRequest, FinalizeResponse, WizardProjectInfo } from '@/types/wizard';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const data = await res.json();
    return data as ApiResponse<T>;
  } catch (error) {
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: String(error) },
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
    };
  }
}

export const apiClient = {
  // ===== Projects =====
  listProjects: () => request<Project[]>('/projects'),
  createProject: (data: { name: string; description?: string }) =>
    request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  getProject: (id: string) => request<Project>(`/projects/${id}`),
  updateProject: (id: string, data: Partial<Project>) =>
    request<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id: string) =>
    request<null>(`/projects/${id}`, { method: 'DELETE' }),

  // ===== Pages =====
  listPages: (projectId: string) => request<Page[]>(`/projects/${projectId}/pages`),
  createPage: (projectId: string, data: { title: string; slug: string; isHomePage?: boolean }) =>
    request<Page>(`/projects/${projectId}/pages`, { method: 'POST', body: JSON.stringify(data) }),
  getPage: (projectId: string, pageId: string) =>
    request<Page>(`/projects/${projectId}/pages/${pageId}`),
  savePage: (projectId: string, pageId: string, treeData: unknown) =>
    request<Page>(`/projects/${projectId}/pages/${pageId}`, {
      method: 'PUT',
      body: JSON.stringify({ treeData }),
    }),
  updatePage: (projectId: string, pageId: string, data: Partial<Page>) =>
    request<Page>(`/projects/${projectId}/pages/${pageId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deletePage: (projectId: string, pageId: string) =>
    request<null>(`/projects/${projectId}/pages/${pageId}`, { method: 'DELETE' }),

  // ===== Styleguide =====
  getStyleguide: (projectId: string) =>
    request<Styleguide>(`/projects/${projectId}/styleguide`),
  updateStyleguide: (projectId: string, data: Partial<Styleguide>) =>
    request<Styleguide>(`/projects/${projectId}/styleguide`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // ===== Global Sections =====
  listGlobalSections: (projectId: string) =>
    request<GlobalSection[]>(`/projects/${projectId}/global-sections`),
  createGlobalSection: (projectId: string, data: { sectionType: string; sectionName: string; treeData: unknown }) =>
    request<GlobalSection>(`/projects/${projectId}/global-sections`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getGlobalSection: (projectId: string, sectionId: string) =>
    request<GlobalSection>(`/projects/${projectId}/global-sections/${sectionId}`),
  updateGlobalSection: (projectId: string, sectionId: string, data: { sectionName?: string; treeData?: unknown }) =>
    request<GlobalSection>(`/projects/${projectId}/global-sections/${sectionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteGlobalSection: (projectId: string, sectionId: string) =>
    request<null>(`/projects/${projectId}/global-sections/${sectionId}`, { method: 'DELETE' }),

  // ===== Revisions =====
  listRevisions: (projectId: string, pageId: string) =>
    request<Revision[]>(`/projects/${projectId}/revisions?pageId=${pageId}`),
  createRevision: (projectId: string, pageId: string, label?: string) =>
    request<Revision>(`/projects/${projectId}/revisions`, {
      method: 'POST',
      body: JSON.stringify({ pageId, label }),
    }),
  getRevision: (projectId: string, revisionId: string) =>
    request<Revision>(`/projects/${projectId}/revisions/${revisionId}`),
  restoreRevision: (projectId: string, revisionId: string) =>
    request<Page>(`/projects/${projectId}/revisions/${revisionId}`, { method: 'POST' }),

  // ===== Library =====
  listLibrary: (category?: string) =>
    request<LibraryItem[]>(`/library${category ? `?category=${category}` : ''}`),
  saveToLibrary: (data: Omit<LibraryItem, 'id' | 'createdAt' | 'updatedAt'>) =>
    request<LibraryItem>('/library', { method: 'POST', body: JSON.stringify(data) }),
  getLibraryItem: (id: string) => request<LibraryItem>(`/library/${id}`),
  updateLibraryItem: (id: string, data: Partial<LibraryItem>) =>
    request<LibraryItem>(`/library/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLibraryItem: (id: string) =>
    request<null>(`/library/${id}`, { method: 'DELETE' }),

  // ===== AI =====
  generateFromPrompt: (data: AIGenerationRequest) =>
    request<AIGenerationResponse>('/ai/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  searchComponents: (query: string) =>
    request<LibraryItem[]>('/ai/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  /**
   * Stream AI generation with real-time text feedback.
   * Returns an AbortController to cancel the stream.
   */
  generateFromPromptStream(
    data: AIGenerationRequest,
    onChunk: (text: string) => void,
    onDone: (result: AIGenerationResponse) => void,
    onError: (error: string) => void,
    onStatus?: (step: string, label: string) => void,
  ): AbortController {
    const controller = new AbortController();
    // Combine manual abort with 120s timeout to prevent infinite wait
    const timeoutSignal = AbortSignal.timeout(120_000);
    const combinedSignal = AbortSignal.any([controller.signal, timeoutSignal]);

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/ai/generate/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          signal: combinedSignal,
        });

        if (!res.ok || !res.body) {
          const errText = await res.text().catch(() => 'Unknown error');
          onError(`Stream failed (${res.status}): ${errText}`);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const match = line.match(/^data: ([\s\S]+)$/);
            if (!match) continue;

            try {
              const event = JSON.parse(match[1]);
              if (event.type === 'chunk' && event.content) onChunk(event.content);
              else if (event.type === 'done' && event.result) onDone(event.result);
              else if (event.type === 'error') onError(event.message ?? 'Unknown stream error');
              else if (event.type === 'status' && event.step) onStatus?.(event.step, event.label ?? event.step);
            } catch { /* skip malformed events */ }
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          onError(err instanceof Error ? err.message : 'Stream error');
        }
      }
    })();

    return controller;
  },

  /**
   * Get AI conversation history for a page.
   */
  getConversationHistory: (projectId: string, pageId: string) =>
    request<{ messages: Array<{ role: string; content: string; action?: string }> }>(
      `/ai/conversations?projectId=${projectId}&pageId=${pageId}`,
    ),

  /**
   * Clear AI conversation session for a page.
   */
  clearConversation: (projectId: string, pageId: string) =>
    request<{ cleared: boolean }>(`/ai/conversations?projectId=${projectId}&pageId=${pageId}`, {
      method: 'DELETE',
    }),

  // ===== AI Profile =====
  getAIProfile: (projectId: string) =>
    request<{
      profile: {
        businessType?: string;
        businessName?: string;
        industry?: string;
        targetAudience?: string;
        tone?: string;
        preferredStyle?: string;
        language?: string;
        contentThemes?: string;
        totalSessions?: number;
        lastAnalysisAt?: string | null;
      } | null;
      memoryCount: number;
    }>(`/ai/profile?projectId=${projectId}`),

  updateAIProfile: (projectId: string, data: Record<string, string>) =>
    request<Record<string, string>>(`/ai/profile?projectId=${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  resetAIProfile: (projectId: string) =>
    request<{ reset: boolean }>(`/ai/profile?projectId=${projectId}`, {
      method: 'DELETE',
    }),

  getAIMemories: (projectId: string, category?: string, page = 1, limit = 20) =>
    request<{
      memories: Array<{
        id: string;
        category: string;
        content: string;
        confidence: number | null;
        timesReferenced: number;
        createdAt: string;
      }>;
      total: number;
      page: number;
      limit: number;
    }>(`/ai/profile/memories?projectId=${projectId}${category ? `&category=${category}` : ''}&page=${page}&limit=${limit}`),

  deleteAIMemory: (projectId: string, memoryId: string) =>
    request<{ deleted: boolean }>(`/ai/profile/memories?projectId=${projectId}&memoryId=${memoryId}`, {
      method: 'DELETE',
    }),

  // ===== Wizard (New Project) =====

  /**
   * Stream chat with Winnie AI assistant for project onboarding.
   */
  wizardStreamChat(
    data: { messages: WizardChatMessage[]; userMessage: string; collectedSoFar?: Record<string, unknown> },
    onChunk: (text: string) => void,
    onDone: (result: WinnieResponse) => void,
    onError: (error: string) => void,
    onStatus?: (step: string) => void,
  ): AbortController {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/ai/wizard/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const errText = await res.text().catch(() => 'Unknown error');
          onError(`Chat failed (${res.status}): ${errText}`);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const match = line.match(/^data: ([\s\S]+)$/);
            if (!match) continue;

            try {
              const event = JSON.parse(match[1]);
              if (event.type === 'chunk' && event.content) onChunk(event.content);
              else if (event.type === 'done' && event.extractedInfo) onDone(event.extractedInfo as WinnieResponse);
              else if (event.type === 'error') onError(event.message ?? 'Chat error');
              else if (event.type === 'status') onStatus?.(event.step);
            } catch { /* skip malformed events */ }
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          onError(err instanceof Error ? err.message : 'Chat error');
        }
      }
    })();

    return controller;
  },

  /**
   * Generate styleguide + SEO suggestions from collected project info.
   */
  wizardGenerateSettings: (projectInfo: WizardProjectInfo) =>
    request<GenerateSettingsResponse>('/ai/wizard/generate-settings', {
      method: 'POST',
      body: JSON.stringify({ projectInfo }),
    }),

  /**
   * Create project with all wizard data (project + styleguide + pages + AI profile).
   */
  wizardFinalize: (data: FinalizeRequest) =>
    request<FinalizeResponse>('/ai/wizard/finalize', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  updatedAt: string;
  pages?: { id: string; title: string }[];
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [menuProjectId, setMenuProjectId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const createInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (creating && createInputRef.current) {
      createInputRef.current.focus();
    }
  }, [creating]);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuProjectId(null);
      }
    }
    if (menuProjectId) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [menuProjectId]);

  async function fetchProjects() {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success) {
        setProjects(data.data ?? []);
      }
    } catch {
      console.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProject() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setNewName('');
        setCreating(false);
        setProjects((prev) => [data.data, ...prev]);
      }
    } catch {
      console.error('Failed to create project');
    }
  }

  async function handleDeleteProject(projectId: string) {
    setDeletingId(projectId);
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
      }
    } catch {
      console.error('Failed to delete project');
    } finally {
      setDeletingId(null);
      setMenuProjectId(null);
    }
  }

  function openCreateModal() {
    setNewName('');
    setCreating(true);
  }

  const gradientPatterns = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Top Nav */}
      <nav className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-16 px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-primary/70 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-on-surface">PageBuilder</span>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Project
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Your Projects</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            {loading ? 'Loading...' : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-16/10 rounded-xl bg-surface-container-low mb-3" />
                <div className="h-4 w-2/3 rounded bg-surface-container-low mb-2" />
                <div className="h-3 w-1/3 rounded bg-surface-container-low" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-2xl bg-surface-container-low flex items-center justify-center mb-6">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-on-surface mb-2">No projects yet</h2>
            <p className="text-on-surface-variant text-sm mb-8 max-w-sm">
              Create your first project and let AI help you build a stunning website.
            </p>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Create First Project
            </button>
          </div>
        ) : (
          /* Project Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project, index) => (
              <Link
                key={project.id}
                href={`/builder/${project.id}`}
                className="group block"
              >
                {/* Thumbnail */}
                <div className="aspect-16/10 rounded-xl overflow-hidden mb-3 relative">
                  {project.thumbnailUrl ? (
                    <img
                      src={project.thumbnailUrl}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                      style={{ background: gradientPatterns[index % gradientPatterns.length] }}
                    >
                      <span className="text-white/90 text-3xl font-bold tracking-tight">
                        {project.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                </div>

                {/* Info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-on-surface truncate group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-on-surface-variant">
                      <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                      <span className="w-1 h-1 rounded-full bg-on-surface-outline/40" />
                      <span>{project.pages?.length ?? 0} page{(project.pages?.length ?? 0) !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Menu Button */}
                  <div ref={menuProjectId === project.id ? menuRef : null} className="relative">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMenuProjectId(menuProjectId === project.id ? null : project.id);
                      }}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all opacity-0 group-hover:opacity-100"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="5" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="12" cy="19" r="2" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {menuProjectId === project.id && (
                      <div className="absolute right-0 top-9 bg-surface-lowest rounded-xl shadow-xl border border-outline-variant/60 py-1.5 z-50 min-w-40">
                        <Link
                          href={`/builder/${project.id}`}
                          className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-on-surface hover:bg-surface-container transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Edit in Builder
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (confirm(`Delete "${project.name}"? This cannot be undone.`)) {
                              handleDeleteProject(project.id);
                            }
                          }}
                          disabled={deletingId === project.id}
                          className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-error hover:bg-error/10 transition-colors w-full disabled:opacity-50"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3,6 5,6 21,6" />
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                          {deletingId === project.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}

            {/* Add New Card */}
            <button
              onClick={openCreateModal}
              className="group block"
            >
              <div className="aspect-16/10 rounded-xl border-2 border-dashed border-outline-variant/60 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all">
                <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-on-surface-variant group-hover:text-primary transition-colors">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-on-surface-variant group-hover:text-primary transition-colors">New Project</span>
              </div>
            </button>
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {creating && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setCreating(false)}
        >
          <div
            className="bg-surface-lowest rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-lg font-bold text-on-surface mb-1">New Project</h3>
              <p className="text-sm text-on-surface-variant mb-5">Give your project a name to get started.</p>
              <input
                ref={createInputRef}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                placeholder="e.g. My Portfolio, Landing Page..."
                className="w-full h-11 rounded-lg bg-surface px-4 text-sm text-on-surface placeholder:text-on-surface-outline focus:outline-none focus:ring-2 focus:ring-primary/30 border border-outline-variant transition-all"
              />
            </div>
            <div className="flex gap-3 px-6 pb-6 justify-end">
              <button
                onClick={() => setCreating(false)}
                className="px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newName.trim()}
                className="bg-primary text-on-primary px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

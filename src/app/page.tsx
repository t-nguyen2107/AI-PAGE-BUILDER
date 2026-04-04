'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PROJECT_GRADIENTS } from '@/lib/constants';
import { SkeletonCard } from '@/components/ui/skeleton';

interface Project {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  updatedAt: string;
  pages?: { id: string; title: string }[];
}

export default function Home() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [menuProjectId, setMenuProjectId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const createInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchProjects(); }, []);

  useEffect(() => {
    if (creating && createInputRef.current) createInputRef.current.focus();
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
      if (data.success) setProjects(data.data ?? []);
    } catch { console.error('Failed to fetch projects'); }
    finally { setLoading(false); }
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
    } catch { console.error('Failed to create project'); }
  }

  async function handleDeleteProject(projectId: string) {
    setDeletingId(projectId);
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch { console.error('Failed to delete project'); }
    finally { setDeletingId(null); setMenuProjectId(null); }
  }

  function openCreateModal() {
    setNewName('');
    setCreating(true);
  }

  function formatRelativeTime(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = now - then;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* ── Top Nav ── */}
      <nav className="sticky top-0 z-sticky bg-surface/80 backdrop-blur-xl border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-14 px-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px] text-on-primary">layers</span>
            </div>
            <span className="text-base font-bold tracking-tight text-on-surface">PageBuilder</span>
          </div>
          <button
            onClick={() => router.push('/new-project')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold',
              'bg-primary text-on-primary shadow-sm',
              'hover:opacity-90 active:scale-[0.98] transition-all'
            )}
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Project
          </button>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Your Projects</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            {loading ? 'Loading...' : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {loading ? (
          /* ── Skeleton Grid ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-surface-container flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl text-on-surface-outline">deployed_code</span>
            </div>
            <h2 className="text-xl font-bold text-on-surface mb-2">No projects yet</h2>
            <p className="text-on-surface-variant text-sm mb-8 max-w-sm">
              Create your first project and let AI help you build a stunning website.
            </p>
            <button
              onClick={() => router.push('/new-project')}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold',
                'bg-primary text-on-primary shadow-sm',
                'hover:opacity-90 active:scale-[0.98] transition-all'
              )}
            >
              <span className="material-symbols-outlined text-lg">auto_awesome</span>
              Create First Project
            </button>
          </div>
        ) : (
          /* ── Project Grid ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project, index) => (
              <Link
                key={project.id}
                href={`/builder/${project.id}`}
                className="group block"
              >
                {/* Thumbnail */}
                <div className="aspect-video rounded-xl overflow-hidden mb-3 relative">
                  {project.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.thumbnailUrl}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                      style={{ background: PROJECT_GRADIENTS[index % PROJECT_GRADIENTS.length] }}
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
                    <div className="flex items-center gap-3 mt-1 text-xs text-on-surface-outline">
                      <span>{formatRelativeTime(project.updatedAt)}</span>
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
                      className={cn(
                        'p-1.5 rounded-lg transition-all',
                        'text-on-surface-outline hover:text-on-surface hover:bg-surface-container',
                        'opacity-0 group-hover:opacity-100'
                      )}
                      aria-label="Project options"
                    >
                      <span className="material-symbols-outlined text-lg">more_vert</span>
                    </button>

                    {/* Dropdown Menu */}
                    {menuProjectId === project.id && (
                      <div className={cn(
                        'absolute right-0 top-9 rounded-xl shadow-xl',
                        'bg-surface-lowest border border-outline-variant/60 py-1.5',
                        'z-dropdown min-w-40',
                        'animate-scaleIn'
                      )}>
                        <Link
                          href={`/builder/${project.id}`}
                          className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-on-surface hover:bg-surface-container transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
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
                          <span className="material-symbols-outlined text-sm">delete</span>
                          {deletingId === project.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}

            {/* ── Add New Card ── */}
            <button onClick={openCreateModal} className="group block">
              <div className={cn(
                'aspect-video rounded-xl border-2 border-dashed',
                'border-outline-variant/60 flex flex-col items-center justify-center gap-3',
                'hover:border-primary/50 hover:bg-primary/5 transition-all'
              )}>
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-on-surface-outline group-hover:text-primary transition-colors">
                    add
                  </span>
                </div>
                <span className="text-xs font-medium text-on-surface-outline group-hover:text-primary transition-colors">
                  New Project
                </span>
              </div>
            </button>
          </div>
        )}
      </main>

      {/* ── Create Project Modal ── */}
      {creating && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-modal flex items-center justify-center p-4"
          onClick={() => setCreating(false)}
        >
          <div
            className={cn(
              'bg-surface-lowest rounded-2xl shadow-2xl w-full max-w-md',
              'animate-scaleIn'
            )}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Create new project"
          >
            <div className="p-6">
              <h3 className="text-lg font-bold text-on-surface mb-1">New Project</h3>
              <p className="text-sm text-on-surface-variant mb-5">
                Give your project a name to get started.
              </p>
              <input
                ref={createInputRef}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                placeholder="e.g. My Portfolio, Landing Page..."
                className={cn(
                  'w-full h-11 rounded-lg bg-surface px-4 text-sm',
                  'text-on-surface placeholder:text-on-surface-outline',
                  'border border-outline-variant',
                  'focus:outline-none focus:ring-2 focus:ring-primary/30',
                  'transition-all'
                )}
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
                className={cn(
                  'px-5 py-2 rounded-lg text-sm font-semibold',
                  'bg-primary text-on-primary shadow-sm',
                  'disabled:opacity-40 hover:opacity-90 active:scale-[0.98] transition-all'
                )}
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

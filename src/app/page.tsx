'use client';

import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    fetchProjects();
  }, []);

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
        setProjects((prev) => [data.data, ...prev]);
      }
    } catch {
      console.error('Failed to create project');
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteProject(projectId: string) {
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
      }
    } catch {
      console.error('Failed to delete project');
    } finally {
      setMenuProjectId(null);
    }
  }

  return (
    <div
      className="min-h-screen bg-surface text-on-surface"
      onClick={() => setMenuProjectId(null)}
    >
      {/* TopNavBar — glass effect */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl flex justify-between items-center h-16 px-8 border-b border-slate-100/50">
        <div className="flex items-center gap-8">
          <span className="text-lg font-bold tracking-tighter text-slate-900">CuratorAI</span>
          <div className="hidden md:flex gap-6 items-center">
            <a className="text-blue-700 font-semibold border-b-2 border-blue-700 pb-1 text-sm tracking-tight cursor-pointer">Pages</a>
            <a className="text-slate-500 hover:text-slate-900 transition-colors duration-200 text-sm tracking-tight cursor-pointer">History</a>
            <a className="text-slate-500 hover:text-slate-900 transition-colors duration-200 text-sm tracking-tight cursor-pointer">Components</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input
              className="bg-surface-container-low border-none rounded-full pl-10 pr-4 py-1.5 text-sm focus:ring-1 focus:ring-primary w-64 transition-all"
              placeholder="Search projects..."
              type="text"
            />
          </div>
          <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden flex items-center justify-center border border-outline-variant/20">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">account_circle</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        {/* Hero Section */}
        <section className="relative h-[400px] overflow-hidden m-6 rounded-3xl">
          <div className="absolute inset-0 bg-slate-900/40 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />
          <div
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              background: 'linear-gradient(135deg, #0058be 0%, #2170e4 30%, #5b93e0 60%, #f8f9fa 100%)',
            }}
          />
          <div className="relative z-20 h-full flex flex-col justify-end p-12 max-w-4xl">
            <span className="uppercase text-[10px] tracking-[0.2em] text-white/70 font-bold mb-4">Workspace Overview</span>
            <h1 className="text-6xl font-extrabold text-white tracking-tighter mb-6 leading-tight">Your Digital Workshop</h1>
            <p className="text-lg text-white/80 max-w-xl leading-relaxed mb-8">
              An editorial canvas where your vision meets artificial intelligence. Curate, build, and publish with sophisticated precision.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => newName.trim() && handleCreateProject()}
                className="btn-primary-gradient text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined">auto_awesome</span>
                New AI Project
              </button>
              <button
                onClick={() => setCreating(true)}
                className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all"
              >
                View Templates
              </button>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <section className="px-10 pb-20">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-on-surface tracking-tight mb-2">Recent Projects</h2>
              <p className="text-on-surface-variant font-medium">Continue where you left off in your creative journey.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-on-surface-variant">
              <div className="h-5 w-5 animate-ai-pulse rounded-full bg-primary/20" />
              Loading...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/builder/${project.id}`}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-surface-container-low mb-4 relative">
                    {/* Placeholder thumbnail */}
                    <div className="w-full h-full bg-gradient-to-br from-surface-container to-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-on-surface-outline/30">dashboard</span>
                    </div>
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur shadow-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-primary">
                      Active
                    </div>
                  </div>
                  <div className="px-2 relative">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-lg text-on-surface">{project.name}</h3>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setMenuProjectId(menuProjectId === project.id ? null : project.id);
                        }}
                        className="text-on-surface-variant hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                      {menuProjectId === project.id && (
                        <div className="absolute right-2 top-10 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-20 min-w-32">
                          <Link
                            href={`/builder/${project.id}`}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Edit
                          </Link>
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteProject(project.id); }}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors w-full"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        Edited {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">layers</span>
                        {project.pages?.length ?? 0} page{(project.pages?.length ?? 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Empty State / New Project Card */}
              <button
                onClick={() => {
                  const input = document.getElementById('new-project-input');
                  input?.focus();
                }}
                className="group cursor-pointer border-2 border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center aspect-[16/10] hover:border-primary transition-all bg-surface-container-lowest/50 hover:bg-white"
              >
                <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">add_circle</span>
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant group-hover:text-primary">Start New Project</p>
                <p className="text-xs text-on-surface-variant mt-2">Begin with AI assistance</p>
              </button>
            </div>
          )}

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between h-64">
              <span className="material-symbols-outlined text-primary text-4xl">analytics</span>
              <div>
                <h4 className="text-4xl font-bold tracking-tighter text-on-surface">{projects.length}</h4>
                <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mt-2">Total Projects</p>
              </div>
            </div>
            <div className="bg-surface-container-low p-8 rounded-3xl flex flex-col justify-between h-64">
              <span className="material-symbols-outlined text-tertiary text-4xl">bolt</span>
              <div>
                <h4 className="text-4xl font-bold tracking-tighter text-on-surface">AI</h4>
                <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mt-2">Powered Generation</p>
              </div>
            </div>
            <div className="relative rounded-3xl overflow-hidden h-64 btn-primary-gradient">
              <div className="p-8 flex flex-col justify-end h-full text-white">
                <span className="material-symbols-outlined text-4xl mb-4">smart_toy</span>
                <p className="text-lg font-bold leading-tight">Let AI build your website from a simple prompt.</p>
                <button
                  onClick={() => setCreating(true)}
                  className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-white underline underline-offset-4 hover:opacity-80 transition-opacity"
                >
                  Try AI Builder
                </button>
              </div>
            </div>
          </div>

          {/* Inline Create — hidden input for "Start New Project" focus target */}
          {creating && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
                <h3 className="text-xl font-bold text-on-surface mb-4">Create New Project</h3>
                <input
                  id="new-project-input"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                  placeholder="Project name..."
                  className="w-full h-12 rounded-xl bg-surface-low px-4 text-sm text-on-surface placeholder:text-on-surface-outline focus:outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant transition-all"
                  autoFocus
                />
                <div className="flex gap-3 mt-4 justify-end">
                  <button
                    onClick={() => setCreating(false)}
                    className="px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateProject}
                    disabled={!newName.trim()}
                    className="btn-primary-gradient text-white px-6 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 transition-all"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* FAB — AI Assistant */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => setCreating(true)}
          className="btn-primary-gradient text-white w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
        </button>
      </div>
    </div>
  );
}

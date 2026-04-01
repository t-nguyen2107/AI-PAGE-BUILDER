import React from 'react';
import { BuilderHeader } from '../components/BuilderHeader';
import { Sidebar } from '../components/Sidebar';
import { Canvas } from '../components/Canvas';
import { RightPanel } from '../components/RightPanel';
import { BuilderClientShell } from '../components/BuilderClientShell';

export default async function BuilderLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <BuilderClientShell projectId={projectId}>
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-surface">
        {/* Fixed Header */}
        <BuilderHeader projectId={projectId} />

        {/* Body: Sidebar | Canvas | Right Panel */}
        <div className="flex-1 flex overflow-hidden pt-16">
          <Sidebar projectId={projectId} />
          <Canvas projectId={projectId} />
          <RightPanel projectId={projectId} />
        </div>

        {/* Nested route outlet */}
        {children}
      </div>
    </BuilderClientShell>
  );
}

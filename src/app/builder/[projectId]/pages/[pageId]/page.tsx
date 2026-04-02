"use client";

import React from "react";
import { PuckEditor } from "@/puck/PuckEditor";

export default function PageEditor({
  params,
}: {
  params: Promise<{ projectId: string; pageId: string }>;
}) {
  const { projectId, pageId } = React.use(params);

  return <PuckEditor projectId={projectId} pageId={pageId} />;
}

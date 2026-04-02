import React from "react";
import { ToastContainer } from "@/components/ui/toast-container";

export default async function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}

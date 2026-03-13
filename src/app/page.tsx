"use client";

import dynamic from "next/dynamic";

const MiniAppShell = dynamic(() => import("@/views/shell"), {
  ssr: false,
});

export default function Page() {
  return <MiniAppShell />;
}

"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    JitsiMeetExternalAPI?: any;
  }
}

type Props = {
  roomUrl: string;             // e.g. https://meet.jit.si/MyClassRoom-ABC123
  displayName?: string;
  email?: string;
  width?: number | string;
  height?: number | string;
};

export default function JitsiEmbed({
  roomUrl,
  displayName,
  email,
  width = "100%",
  height = 600,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<any>(null);

  useEffect(() => {
    // make sure script is loaded
    const ensureScript = () =>
      new Promise<void>((resolve) => {
        if (window.JitsiMeetExternalAPI) return resolve();
        const s = document.createElement("script");
        s.src = "https://meet.jit.si/external_api.js";
        s.async = true;
        s.onload = () => resolve();
        document.body.appendChild(s);
      });

    const mount = async () => {
      await ensureScript();
      if (!containerRef.current || !window.JitsiMeetExternalAPI) return;

      // parse room from URL
      const url = new URL(roomUrl);
      const roomName = url.pathname.replace(/^\/+/, ""); // everything after domain
      const parentNode = containerRef.current;

      apiRef.current = new window.JitsiMeetExternalAPI(url.host, {
        roomName,
        parentNode,
        width,
        height,
        userInfo: { displayName, email },
        configOverwrite: {
          // examples: disable prejoin page, start with audio muted
          prejoinConfig: { enabled: true },
          startWithAudioMuted: true,
        },
        interfaceConfigOverwrite: {
          TILE_VIEW_MAX_COLUMNS: 4,
        },
      });
    };

    mount();

    return () => {
      try {
        apiRef.current?.dispose?.();
        apiRef.current = null;
      } catch (_) {}
    };
  }, [roomUrl, displayName, email, width, height]);

  return <div ref={containerRef} style={{ width, height }} />;
}
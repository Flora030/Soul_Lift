// app/layout.js
"use client";

import './globals.css';
import { useEffect } from 'react';

export default function RootLayout({ children }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://web-chat.global.assistant.watson.appdomain.cloud/versions/latest/WatsonAssistantChatEntry.js";
    script.async = true;
    script.onload = () => {
      window.watsonAssistantChatOptions = {
        integrationID: "f13d80dd-4c82-4d1a-af95-99e1c63b7dd5", // The ID of this integration.
        region: "au-syd", // The region your integration is hosted in.
        serviceInstanceID: "e179860a-c59b-41b7-9f0c-86ef70842bc9", // The ID of your service instance.
        onLoad: async (instance) => { await instance.render(); }
      };
    };
    document.head.appendChild(script);
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

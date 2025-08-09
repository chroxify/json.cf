"use client";

import { useState } from "react";
import { ConfigViewer } from "@/components/ConfigViewer";
import { ConfigCreator } from "@/components/ConfigCreator";
import { ConfigUpdater } from "@/components/ConfigUpdater";
import { Button, Panel } from "@/components/ui";
import Link from "next/link";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"view" | "create" | "update">(
    "view"
  );
  const [lastLatency, setLastLatency] = useState<number | null>(null);

  // Persistent form data
  const [viewConfigId, setViewConfigId] = useState("");
  const [viewSecret, setViewSecret] = useState("");
  const [createConfigData, setCreateConfigData] = useState(
    '{\n  "exampleKey": "exampleValue",\n  "featureFlag": true\n}'
  );
  const [isPrivate, setIsPrivate] = useState(false);

  // Update config state
  const [updateConfigId, setUpdateConfigId] = useState("");
  const [updateSecret, setUpdateSecret] = useState("");
  const [updateConfigData, setUpdateConfigData] = useState(
    '{\n  "exampleKey": "exampleValue",\n  "featureFlag": true\n}'
  );

  // Persistent result state
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const [viewConfig, setViewConfig] = useState<any>(null);
  const [viewError, setViewError] = useState("");
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const [createResult, setCreateResult] = useState<any>(null);
  const [createError, setCreateError] = useState("");
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const [updateResult, setUpdateResult] = useState<any>(null);
  const [updateError, setUpdateError] = useState("");

  return (
    <div className="min-h-[100dvh]">
      {/* Matrix background */}
      {/* <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-[0.02] bg-[linear-gradient(90deg,_oklch(0.4_0_0)_1px,_transparent_1px),_linear-gradient(0deg,_oklch(0.4_0_0)_1px,_transparent_1px)] bg-[length:20px_20px]" /> */}

      {/* Main container */}
      <div className="container mx-auto p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 max-w-6xl">
        {/* Header */}
        <header>
          <Panel className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl font-mono text-foreground font-medium tracking-wider">
                  JSON.CF
                </h1>
                <div className="text-muted-foreground text-sm -ml-0.5">
                  [EDGE_CONFIG_TERMINAL] v1.0.0
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success animate-pulse rounded-full" />
                  <span className="text-muted-foreground text-xs">
                    CONNECTED
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">STATUS:</span>
                  <span className="text-foreground text-xs">OPERATIONAL</span>
                </div>
              </div>
            </div>
          </Panel>
        </header>

        <div className="space-y-4 sm:space-y-6">
          {/* Navigation */}
          <nav>
            <Panel className="flex flex-col sm:flex-row gap-2 p-4">
              <Button
                onClick={() => setActiveTab("view")}
                active={activeTab === "view"}
                className="px-6 w-full sm:w-auto"
              >
                [VIEW_CONFIG]
              </Button>
              <Button
                onClick={() => setActiveTab("create")}
                active={activeTab === "create"}
                className="px-6 w-full sm:w-auto"
              >
                [CREATE_CONFIG]
              </Button>
              <Button
                onClick={() => setActiveTab("update")}
                active={activeTab === "update"}
                className="px-6 w-full sm:w-auto"
              >
                [UPDATE_CONFIG]
              </Button>
            </Panel>
          </nav>

          {/* Main content */}
          <main className="space-y-4 sm:space-y-6">
            {activeTab === "view" && (
              <ConfigViewer
                onLatencyUpdate={setLastLatency}
                configId={viewConfigId}
                onConfigIdChange={setViewConfigId}
                secret={viewSecret}
                onSecretChange={setViewSecret}
                currentConfig={viewConfig}
                onCurrentConfigChange={setViewConfig}
                error={viewError}
                onErrorChange={setViewError}
              />
            )}
            {activeTab === "create" && (
              <ConfigCreator
                configData={createConfigData}
                onConfigDataChange={setCreateConfigData}
                isPrivate={isPrivate}
                onIsPrivateChange={setIsPrivate}
                result={createResult}
                onResultChange={setCreateResult}
                error={createError}
                onErrorChange={setCreateError}
              />
            )}
            {activeTab === "update" && (
              <ConfigUpdater
                configId={updateConfigId}
                onConfigIdChange={setUpdateConfigId}
                secret={updateSecret}
                onSecretChange={setUpdateSecret}
                configData={updateConfigData}
                onConfigDataChange={setUpdateConfigData}
                result={updateResult}
                onResultChange={setUpdateResult}
                error={updateError}
                onErrorChange={setUpdateError}
              />
            )}
          </main>
        </div>

        {/* Footer */}
        <footer>
          <Panel className="p-4">
            <div className="space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="space-y-1 sm:space-y-0 sm:space-x-4 sm:flex">
                  <div className="text-muted-foreground">
                    <span>ENDPOINT:</span>{" "}
                    <span className="break-all">
                      {process.env.NODE_ENV === "production"
                        ? "https://api.json.cf/v1"
                        : "http://localhost:8787/v1"}
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    <span>LATENCY:</span>{" "}
                    {lastLatency ? `${lastLatency}ms` : "<50ms"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="https://json.cf/github"
                    target="_blank"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    [GITHUB]
                  </Link>
                  <Link
                    href="https://json.cf/docs"
                    target="_blank"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    [DOCS]
                  </Link>
                </div>
              </div>
            </div>
          </Panel>
        </footer>
      </div>
    </div>
  );
}

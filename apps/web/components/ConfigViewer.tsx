"use client";

import { useState } from "react";
import { jsonConfig } from "json.cf/react";
import { Button, Input, Label, Panel } from "@/components/ui";
import { cn } from "@/lib/utils";

interface ConfigViewerProps {
  onLatencyUpdate?: (latency: number | null) => void;
  configId?: string;
  onConfigIdChange?: (configId: string) => void;
  secret?: string;
  onSecretChange?: (secret: string) => void;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  currentConfig?: any | null;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  onCurrentConfigChange?: (config: any | null) => void;
  error?: string;
  onErrorChange?: (error: string) => void;
}

export function ConfigViewer({
  onLatencyUpdate,
  configId = "",
  onConfigIdChange,
  secret = "",
  onSecretChange,
  currentConfig = null,
  onCurrentConfigChange,
  error = "",
  onErrorChange,
}: ConfigViewerProps) {
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const fetchConfig = async () => {
    if (!configId.trim()) {
      onErrorChange?.("CONFIG_ID_REQUIRED");
      return;
    }

    setLoading(true);
    onErrorChange?.("");

    const startTime = performance.now();

    try {
      const config = jsonConfig({
        id: configId.trim(),
        baseUrl: process.env.NODE_ENV === 'production' ? "https://api.json.cf/v1" : "http://localhost:8787/v1",
        ...(secret.trim() && { secret: secret.trim() }),
      });

      const result = await config.getConfig();
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      onCurrentConfigChange?.(result);
      onErrorChange?.("");
      onLatencyUpdate?.(latency);
    } catch (err) {
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      const errorMessage = err instanceof Error 
        ? err.message 
        : typeof err === 'string' 
        ? err 
        : "FETCH_ERROR";
      onErrorChange?.(errorMessage);
      onCurrentConfigChange?.(null);
      onLatencyUpdate?.(latency);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      fetchConfig();
    }
  };

  const copyToClipboard = async () => {
    if (!currentConfig?.data) return;

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(currentConfig.data, null, 2)
      );
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error("Failed to copy:", err);
    }
  };

  return (
    <>
      <Panel className="flex flex-col gap-4">
        <span className="text-muted-foreground text-sm">[CONFIG_VIEWER]</span>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>CONFIG_ID</Label>
            <Input
              type="text"
              value={configId}
              onChange={(e) => onConfigIdChange?.(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter config ID..."
              className="w-full"
              disabled={loading}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label>SECRET (OPTIONAL)</Label>
            <Input
              type="password"
              value={secret}
              onChange={(e) => onSecretChange?.(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter secret for private configs..."
              className="w-full"
              disabled={loading}
              autoComplete="off"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={fetchConfig} disabled={loading}>
              FETCH
            </Button>
          </div>
        </div>
      </Panel>

      {error && (
        <Panel variant="destructive" className="p-3">
          <div className="flex items-center gap-2">
            <span className="text-destructive text-xs">[ERROR]</span>
            <span className="text-destructive text-sm">{error}</span>
          </div>
        </Panel>
      )}

      {currentConfig && (
        <Panel className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">
              [CONFIG_RESULT]
            </span>
            <span className="text-muted-foreground text-xs">
              {configId} |{" "}
              <span
                className={cn(
                  currentConfig.error ? "text-destructive" : "text-success"
                )}
              >
                {currentConfig.error ? "ERROR" : "SUCCESS"}
              </span>
            </span>
          </div>

          <Panel>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  TIMESTAMP:{" "}
                  {new Date(
                    currentConfig.metadata?.timestamp || Date.now()
                  ).toISOString()}
                </div>
                <Button
                  onClick={copyToClipboard}
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground p-0 h-fit"
                >
                  {copySuccess ? "COPIED" : "COPY"}
                </Button>
              </div>

              {currentConfig.error && (
                <div className="text-destructive text-sm">
                  ERROR: {currentConfig.error}
                </div>
              )}

              {currentConfig.data && (
                <pre className="text-foreground text-sm overflow-x-auto">
                  {JSON.stringify(currentConfig.data, null, 2)}
                </pre>
              )}

              {Object.keys(currentConfig.data || {}).length === 0 &&
                !currentConfig.error && (
                  <div className="text-warning text-sm">NO_DATA_FOUND</div>
                )}
            </div>
          </Panel>
        </Panel>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { Button, Checkbox, Label, Panel, Textarea } from "@/components/ui";

interface CreateConfigResponse {
  success: boolean;
  data?: {
    id: string;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    [key: string]: any;
  };
  error?: string;
}

interface ConfigCreatorProps {
  configData?: string;
  onConfigDataChange?: (configData: string) => void;
  isPrivate?: boolean;
  onIsPrivateChange?: (isPrivate: boolean) => void;
  result?: CreateConfigResponse | null;
  onResultChange?: (result: CreateConfigResponse | null) => void;
  error?: string;
  onErrorChange?: (error: string) => void;
}

export function ConfigCreator({
  configData = '{\n  "exampleKey": "exampleValue",\n  "featureFlag": true\n}',
  onConfigDataChange,
  isPrivate = false,
  onIsPrivateChange,
  result = null,
  onResultChange,
  error = "",
  onErrorChange
}: ConfigCreatorProps) {
  const [loading, setLoading] = useState(false);
  const [copyIdSuccess, setCopyIdSuccess] = useState(false);
  const [copySecretSuccess, setCopySecretSuccess] = useState(false);

  const createConfig = async () => {
    setLoading(true);
    onErrorChange?.("");
    onResultChange?.(null);

    try {
      // Validate JSON
      let parsedData: Record<string, unknown>;
      try {
        parsedData = JSON.parse(configData);
      } catch (e) {
        throw new Error("INVALID_JSON_FORMAT");
      }

      const response = await fetch(
        `${process.env.NODE_ENV === 'production' ? 'https://api.json.cf' : 'http://localhost:8787'}/v1/config?private=${isPrivate}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parsedData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || `HTTP_${response.status}`
        );
      }

      // Transform the response to match our expected format
      onResultChange?.({
        success: true,
        data: data.data || data,
      });
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : typeof err === 'string' 
        ? err 
        : "CREATE_ERROR";
      onErrorChange?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    onConfigDataChange?.(
      '{\n  "exampleKey": "exampleValue",\n  "featureFlag": true\n}'
    );
    onIsPrivateChange?.(false);
    onResultChange?.(null);
    onErrorChange?.("");
  };

  const copyConfigId = async () => {
    if (!result?.data?.id) return;

    try {
      await navigator.clipboard.writeText(result.data.id);
      setCopyIdSuccess(true);
      setTimeout(() => setCopyIdSuccess(false), 2000);
    } catch (err) {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error("Failed to copy:", err);
    }
  };

  const copyConfigSecret = async () => {
    if (!result?.data?.secret) return;

    try {
      await navigator.clipboard.writeText(result.data.secret);
      setCopySecretSuccess(true);
      setTimeout(() => setCopySecretSuccess(false), 2000);
    } catch (err) {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error("Failed to copy:", err);
    }
  };

  return (
    <>
      <Panel className="flex flex-col gap-4">
        <span className="text-muted-foreground text-sm">[CONFIG_CREATOR]</span>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>CONFIG_DATA (JSON)</Label>
            <Textarea
              value={configData}
              onChange={(e) => onConfigDataChange?.(e.target.value)}
              className="w-full min-h-[108px]"
              placeholder="Enter JSON config data..."
              disabled={loading}
              autoComplete="off"
            />
            <Checkbox
              checked={isPrivate}
              onChange={(e) => onIsPrivateChange?.(e.target.checked)}
              label="PRIVATE_CONFIG"
              disabled={loading}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={createConfig} disabled={loading}>
              {loading ? "CREATING..." : "CREATE_CONFIG"}
            </Button>
            <Button
              onClick={resetForm}
              disabled={loading}
              variant="destructive"
            >
              RESET
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

      {result?.success && result?.data?.id && (
        <Panel className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">
              [CONFIG_RESULT]
            </span>
            <span className="text-success text-xs">SUCCESS</span>
          </div>

          <Panel>
            <div className="space-y-2">
              <div className="text-foreground text-sm">CONFIG_ID:</div>
              <Panel className="h-9 p-0 flex items-center justify-between px-2 pt-0.5">
                <code className="text-foreground leading-none">
                  {result.data.id}
                </code>
                <Button
                  onClick={copyConfigId}
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground p-0 h-fit"
                >
                  {copyIdSuccess ? "COPIED" : "COPY"}
                </Button>
              </Panel>
              
              {isPrivate && result.data.secret && (
                <>
                  <div className="text-foreground text-sm mt-3">SECRET:</div>
                  <Panel className="h-9 p-0 flex items-center justify-between px-2 pt-0.5">
                    <code className="text-foreground leading-none">
                      {result.data.secret}
                    </code>
                    <Button
                      onClick={copyConfigSecret}
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground p-0 h-fit"
                    >
                      {copySecretSuccess ? "COPIED" : "COPY"}
                    </Button>
                  </Panel>
                </>
              )}
              
              <div className="text-muted-foreground text-xs">
                {isPrivate 
                  ? "Use both the ID and secret to fetch your private config"
                  : "Use this ID to fetch your config"
                }
              </div>
            </div>
          </Panel>
        </Panel>
      )}
    </>
  );
}

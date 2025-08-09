"use client";

import { useState } from "react";
import { Button, Input, Label, Panel, Textarea } from "@/components/ui";

interface UpdateConfigResponse {
  success: boolean;
  data?: {
    id: string;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    [key: string]: any;
  };
  error?: string;
}

interface ConfigUpdaterProps {
  configId?: string;
  onConfigIdChange?: (configId: string) => void;
  secret?: string;
  onSecretChange?: (secret: string) => void;
  configData?: string;
  onConfigDataChange?: (configData: string) => void;
  result?: UpdateConfigResponse | null;
  onResultChange?: (result: UpdateConfigResponse | null) => void;
  error?: string;
  onErrorChange?: (error: string) => void;
}

export function ConfigUpdater({
  configId = "",
  onConfigIdChange,
  secret = "",
  onSecretChange,
  configData = '{\n  "exampleKey": "exampleValue",\n  "featureFlag": true\n}',
  onConfigDataChange,
  result = null,
  onResultChange,
  error = "",
  onErrorChange,
}: ConfigUpdaterProps) {
  const [loading, setLoading] = useState(false);

  const updateConfig = async () => {
    if (!configId.trim()) {
      onErrorChange?.("CONFIG_ID_REQUIRED");
      return;
    }

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

      // Build URL with secret if provided
      const url = `${process.env.NODE_ENV === 'production' ? 'https://api.json.cf' : 'http://localhost:8787'}/v1/config/${configId.trim()}`;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add secret to headers if provided
      if (secret.trim()) {
        headers.Authorization = `Bearer ${secret.trim()}`;
      }

      const response = await fetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify(parsedData),
      });

      if (!response.ok) {
        let errorMessage = `HTTP_${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorData.message || errorData.error || errorMessage;
        } catch {
          // If response isn't JSON, use status code
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Transform the response to match our expected format
      onResultChange?.({
        success: true,
        data: { id: configId.trim(), ...data },
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "UPDATE_ERROR";
      onErrorChange?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    onConfigIdChange?.("");
    onSecretChange?.("");
    onConfigDataChange?.(
      '{\n  "exampleKey": "exampleValue",\n  "featureFlag": true\n}'
    );
    onResultChange?.(null);
    onErrorChange?.("");
  };

  return (
    <>
      <Panel className="flex flex-col gap-4">
        <span className="text-muted-foreground text-sm">[CONFIG_UPDATER]</span>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>CONFIG_ID</Label>
            <Input
              type="text"
              value={configId}
              onChange={(e) => onConfigIdChange?.(e.target.value)}
              placeholder="Enter config ID to update..."
              className="w-full"
              disabled={loading}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label>SECRET (FOR PRIVATE CONFIGS)</Label>
            <Input
              type="password"
              value={secret}
              onChange={(e) => onSecretChange?.(e.target.value)}
              placeholder="Enter secret for private configs..."
              className="w-full"
              disabled={loading}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label>NEW_CONFIG_DATA (JSON)</Label>
            <Textarea
              value={configData}
              onChange={(e) => onConfigDataChange?.(e.target.value)}
              className="w-full min-h-[108px]"
              placeholder="Enter new JSON config data..."
              disabled={loading}
              autoComplete="off"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={updateConfig} disabled={loading}>
              {loading ? "UPDATING..." : "UPDATE_CONFIG"}
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

      {result?.success && (
        <Panel className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">
              [UPDATE_RESULT]
            </span>
            <span className="text-success text-xs">SUCCESS</span>
          </div>

          <Panel>
            <div className="space-y-2">
              <div className="text-foreground text-sm">
                CONFIG_ID: {result.data?.id}
              </div>
              <div className="text-muted-foreground text-xs">
                Configuration has been successfully updated
              </div>
            </div>
          </Panel>
        </Panel>
      )}
    </>
  );
}

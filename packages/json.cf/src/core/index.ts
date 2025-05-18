import type {
  JsonConfigOptions,
  ConfigValue,
  ConfigResponse,
  ConfigsResponse,
  ApiResponse,
} from "../types";

class JsonConfig {
  private id: string;
  private secret?: string;
  private baseUrl: string;

  constructor(options: JsonConfigOptions) {
    this.id = options.id;
    this.secret = options.secret;
    this.baseUrl = options.baseUrl || "https://api.json.cf";
  }

  async get(key: string): Promise<ConfigResponse<ConfigValue>> {
    const response = await fetch(
      `${this.baseUrl}/config/${this.id}/kv/${key}`,
      {
        headers: {
          ...(this.secret && { Authorization: `Bearer ${this.secret}` }),
        },
      }
    );

    if (!response.ok) {
      return {
        data: null,
        error: `Failed to fetch config: ${response.statusText}`,
        metadata: { timestamp: Date.now() },
      };
    }

    return (await response.json()) as ApiResponse<ConfigValue>;
  }

  async getAll(): Promise<ConfigsResponse<Record<string, ConfigValue>>> {
    const response = await fetch(`${this.baseUrl}/config/${this.id}`, {
      headers: {
        ...(this.secret && { Authorization: `Bearer ${this.secret}` }),
      },
    });

    if (!response.ok) {
      return {
        data: {},
        error: `Failed to fetch all configs: ${response.statusText}`,
        metadata: { timestamp: Date.now() },
      };
    }

    return (await response.json()) as ApiResponse<Record<string, ConfigValue>>;
  }
}

export function createConfig(options: JsonConfigOptions): JsonConfig {
  return new JsonConfig(options);
}

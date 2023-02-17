export abstract class FetcherBase {
  abstract getDisplayName(address: string): Promise<string | null>;
}

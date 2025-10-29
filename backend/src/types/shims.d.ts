declare module 'ali-oss' {
  interface RequestOptions {
    [key: string]: unknown;
  }

  interface HeadResult {
    res: {
      headers: Record<string, string | undefined>;
    };
  }

  interface GetResult extends HeadResult {
    content?: Buffer;
  }

  interface ListObject {
    name?: string;
  }

  interface ListResult {
    objects?: ListObject[];
    isTruncated?: boolean;
    nextMarker?: string;
  }

  export default class OSS {
    constructor(options: Record<string, unknown>);
    head(name: string): Promise<HeadResult>;
    get(name: string): Promise<GetResult>;
    put(name: string, body: Buffer, options?: RequestOptions): Promise<unknown>;
    append(name: string, body: Buffer, options: RequestOptions): Promise<unknown>;
    list(options?: RequestOptions, requestOptions?: RequestOptions): Promise<ListResult>;
    signatureUrl(name: string, options?: RequestOptions): string;
  }
}

declare module 'crypto-js' {
  const CryptoJS: {
    SHA256(input: string): { toString(): string };
  };
  export default CryptoJS;
}

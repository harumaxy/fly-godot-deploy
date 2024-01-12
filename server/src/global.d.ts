// type HeadersInit = Headers | string[][] | Record<string, string>;

declare namespace NodeJS {
  interface HeadersInit {
    [key: string]: string;
  }
}

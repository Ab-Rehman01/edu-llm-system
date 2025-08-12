declare module "formidable" {
  import { IncomingMessage } from "http";

  export interface File {
    filepath: string;
    originalFilename?: string;
    mimetype?: string;
    size: number;
    newFilename: string;
  }

  export type Fields = Record<string, any>;
  export type Files = Record<string, File[]>;

  export interface Options {
    multiples?: boolean;
    uploadDir?: string;
    keepExtensions?: boolean;
  }

  export default function formidable(options?: Options): {
    parse(
      req: IncomingMessage,
      callback: (err: Error | null, fields: Fields, files: Files) => void
    ): void;
  };
}

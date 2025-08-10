//src/app/api/assignments/upload/route.ts
// src/app/api/assignments/upload/route.ts
import { NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface FormidableFile {
  filepath: string;
  originalFilename?: string;
  newFilename: string;
  mimetype?: string;
  size: number;
}

type FormFields = Record<string, string | string[]>;
type FormFiles = Record<string, FormidableFile | FormidableFile[]>;

export async function POST(req: Request): Promise<Response> {
  const form = new formidable.IncomingForm();

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  form.uploadDir = uploadDir;
  form.keepExtensions = true;

  return new Promise<Response>((resolve) => {
    form.parse(
      req as unknown as NodeJS.ReadableStream,
      (err: Error | null, fields: FormFields, files: FormFiles) => {
        if (err) {
          resolve(NextResponse.json({ error: "Upload error" }, { status: 500 }));
          return;
        }

        const fileField = files.assignment;
        const file = Array.isArray(fileField) ? fileField[0] : fileField;

        if (!file) {
          resolve(NextResponse.json({ error: "No file uploaded" }, { status: 400 }));
          return;
        }

        const newPath = path.join(uploadDir, file.originalFilename || file.newFilename);
        fs.renameSync(file.filepath, newPath);

        resolve(
          NextResponse.json({
            message: "File uploaded successfully",
            filename: file.originalFilename || file.newFilename,
          })
        );
      }
    );
  });
}

//src/app/api/assignments/upload/route.ts

import { NextResponse } from "next/server";
import formidable, { File, Fields, Files, IncomingForm } from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request): Promise<Response> {
  const form = new IncomingForm();

  const uploadDir = path.join(process.cwd(), "public", "uploads");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  form.uploadDir = uploadDir;
  form.keepExtensions = true;

  return new Promise<Response>((resolve) => {
    form.parse(
      req as unknown as NodeJS.ReadableStream,
      (err: Error | null, fields: Fields, files: Files) => {
        if (err) {
          resolve(NextResponse.json({ error: "Upload error" }, { status: 500 }));
          return;
        }

        // 'assignment' is the field name expected in the form-data
        const file = files.assignment as File | File[] | undefined;

        if (!file) {
          resolve(NextResponse.json({ error: "No file uploaded" }, { status: 400 }));
          return;
        }

        // Handle array of files or single file
        const fileToUse = Array.isArray(file) ? file[0] : file;

        const newPath = path.join(uploadDir, fileToUse.originalFilename || fileToUse.newFilename || "unknown");

        fs.renameSync(fileToUse.filepath, newPath);

        resolve(
          NextResponse.json({
            message: "File uploaded successfully",
            filename: fileToUse.originalFilename || fileToUse.newFilename,
          })
        );
      }
    );
  });
}

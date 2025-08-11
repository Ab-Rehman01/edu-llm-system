//src/app/api/assignments/upload/route.ts
import formidable from "formidable";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

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
      (err: Error | null, fields: Record<string, any>, files: Record<string, any>) => {
        if (err) {
          resolve(
            NextResponse.json({ error: "Upload error: " + err.message }, { status: 500 })
          );
          return;
        }

        const fileField = files.file || files.assignment; // adjust if your frontend sends 'file' or 'assignment'
        const file = Array.isArray(fileField) ? fileField[0] : fileField;

        if (!file) {
          resolve(
            NextResponse.json({ error: "File is required" }, { status: 400 })
          );
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

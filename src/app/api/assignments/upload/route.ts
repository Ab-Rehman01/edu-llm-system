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

export async function POST(req: Request) {
  const form = new formidable.IncomingForm();

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  form.uploadDir = uploadDir;
  form.keepExtensions = true;

  return new Promise((resolve) => {
   form.parse(
  req as unknown as NodeJS.ReadableStream,
  (err: Error | null, fields: Record<string, any>, files: Record<string, any>) => {
    if (err) {
      resolve(
        NextResponse.json({ error: "Upload error: " + err.message }, { status: 500 })
      );
      return;
    }

        const classId = fields.classId as string | undefined;

        const fileField = files.file;
        const file = Array.isArray(fileField) ? fileField[0] : fileField;

        if (!file || !classId) {
          resolve(
            NextResponse.json({ error: "File and classId required" }, { status: 400 })
          );
          return;
        }

        const newFilePath = path.join(uploadDir, file.newFilename);

        try {
          fs.renameSync(file.filepath, newFilePath);
        } catch {
          resolve(
            NextResponse.json({ error: "Error saving file" }, { status: 500 })
          );
          return;
        }

        resolve(
          NextResponse.json({
            message: "File uploaded successfully",
            filename: file.originalFilename || file.newFilename,
            classId,
          })
        );
      }
    );
  });
}

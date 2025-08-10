import { NextResponse } from "next/server";
import formidable from "formidable";
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

  return new Promise<Response>((resolve, reject) => {
    form.parse(req as any, (err: any, fields: any, files: any) => {
      if (err) {
        resolve(
          NextResponse.json({ error: "Upload error" }, { status: 500 })
        );
        return;
      }

      const file = files.assignment;

      if (!file) {
        resolve(
          NextResponse.json({ error: "No file uploaded" }, { status: 400 })
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
    });
  });
}

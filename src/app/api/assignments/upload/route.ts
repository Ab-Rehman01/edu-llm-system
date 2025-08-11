//src/app/api/assignments/upload/route.ts
// src/app/api/assignments/upload/route.ts
import { IncomingForm } from "formidable";
import { NextResponse } from "next/server";
import fs from "fs";
import cloudinary from "@/lib/cloudinary";

export const config = {
  api: {
    bodyParser: false,
  },
};

function parseForm(req: Request): Promise<{ fields: Record<string, any>; files: Record<string, any> }> {
  const form = new IncomingForm();
  return new Promise((resolve, reject) => {
    form.parse(
      req as unknown as NodeJS.ReadableStream,
      (err: Error | null, fields: Record<string, any>, files: Record<string, any>) => {
        if (err) reject(err);
        else resolve({ fields, files });
      }
    );
  });
}

export async function POST(req: Request): Promise<Response> {
  try {
    const { fields, files } = await parseForm(req);

    const classId = fields.classId as string | undefined;
    const file = files.file as { filepath: string } | undefined;

    if (!file || !classId) {
      return NextResponse.json({ error: "File and classId required" }, { status: 400 });
    }

    const result = await cloudinary.uploader.upload(file.filepath, {
      folder: `assignments/${classId}`,
      resource_type: "auto",
    });

    fs.unlinkSync(file.filepath);

    return NextResponse.json({
      message: "Upload successful",
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

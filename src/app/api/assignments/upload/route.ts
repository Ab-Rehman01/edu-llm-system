//src/app/api/assignments/upload/route.ts
// src/app/api/assignments/upload/route.ts
import { NextResponse } from "next/server";
import { IncomingForm } from "formidable";
import fs from "fs";
import cloudinary from "@/lib/cloudinary";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to convert Next.js Request to Node.js Readable stream
function parseForm(req: Request) {
  const form = new IncomingForm();
  return new Promise<{ fields: Record<string, any>, files: Record<string, any> }>((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export async function POST(req: Request): Promise<Response> {
  try {
    const { fields, files } = await parseForm(req);

    const classId = fields.classId as string | undefined;
    const file = files.file as any;

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

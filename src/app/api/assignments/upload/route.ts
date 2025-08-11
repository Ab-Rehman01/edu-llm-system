//src/app/api/assignments/upload/route.ts
// src/app/api/assignments/upload/route.ts
import { NextResponse } from "next/server";
import { IncomingForm } from "formidable";
import fs from "fs";
import { Readable } from "stream";
import cloudinary from "@/lib/cloudinary";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Convert ArrayBuffer to Node.js Readable Stream
function bufferToStream(buffer: Buffer) {
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  return readable;
}

export async function POST(req: Request) {
  try {
    // Convert request body to buffer then to stream
    const buffer = Buffer.from(await req.arrayBuffer());
    const readable = bufferToStream(buffer);

    const form = new IncomingForm();


    // Wrap formidable parse in Promise
    const { fields, files } = await new Promise<{ fields: Record<string, any>; files: Record<string, any> }>((resolve, reject) => {
      form.parse(readable as any, (err: any, fields: any, files: any) => {
  if (err) {
    reject(err);
  } else {
    resolve({ fields, files });
  }
});

    });

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
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}

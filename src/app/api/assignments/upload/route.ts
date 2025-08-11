//src/app/api/assignments/upload/route.ts
// src/app/api/assignments/upload/route.ts
import formidable from "formidable";
import { NextResponse } from "next/server";
import fs from "fs";
import cloudinary from "@/lib/cloudinary";

export const config = {
  api: {
    bodyParser: false, // zaruri hai file upload ke liye
  },
};

interface FormidableFile {
  filepath: string;
  originalFilename?: string;
  newFilename: string;
  mimetype?: string;
  size: number;
}

export async function POST(req: Request): Promise<Response> {
  const form = new formidable.IncomingForm();

  return new Promise((resolve) => {
    form.parse(
  req as any,
  async (
    err: Error | null,
    fields: Record<string, any>,
    files: Record<string, any>
  ) => {
      console.log("Parsing form data...");
      if (err) {
        console.error("Form parse error:", err);
        resolve(
          NextResponse.json({ error: "Error parsing the files" }, { status: 500 })
        );
        return;
      }

      console.log("Fields received:", fields);
      console.log("Files received:", files);

      const classId = fields.classId as string | undefined;
      const file = files.file as FormidableFile | undefined;

      if (!file || !classId) {
        console.log("Missing file or classId");
        resolve(
          NextResponse.json(
            { error: "File and classId required" },
            { status: 400 }
          )
        );
        return;
      }

      try {
        const result = await cloudinary.uploader.upload(file.filepath, {
          folder: `assignments/${classId}`,
          resource_type: "auto",
        });

        // Temporary file ko delete kar dena
        fs.unlinkSync(file.filepath);

        resolve(
          NextResponse.json({
            message: "Upload successful",
            url: result.secure_url,
            public_id: result.public_id,
          })
        );
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        resolve(
          NextResponse.json(
            { error: "Upload to Cloudinary failed" },
            { status: 500 }
          )
        );
      }
    });
  });
}

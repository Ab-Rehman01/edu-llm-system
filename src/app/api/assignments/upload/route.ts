//src/app/api/assignments/upload/route.ts
import formidable from "formidable";
import { NextResponse } from "next/server";
import fs from "fs";
import cloudinary from "@/lib/cloudinary";

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parser for file uploads
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
      req as unknown as NodeJS.ReadableStream,
      async (
        err: Error | null,
        fields: Record<string, any>,
        files: Record<string, any>
      ) => {
        if (err) {
          console.error("Form parse error:", err);
          resolve(
            NextResponse.json({ error: "Error parsing the files" }, { status: 500 })
          );
          return;
        }

        const classId = fields.classId as string | undefined;
        const file = files.file as FormidableFile | undefined;

        if (!file || !classId) {
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

          // Delete temporary uploaded file
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
      }
    );
  });
}

//src/app/api/assignments/upload/route.ts
import { NextResponse } from "next/server";
import formidable from "formidable";
import cloudinary from "@/lib/cloudinary";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

type Fields = { [key: string]: string | string[] };
type Files = { [key: string]: File | File[] };

interface File {
  filepath: string;
  originalFilename?: string;
  newFilename: string;
  mimetype?: string;
  size: number;
}

export async function POST(req: Request) {
  const form = new formidable.IncomingForm();

  return new Promise((resolve) => {
    form.parse(req as any, async (err: Error | null, fields: Fields, files: Files) => {
      if (err) {
        resolve(
          NextResponse.json({ error: "Error parsing the files" }, { status: 500 })
        );
        return;
      }

      const classId = fields.classId as string | undefined;
      const file = files.file as File | undefined;

      if (!file || !classId) {
        resolve(
          NextResponse.json({ error: "File and classId required" }, { status: 400 })
        );
        return;
      }

      try {
        const result = await cloudinary.uploader.upload(file.filepath, {
          folder: `assignments/${classId}`,
          resource_type: "auto",
        });

        fs.unlinkSync(file.filepath);

        resolve(
          NextResponse.json({
            message: "Upload successful",
            url: result.secure_url,
            public_id: result.public_id,
          })
        );
      } catch (uploadError) {
        resolve(
          NextResponse.json({ error: "Upload to Cloudinary failed" }, { status: 500 })
        );
      }
    });
  });
}

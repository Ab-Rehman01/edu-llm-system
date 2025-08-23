// pages/api/assignments/upload.ts
// src/pages/api/assignments/upload.ts
// src/pages/api/assignments/upload.ts
// src/pages/api/assignments/upload.ts
// src/pages/api/assignments/upload.ts
// src/pages/api/assignments/upload.ts
// src/pages/api/assignments/upload.ts
// import type { NextApiRequest, NextApiResponse } from "next";
// import formidable from "formidable";
// import type { File as FormidableFile, Fields, Files } from "formidable";
// import fs from "fs";
// import cloudinary from "@/lib/cloudinary";

// type MyFields = Fields;
// type MyFiles = Record<string, FormidableFile[]>;

// export const config = {
//   api: { bodyParser: false },
// };

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   try {
//     const form = formidable({ multiples: false });

//     const { fields, files } = await new Promise<{ fields: MyFields; files: MyFiles }>(
//       (resolve, reject) => {
//         form.parse(req, (err, fields, files) => {
//           if (err) reject(err);
//           else resolve({ fields, files });
//         });
//       }
//     );

//     const classId = fields.classId?.toString();
//     const file = files.file?.[0];

//     if (!file || !classId) {
//       return res.status(400).json({ error: "File and classId required" });
//     }

//     const result = await cloudinary.uploader.upload(file.filepath, {
//       folder: `assignments/${classId}`,
//       resource_type: "auto",
//     });

//     fs.unlinkSync(file.filepath);

//     return res.status(200).json({
//       message: "Upload successful",
//       url: result.secure_url,
//       public_id: result.public_id,
//     });
//   } catch (error) {
//     console.error("Upload error:", error);
//     return res.status(500).json({ error: "Upload failed" });
//   }
// }




// src/pages/api/assignments/upload.ts
// src/pages/api/assignments/upload.ts
// import type { NextApiRequest, NextApiResponse } from "next";
// import formidable from "formidable";
// import fs from "fs";
// import cloudinary from "@/lib/cloudinary";
// import clientPromise from "@/lib/mongodb";  // add mongodb client import
// import { ObjectId } from "mongodb";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   console.log('Headers:', req.headers);

//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   try {
//     const form = formidable({ multiples: false });

//     const { fields, files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
//       form.parse(req, (err, fields, files) => {
//         if (err) {
//           console.error('Form parse error:', err);
//           reject(err);
//         } else {
//           console.log('Fields:', fields);
//           console.log('Files:', files);
//           resolve({ fields, files });
//         }
//       });
//     });

//     const classId = Array.isArray(fields.classId) ? fields.classId[0] : fields.classId;
//     let file = files.file;

//     if (Array.isArray(file)) {
//       file = file[0];
//     }

//     if (!file || !classId) {
//       return res.status(400).json({ error: "File and classId required" });
//     }

//     const filePath = file.filepath || file.path;

//     if (!filePath) {
//       return res.status(400).json({ error: "Filepath missing" });
//     }

//     // Upload to Cloudinary
//     const result = await cloudinary.uploader.upload(filePath, {
//       folder: `assignments/${classId}`,
//       resource_type: "auto",
//     });

//     // Delete temp file
//     fs.unlinkSync(filePath);

//     // Save assignment info in MongoDB
//     const client = await clientPromise;
//     const db = client.db("education-system");

//     const assignmentDoc = {
//       classId: new ObjectId(classId),
//       url: result.secure_url,
//       public_id: result.public_id,
//       filename: file.originalFilename || file.newFilename || "unknown",
//       uploadedAt: new Date(),
//     };

//     await db.collection("assignments").insertOne(assignmentDoc);

//     return res.status(200).json({
//       message: "Upload successful",
//       url: result.secure_url,
//       public_id: result.public_id,
//       filename: assignmentDoc.filename,
//     });
//   } catch (error) {
//     console.error("Upload error:", error);
//     return res.status(500).json({ error: "Upload failed. Please try again." });
//   }
// }

import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import { v2 as cloudinary } from "cloudinary";
import clientPromise from "@/lib/mongodb";

export const config = {
  api: {
    bodyParser: false,
  },
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ error: "Form parse failed" });
    }

    try {
      const classId = fields.classId?.toString() || null;
      const subject = fields.subject?.toString() || "Untitled Subject";

      // Explicitly type file as File or File[]
      let file = files.file as File | File[] | undefined;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      if (Array.isArray(file)) {
        file = file[0];
      }

      const filePath = file.filepath || (file as any).path;

      if (!filePath) {
        return res.status(400).json({ error: "File path not found" });
      }

      const uploadResult = await cloudinary.uploader.upload(filePath, {
        folder: `assignments/${classId}`,
      });

      const client = await clientPromise;
      const db = client.db("education-system");

      const newAssignment = {
        classId,
        subject,
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        filename: uploadResult.original_filename,
        uploadedAt: new Date(),
      };

      await db.collection("assignments").insertOne(newAssignment);

      return res.status(200).json({ message: "Upload successful", url: uploadResult.secure_url });
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      return res.status(500).json({ error: "Upload failed" });
    }
    
  });
}
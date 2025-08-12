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
import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import cloudinary from "@/lib/cloudinary";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable({ multiples: false });

    const { fields, files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const classId = fields.classId;
    const file = files.file;

    if (!file || !classId) {
      return res.status(400).json({ error: "File and classId required" });
    }

    // Cloudinary upload expects a file path from formidable's file object
    const result = await cloudinary.uploader.upload(file.filepath, {
      folder: `assignments/${classId}`,
      resource_type: "auto",
    });

    // Delete the temp file after upload
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      message: "Upload successful",
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Upload failed. Please try again." });
  }
}
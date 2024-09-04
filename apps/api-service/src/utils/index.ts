import fs from "fs/promises";
import { uploadGoogleFile } from "@/config/googleSettings";

export const uploadFileAndGetUrl = async (
  file: Express.Multer.File,
  bucketPath: string,
  makePublic: boolean = true
): Promise<string> => {
  const filePath = file.path;
  const fileName = file.filename;
  const destFileName = `${bucketPath}/${fileName}`;
  try {
    // Check if the file exists
    await fs.access(filePath);
    // Upload the file to Google Cloud Storage
    const originalUrl = await uploadGoogleFile(
      filePath,
      destFileName,
      0,
      makePublic
    );
    // Delete the file after uploading
    await fs.unlink(filePath);
    console.log("File uploaded to Google Cloud Storage", originalUrl);
    return originalUrl;
  } catch (uploadError) {
    console.error("Error handling file:", uploadError);
    return "";
  }
};

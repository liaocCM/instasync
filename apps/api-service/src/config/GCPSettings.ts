// Ref: https://cloud.google.com/storage/docs/uploading-objects#storage-upload-object-client-libraries
import { Storage } from "@google-cloud/storage";
import path from "path";

export const googleStorage = new Storage({
  keyFilename: path.join(__dirname, "./cloud-storage-key.json"),
  projectId: process.env.GOOGLE_STORAGE_PROJECT_ID,
});

export const googleBucket = googleStorage.bucket(
  process.env.GOOGLE_STORAGE_BUCKET_NAME || ""
);

export const uploadGoogleFile = async (
  filePath: string,
  destFileName: string,
  generationMatchPrecondition: number = 0,
  makePublic: boolean = false
) => {
  const options = {
    destination: destFileName,
    // Optional:
    // Set a generation-match precondition to avoid potential race conditions
    // and data corruptions. The request to upload is aborted if the object's
    // generation number does not match your precondition. For a destination
    // object that does not yet exist, set the ifGenerationMatch precondition to 0
    // If the destination object already exists in your bucket, set instead a
    // generation-match precondition using its generation number.
    preconditionOpts: { ifGenerationMatch: generationMatchPrecondition },
  };
  const url = `https://storage.googleapis.com/${
    process.env.GOOGLE_STORAGE_BUCKET_NAME
      ? process.env.GOOGLE_STORAGE_BUCKET_NAME + "/"
      : ""
  }${destFileName}`;

  await googleBucket.upload(filePath, options);
  if (makePublic) {
    await googleBucket.file(destFileName).makePublic();
  }

  return url;
};

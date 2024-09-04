import sharp from "sharp";
import path from "path";
// import fs from "fs/promises";

export async function compressImage(
  filePath: string,
  quality: number = 80
): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  const filename = path.basename(filePath, ext);
  let outputPath = path.join(
    path.dirname(filePath),
    `${filename}-compressed${ext}`
  );

  try {
    let sharpInstance = sharp(filePath);

    switch (ext) {
      case '.jpg':
      case '.jpeg':
        sharpInstance = sharpInstance.jpeg({ quality });
        break;
      case '.png':
        sharpInstance = sharpInstance.png({ quality });
        break;
      case '.webp':
        sharpInstance = sharpInstance.webp({ quality });
        break;
      default:
        // Convert unsupported formats to PNG
        sharpInstance = sharpInstance.png({ quality });
        outputPath = path.join(
          path.dirname(filePath),
          `${filename}-compressed.png`
        );
    }

    await sharpInstance.toFile(outputPath);

    return outputPath;
  } catch (error) {
    console.error("Error compressing image:", error);
    return filePath; // Return original file path if compression fails
  }
}

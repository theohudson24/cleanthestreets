import crypto from "crypto";

export function getCloudinaryConfig() {
  return {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
    uploadFolder:
      process.env.CLOUDINARY_UPLOAD_FOLDER || "cleanthestreets/reports",
    allowedFormats: ["jpg", "jpeg", "png", "webp"],
    maxFileBytes: 5 * 1024 * 1024,
    uploadTag: "cleanthestreets-report",
  };
}

export function canUseSignedUploads() {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  return Boolean(cloudName && apiKey && apiSecret);
}

export function signCloudinaryParams(params, apiSecret) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto
    .createHash("sha1")
    .update(`${payload}${apiSecret}`)
    .digest("hex");
}

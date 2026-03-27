import { requireUser } from "@/lib/auth";
import {
  canUseSignedUploads,
  getCloudinaryConfig,
  signCloudinaryParams,
} from "@/lib/cloudinary";
import {
  applyRateLimit,
  logSecurityEvent,
  requireCsrf,
  toErrorResponse,
} from "@/lib/security";

export async function POST(request) {
  try {
    const auth = await requireUser(request);
    if (auth.response) {
      return auth.response;
    }

    const csrfError = requireCsrf(request);
    if (csrfError) {
      return csrfError;
    }

    const rateLimitResponse = applyRateLimit(request, {
      bucket: "uploads:signature",
      identity: auth.user.id,
      limit: 20,
      windowMs: 15 * 60 * 1000,
    });

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    if (!canUseSignedUploads()) {
      return Response.json(
        { error: "Signed uploads are not configured on this environment." },
        { status: 503 }
      );
    }

    const {
      cloudName,
      apiKey,
      apiSecret,
      uploadFolder,
      allowedFormats,
      maxFileBytes,
      uploadTag,
    } = getCloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = {
      folder: uploadFolder,
      allowed_formats: allowedFormats.join(","),
      max_file_size: maxFileBytes,
      resource_type: "image",
      tags: uploadTag,
      timestamp,
    };

    const signature = signCloudinaryParams(paramsToSign, apiSecret);

    return Response.json({
      cloudName,
      apiKey,
      folder: uploadFolder,
      allowedFormats,
      maxFileBytes,
      uploadTag,
      timestamp,
      signature,
    });
  } catch (error) {
    logSecurityEvent("upload_signature_failed", request, {});
    return toErrorResponse(error, "Failed to create upload signature");
  }
}

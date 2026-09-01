const MODELARK_BASE_URL = process.env["ARK_BASE_URL"] ?? "https://ark.ap-southeast.bytepluses.com/api/v3";
const MODELARK_IMAGE_MODEL = process.env["MODELARK_IMAGE_MODEL"] ?? "seedream-4-5-251128";

export type SeedreamGeneration = {
  model?: string;
  prompt: string;
  size?: string;
  responseFormat?: "url" | "b64_json";
  watermark?: boolean;
  sequentialImageGeneration?: "disabled" | "auto";
};

export async function generateSeedreamImage(input: SeedreamGeneration) {
  const apiKey = process.env["ARK_API_KEY"];
  if (!apiKey) {
    throw new Error("Missing ARK_API_KEY. Add the BytePlus ModelArk key to the server environment.");
  }

  const response = await fetch(`${MODELARK_BASE_URL}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: input.model ?? MODELARK_IMAGE_MODEL,
      prompt: input.prompt,
      sequential_image_generation: input.sequentialImageGeneration ?? "disabled",
      response_format: input.responseFormat ?? "url",
      size: input.size ?? "2K",
      stream: false,
      watermark: input.watermark ?? false,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    data?: Array<{ url?: string; b64_json?: string }>;
    error?: { message?: string } | string;
  };

  if (!response.ok) {
    const detail = typeof payload.error === "string" ? payload.error : payload.error?.message;
    throw new Error(`ModelArk Seedream failed (${response.status}): ${detail ?? "unknown error"}`);
  }

  const first = payload.data?.[0];
  if (!first?.url && !first?.b64_json) throw new Error("Seedream returned no image data.");

  return {
    model: input.model ?? MODELARK_IMAGE_MODEL,
    imageUrl: first.url,
    base64: first.b64_json,
  };
}

export function getModelArkConfig() {
  return {
    baseUrl: MODELARK_BASE_URL,
    imageModel: MODELARK_IMAGE_MODEL,
    videoModel: process.env["MODELARK_VIDEO_MODEL"] ?? "",
  };
}

// Image upload backend is not yet configured for the post-Manus deploy.
// Admin product CRUD calls storagePut() when an image is uploaded; until we
// wire up R2 / S3, this throws a clear error so the failure is visible.

export async function storagePut(
  _relKey: string,
  _data: Buffer | Uint8Array | string,
  _contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  throw new Error(
    "Image upload not yet configured. Wire up an R2/S3 backend before using admin image upload.",
  );
}

export async function storageGet(
  relKey: string,
): Promise<{ key: string; url: string }> {
  return { key: relKey.replace(/^\/+/, ""), url: relKey };
}

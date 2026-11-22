import { join } from "path";

/**
 * Where admin photo uploads are stored. In production point UPLOAD_DIR at a persistent
 * disk (Railway volume, e.g. /data/uploads) — the app's own folder is wiped on every deploy.
 */
export const UPLOAD_DIR = process.env.UPLOAD_DIR || join(process.cwd(), "uploads");

/** Allowed image types → the extension we save them with (never trust the uploaded filename). */
export const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const EXT_TO_TYPE: Record<string, string> = Object.fromEntries(
  Object.entries(IMAGE_TYPES).map(([type, ext]) => [ext, type])
);

/** Uploaded filenames look like "<uuid>.<ext>" — anything else is rejected when serving. */
export const SAFE_NAME = /^[0-9a-f-]{36}\.(jpg|png|webp|gif)$/;

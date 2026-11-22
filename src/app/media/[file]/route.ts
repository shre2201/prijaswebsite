import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { EXT_TO_TYPE, SAFE_NAME, UPLOAD_DIR } from "@/lib/uploads";

/** Serves admin-uploaded images from the persistent upload folder. */
export async function GET(_req: NextRequest, { params }: { params: { file: string } }) {
  const name = params.file;
  if (!SAFE_NAME.test(name)) return new NextResponse("Not found", { status: 404 });
  try {
    const data = await readFile(join(UPLOAD_DIR, name));
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": EXT_TO_TYPE[name.split(".").pop()!],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}

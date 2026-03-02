import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

const VALID_SECTIONS = [
  "Marketing Communication",
  "Merchandise",
  "Finance and Legal",
  "School Relationships",
  "Sponsorship"
];

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const section = formData.get("section") as string | null;

    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "A file is required." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 20 MB limit." },
        { status: 400 }
      );
    }

    if (!section || !VALID_SECTIONS.includes(section)) {
      return NextResponse.json(
        { error: "Invalid section." },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const safeName = sanitize(file.name);
    const path = `mbat/${section}/${id}-${safeName}`;

    // Vercel Blob must be enabled in project settings and
    // BLOB_READ_WRITE_TOKEN set as env var for production.
    const blob = await put(path, file, { access: "public" });

    return NextResponse.json({
      url: blob.url,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || "application/octet-stream"
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

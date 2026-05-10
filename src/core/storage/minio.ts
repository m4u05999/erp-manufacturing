import * as Minio from "minio";

const endpoint = process.env.MINIO_ENDPOINT || "localhost:9000";
const accessKey = process.env.MINIO_ACCESS_KEY || "minioadmin";
const secretKey = process.env.MINIO_SECRET_KEY || "minioadmin";

const [host, portStr] = endpoint.split(":");
const port = parseInt(portStr || "9000");

export const minioClient = new Minio.Client({
  endPoint: host,
  port,
  useSSL: false,
  accessKey,
  secretKey,
});

const BUCKET = "erp-files";

export async function ensureBucket() {
  const exists = await minioClient.bucketExists(BUCKET);
  if (!exists) await minioClient.makeBucket(BUCKET);
}

export async function uploadFile(file: Buffer, fileName: string, mimeType: string) {
  await ensureBucket();
  const key = `${Date.now()}-${fileName}`;
  await minioClient.putObject(BUCKET, key, file, file.length, { "Content-Type": mimeType });
  const url = await minioClient.presignedGetObject(BUCKET, key, 24 * 60 * 60);
  return { key, url };
}

export async function getFileUrl(key: string) {
  return minioClient.presignedGetObject(BUCKET, key, 24 * 60 * 60);
}

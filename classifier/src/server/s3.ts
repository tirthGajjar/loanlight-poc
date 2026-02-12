import {
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/env";

const createS3Client = () =>
	new S3Client({
		region: env.S3_REGION,
		endpoint: env.S3_ENDPOINT,
		forcePathStyle: true,
		credentials: {
			accessKeyId: env.S3_ACCESS_KEY,
			secretAccessKey: env.S3_SECRET_KEY,
		},
	});

const globalForS3 = globalThis as unknown as {
	s3: ReturnType<typeof createS3Client> | undefined;
};

export const s3 = globalForS3.s3 ?? createS3Client();

if (env.NODE_ENV !== "production") globalForS3.s3 = s3;

export const S3_BUCKET = env.S3_BUCKET;

const GET_URL_EXPIRY = 900; // 15 minutes

export async function getPresignedGetUrl(key: string): Promise<string> {
	const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key });
	return getSignedUrl(s3, command, { expiresIn: GET_URL_EXPIRY });
}

export async function getObject(key: string): Promise<Uint8Array> {
	const res = await s3.send(
		new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }),
	);
	if (!res.Body) throw new Error(`Empty response body for key: ${key}`);
	return new Uint8Array(await res.Body.transformToByteArray());
}

export async function uploadToS3(
	key: string,
	body: Uint8Array,
	contentType: string,
): Promise<void> {
	await s3.send(
		new PutObjectCommand({
			Bucket: S3_BUCKET,
			Key: key,
			Body: body,
			ContentType: contentType,
		}),
	);
}

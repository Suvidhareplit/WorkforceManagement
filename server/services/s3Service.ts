import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// S3 Configuration Interface
interface S3Config {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

// S3 Upload Options
interface UploadOptions {
  folder?: string;
  fileName?: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

// S3 Upload Result
interface UploadResult {
  fileKey: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  bucket: string;
}

class S3Service {
  private s3Client: S3Client | null = null;
  private bucket: string = '';
  private region: string = '';
  private isConfigured: boolean = false;

  /**
   * Initialize S3 client with configuration
   */
  public initialize(config?: S3Config): void {
    const s3Config: S3Config = config || {
      region: process.env.AWS_REGION || process.env.AWS_S3_REGION || 'us-east-1',
      bucket: process.env.AWS_S3_BUCKET || '',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    };

    if (!s3Config.bucket) {
      console.warn('⚠️  AWS S3 bucket not configured. File uploads will be disabled.');
      this.isConfigured = false;
      return;
    }

    if (!s3Config.accessKeyId || !s3Config.secretAccessKey) {
      console.warn('⚠️  AWS credentials not configured. File uploads will be disabled.');
      this.isConfigured = false;
      return;
    }

    this.s3Client = new S3Client({
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey,
      },
    });

    this.bucket = s3Config.bucket;
    this.region = s3Config.region;
    this.isConfigured = true;

    console.log(`✅ S3 Service initialized - Region: ${this.region}, Bucket: ${this.bucket}`);
  }

  /**
   * Check if S3 is configured and ready
   */
  public isReady(): boolean {
    return this.isConfigured && this.s3Client !== null;
  }

  /**
   * Upload file buffer to S3
   */
  public async uploadFile(
    fileBuffer: Buffer,
    originalFileName: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    if (!this.isReady()) {
      throw new Error('S3 service is not configured. Please set AWS credentials.');
    }

    const fileExtension = path.extname(originalFileName);
    const baseFileName = options.fileName || path.basename(originalFileName, fileExtension);
    const uniqueFileName = `${baseFileName}-${uuidv4()}${fileExtension}`;
    const folder = options.folder || 'leave-attachments';
    const fileKey = `${folder}/${uniqueFileName}`;

    const contentType = options.contentType || this.getContentType(fileExtension);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: contentType,
      Metadata: options.metadata || {},
    });

    await this.s3Client!.send(command);

    const fileUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${fileKey}`;

    return {
      fileKey,
      fileUrl,
      fileName: uniqueFileName,
      fileSize: fileBuffer.length,
      contentType,
      bucket: this.bucket,
    };
  }

  /**
   * Get presigned URL for secure file access (expires in 1 hour)
   */
  public async getPresignedUrl(fileKey: string, expiresIn: number = 3600): Promise<string> {
    if (!this.isReady()) {
      throw new Error('S3 service is not configured.');
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
    });

    return await getSignedUrl(this.s3Client!, command, { expiresIn });
  }

  /**
   * Delete file from S3
   */
  public async deleteFile(fileKey: string): Promise<void> {
    if (!this.isReady()) {
      throw new Error('S3 service is not configured.');
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
    });

    await this.s3Client!.send(command);
    console.log(`🗑️  Deleted file: ${fileKey}`);
  }

  /**
   * Check if file exists in S3
   */
  public async fileExists(fileKey: string): Promise<boolean> {
    if (!this.isReady()) {
      return false;
    }

    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
      });
      await this.s3Client!.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * List files in a folder
   */
  public async listFiles(folder: string = 'leave-attachments'): Promise<any[]> {
    if (!this.isReady()) {
      throw new Error('S3 service is not configured.');
    }

    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: folder,
    });

    const response = await this.s3Client!.send(command);
    return response.Contents || [];
  }

  /**
   * Get content type from file extension
   */
  private getContentType(extension: string): string {
    const contentTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.xls': 'application/vnd.ms-excel',
    };

    return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * Get file metadata
   */
  public async getFileMetadata(fileKey: string): Promise<any> {
    if (!this.isReady()) {
      throw new Error('S3 service is not configured.');
    }

    const command = new HeadObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
    });

    const response = await this.s3Client!.send(command);
    return {
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified,
      metadata: response.Metadata,
    };
  }
}

// Export singleton instance
export const s3Service = new S3Service();
export default s3Service;

import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly s3Client: S3Client;
  private readonly logger = new Logger(UploadService.name);
  private readonly bucket: string | undefined;
  private readonly accountId: string | undefined;

  constructor(private configService: ConfigService) {
    // R2 bağlantısını yapılandır
    const endpoint = this.configService.get<string>('CLOUDFLARE_R2_ENDPOINT');
    const accessKeyId = this.configService.get<string>('CLOUDFLARE_R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('CLOUDFLARE_R2_SECRET_ACCESS_KEY');

    if (!endpoint || !accessKeyId || !secretAccessKey) {
        throw new Error('Missing Cloudflare R2 configuration');
    }

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: endpoint,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });
    this.bucket = this.configService.get<string>('CLOUDFLARE_R2_BUCKET_NAME');
    this.accountId = this.configService.get<string>('CLOUDFLARE_R2_ACCOUNT_ID');
  }
    /**
   * Buffer olarak gelen dosyayı R2'ye yükler
   */
    async uploadFile(file: Express.Multer.File): Promise<string> {
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `/${uuidv4()}.${fileExtension}`;
      const uploadParams = {
        Bucket: this.bucket,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
  
      await this.s3Client.send(new PutObjectCommand(uploadParams));
      const fileResult = `https://pub-${this.accountId}.r2.dev/${fileName}`
      return fileResult;
    }
    async deleteFile(fileUrl: string): Promise<void> {
      const fileKey = fileUrl.replace(`${process.env.CLOUDFLARE_R2_ENDPOINT}/${this.bucket}/`, '');
      const deleteParams = {
        Bucket: this.bucket,
        Key: fileKey,
      };
  
      await this.s3Client.send(new DeleteObjectCommand(deleteParams));
    }
}
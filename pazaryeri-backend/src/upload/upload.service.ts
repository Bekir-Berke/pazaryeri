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

  constructor(private configService: ConfigService) {
    // R2 bağlantısını yapılandır
    const endpoint = this.configService.get<string>('CLOUDFLARE_R2_URL');
    const accessKeyId = this.configService.get<string>('CLOUDFLARE_R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('CLOUDFLARE_R2_SECRET_ACCESS_TOKEN');

    if (!endpoint || !accessKeyId || !secretAccessKey) {
        throw new Error('Missing Cloudflare R2 configuration');
    }

    this.s3Client = new S3Client({
        endpoint,
        region: 'auto',
        credentials: {
            accessKeyId,
            secretAccessKey
        }
    });
    this.bucket = this.configService.get<string>('CLOUDFLARE_R2_BUCKET_NAME');
  }
    /**
   * Buffer olarak gelen dosyayı R2'ye yükler
   */
    async uploadFile(file: Express.Multer.File, folder: string = 'products'): Promise<string> {
        try {
          const fileExtension = file.originalname.split('.').pop();
          const fileName = `${folder}/${uuidv4()}.${fileExtension}`;
          
          const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
          });
          
          await this.s3Client.send(command);
          
          // CDN URL'yi döndür
          const cdnDomain = this.configService.get<string>('CLOUDFLARE_CDN_DOMAIN');
          return `https://${cdnDomain}/${fileName}`;
        } catch (error) {
          this.logger.error('Dosya yüklenirken hata oluştu', error);
          throw new Error('Dosya yüklenemedi');
        }
      }
    async uploadFiles(files: Express.Multer.File[], folder: string = 'products'): Promise<string[]> {
        try {
          return Promise.all(files.map(file => this.uploadFile(file, folder)));
        } catch (error) {
          throw new Error('Dosyalar yüklenemedi');
        }
      } 
      
      /**
       * Base64 formatında gelen dosyayı R2'ye yükler
       */
      async uploadBase64File(base64Data: string, folder: string = 'products'): Promise<string> {
        try {
          // Base64 içeriğini ayır (data:image/jpeg;base64,/9j/4AAQ...)
          const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
          
          if (!matches || matches.length !== 3) {
            throw new Error('Geçersiz base64 formatı');
          }
          
          const mimeType = matches[1];
          const fileContent = Buffer.from(matches[2], 'base64');
          const fileExtension = mimeType.split('/')[1];
          const fileName = `${folder}/${uuidv4()}.${fileExtension}`;
          
          const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: fileName,
            Body: fileContent,
            ContentType: mimeType,
          });
          
          await this.s3Client.send(command);
          
          // CDN URL'yi döndür
          const cdnDomain = this.configService.get<string>('CLOUDFLARE_CDN_DOMAIN');
          return `https://${cdnDomain}/${fileName}`;
        } catch (error) {
          this.logger.error('Base64 dosya yüklenirken hata oluştu', error);
          throw new Error('Dosya yüklenemedi');
        }
      }
      
      /**
       * Yükleme için ön-imzalı URL oluştur (frontend'den doğrudan yükleme için)
       */
      async createPresignedUrl(fileName: string, contentType: string, folder: string = 'products'): Promise<string> {
        const fileExtension = fileName.split('.').pop();
        const key = `${folder}/${uuidv4()}.${fileExtension}`;
        
        const command = new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          ContentType: contentType,
        });
        
        const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
        return url;
      }
      
      /**
       * Dosya sil
       */
      async deleteFile(url: string): Promise<void> {
        try {
          // URL'den dosya adını çıkar
          const cdnDomain = this.configService.get<string>('CLOUDFLARE_CDN_DOMAIN');
          const key = url.replace(`https://${cdnDomain}/`, '');
          
          const command = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
          });
          
          await this.s3Client.send(command);
        } catch (error) {
          this.logger.error('Dosya silinirken hata oluştu', error);
          throw new Error('Dosya silinemedi');
        }
    }
}
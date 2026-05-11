import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private minioClient: Minio.Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('minio.endpoint'),
      port: this.configService.get<number>('minio.port'),
      useSSL: this.configService.get<boolean>('minio.useSSL'),
      accessKey: this.configService.get<string>('minio.accessKey'),
      secretKey: this.configService.get<string>('minio.secretKey'),
    });
    this.bucket = this.configService.get<string>('minio.bucket');
  }

  async onModuleInit() {
    const exists = await this.minioClient.bucketExists(this.bucket);
    if (!exists) {
      await this.minioClient.makeBucket(this.bucket, 'us-east-1');
    }
  }

  async uploadFile(
    fileName: string,
    file: Buffer,
    mimeType: string,
  ): Promise<string> {
    const metaData = {
      'Content-Type': mimeType,
    };

    await this.minioClient.putObject(
      this.bucket,
      fileName,
      file,
      file.length,
      metaData,
    );

    return fileName;
  }

  async getPresignedUrl(fileName: string): Promise<string> {
    return this.minioClient.presignedGetObject(this.bucket, fileName, 15 * 60); // 15 minutes
  }

  async deleteFile(fileName: string): Promise<void> {
    await this.minioClient.removeObject(this.bucket, fileName);
  }
}

import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { Redis } from "ioredis"
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private redisClient:Redis;
    constructor(private configService: ConfigService) {}
    onModuleInit() {
        // Redis bağlantısını yapılandırma
        this.redisClient = new Redis({
          host: this.configService.get<string>('REDIS_HOST', 'localhost'),
          port: this.configService.get<number>('REDIS_PORT', 6379),
          //password: this.configService.get<string>('REDIS_PASSWORD', ''),
          //db: this.configService.get<number>('REDIS_DB', 0),
        });
    
        this.redisClient.on('error', (error) => {
          console.error('Redis bağlantı hatası:', error);
        });
    
        this.redisClient.on('connect', () => {
          console.log('Redis bağlantısı başarıyla kuruldu.');
        });
    }
    async onModuleDestroy() {
        // Uygulama kapatılırken Redis bağlantısını kapat
        if (this.redisClient) {
          await this.redisClient.quit();
        }
    }

  /**
   * Redis'e bir değer ayarlar
   * @param key Anahtar
   * @param value Değer
   * @param ttl Saniye cinsinden TTL (opsiyonel)
   */
  async set(key: string, value: string | number | Buffer, ttl?: number): Promise<'OK'> {
    if (ttl) {
      return this.redisClient.set(key, value, 'EX', ttl);
    }
    return this.redisClient.set(key, value);
  }

  /**
   * Redis'ten bir değer getirir
   * @param key Anahtar
   */
  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  /**
   * Redis'ten bir anahtarı siler
   * @param key Anahtar
   */
  async delete(key: string): Promise<number> {
    return this.redisClient.del(key);
  }

  /**
   * Bir anahtarın süresini uzatır
   * @param key Anahtar
   * @param seconds Saniye cinsinden süre
   */
  async expire(key: string, seconds: number): Promise<number> {
    return this.redisClient.expire(key, seconds);
  }

  /**
   * Bir key'in varlığını kontrol eder
   * @param key Anahtar
   */
  async exists(key: string): Promise<number> {
    return this.redisClient.exists(key);
  }

  /**
   * Hash veri tipini kullanarak bir değer ayarlar
   * @param key Hash anahtarı
   * @param field Alan adı
   * @param value Değer
   */
  async hset(key: string, field: string, value: string | number): Promise<number> {
    return this.redisClient.hset(key, field, value);
  }

  /**
   * Hash veri tipinden bir değer getirir
   * @param key Hash anahtarı
   * @param field Alan adı
   */
  async hget(key: string, field: string): Promise<string | null> {
    return this.redisClient.hget(key, field);
  }

  /**
   * Hash veri tipinin tüm içeriğini getirir
   * @param key Hash anahtarı
   */
  async hgetall(key: string): Promise<Record<string, string>> {
    return this.redisClient.hgetall(key);
  }

  /**
   * Ham Redis istemcisini döndürür
   * İhtiyaç duyulduğunda daha karmaşık sorgular için
   */
  getClient(): Redis {
    return this.redisClient;
  }
}

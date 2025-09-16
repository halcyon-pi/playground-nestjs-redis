import KeyvRedis, { KeyvRedisOptions, RedisClientOptions } from '@keyv/redis';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Keyv, { KeyvOptions } from 'keyv';
import { CacheService } from 'src/cache.service';
import { QueueModule } from 'src/queue.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        if (!redisUrl) {
          throw new Error('REDIS_URL is not defined');
        }
        const isConnectionTls = redisUrl?.startsWith('rediss://');
        const redisUrlObject = new URL(redisUrl);
        const clientOptions: RedisClientOptions = {
          password: redisUrlObject.password ?? undefined,
          username: redisUrlObject.username ?? undefined,
          database: 0,
          socket: isConnectionTls
            ? {
                host: redisUrlObject.host,
                port: redisUrlObject.port
                  ? parseInt(redisUrlObject.port, 10)
                  : undefined,
                tls: isConnectionTls, // Enable TLS connection
                rejectUnauthorized: false, // Ignore self-signed certificate errors (for testing)

                // Alternatively, provide CA, key, and cert for mutual authentication
                // ca: fs.readFileSync('/path/to/ca-cert.pem'),
                // cert: fs.readFileSync('/path/to/client-cert.pem'), // Optional for client auth
                // key: fs.readFileSync('/path/to/client-key.pem'), // Optional for client auth
              }
            : undefined,
        };

        const keyvOptions: KeyvOptions = {
          namespace: 'cache',
          useKeyPrefix: false,
          ttl: 60 * 1000, // 1 minute
        };
        const keyvRedisOption: KeyvRedisOptions = {
          throwOnConnectError: true,
          useUnlink: true,
          keyPrefixSeparator: ':',
        };

        return {
          stores: [
            new Keyv(
              {
                store: new KeyvRedis(clientOptions, keyvRedisOption),
              },
              keyvOptions,
            ),
          ],
        };
      },
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
        name: 'bull',
        db: 1,
      },
    }),
    QueueModule,
  ],
  controllers: [AppController],
  providers: [AppService, CacheService],
})
export class AppModule {}

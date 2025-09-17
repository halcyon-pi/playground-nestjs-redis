import KeyvRedis, { KeyvRedisOptions, RedisClientOptions } from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Keyv, { KeyvOptions } from 'keyv';
import { CacheService } from 'src/cache.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDISCLOUD_URL');
        console.log(`REDISCLOUD_URL: ${redisUrl}`);

        if (!redisUrl) {
          throw new Error('REDISCLOUD_URL is not defined');
        }
        const isConnectionTls = redisUrl?.startsWith('rediss://');
        const redisUrlObject = new URL(redisUrl);
        const clientOptions: RedisClientOptions = {
          url: !isConnectionTls ? redisUrl : undefined, // Use full URL if not using TLS
          password: redisUrlObject.password ?? undefined,
          username: redisUrlObject.username ?? undefined,
          database: 0,
          socket: isConnectionTls
            ? {
                host: redisUrlObject.host,
                port: redisUrlObject.port
                  ? parseInt(redisUrlObject.port, 10)
                  : undefined,
                tls: true, // Enable TLS connection
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
        console.log('KeyvRedis', { clientOptions, keyvRedisOption });
        const store = new KeyvRedis(clientOptions, keyvRedisOption);

        store.on('error', (err) => {
          console.error('Keyv Redis connection error:', err);
        });
        store.on('connect', () => {
          console.log('Keyv Redis connected at ', redisUrl);
        });

        return {
          stores: [
            new Keyv(
              {
                store,
              },
              keyvOptions,
            ),
          ],
        };
      },
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
    // BullModule.forRootAsync({
    //   useFactory: (configService: ConfigService): Bull.QueueOptions => {
    //     const redisUrl = configService.get<string>('REDISCLOUD_URL');
    //     if (!redisUrl) {
    //       throw new Error('REDISCLOUD_URL is not defined');
    //     }
    //     const isConnectionTls = redisUrl?.startsWith('rediss://');
    //     const redisUrlObject = new URL(redisUrl);
    //     const bullRedisOptions: Bull.QueueOptions['redis'] = {
    //       host: redisUrlObject.hostname,
    //       port: redisUrlObject.port ? parseInt(redisUrlObject.port, 10) : 6379,
    //       name: 'bull',
    //       db: 1,
    //       username: redisUrlObject.username ?? undefined,
    //       password: redisUrlObject.password ?? undefined,
    //     };

    //     if (isConnectionTls) {
    //       bullRedisOptions.tls = {
    //         rejectUnauthorized: false, // Ignore self-signed certificate errors (for testing)
    //       };
    //     }

    //     return {
    //       redis: bullRedisOptions,
    //       defaultJobOptions: {
    //         removeOnComplete: true,
    //       },
    //       settings: {
    //         maxStalledCount: 1,
    //       },
    //     };
    //   },
    //   inject: [ConfigService],
    //   imports: [ConfigModule],
    // }),
    // QueueModule,
  ],
  controllers: [AppController],
  providers: [AppService, CacheService],
})
export class AppModule {}

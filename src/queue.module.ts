import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { QueueService } from 'src/queue.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'queue-foo',
    }),
  ],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}

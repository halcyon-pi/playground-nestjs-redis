import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

export class QueueService {
  constructor(@InjectQueue('queue-foo') private fooQueue: Queue) {}

  async add({ name, data }: { name: string; data: unknown }): Promise<void> {
    await this.fooQueue.add(name, data);
  }
}

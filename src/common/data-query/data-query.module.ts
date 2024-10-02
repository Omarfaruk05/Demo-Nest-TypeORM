import { Global, Module } from '@nestjs/common';
import { DataQueryService } from './data-query.service';

@Global()
@Module({
  providers: [DataQueryService],
  exports: [DataQueryService],
})
export class PaginationModule {}

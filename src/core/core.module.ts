import { Global, Module } from "@nestjs/common";

// Insert global providers, interceptors, pipes, guards, etc.

@Global()
@Module({
  providers: [],
  exports: [],
})
export class CoreModule {}

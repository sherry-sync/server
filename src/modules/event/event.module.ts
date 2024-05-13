import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { appConfig } from '@shared/configs';
import { JwtStrategy } from '@shared/strategies';

import { EventGateway } from '@modules/event/event.gateway';
import { EventService } from '@modules/event/event.service';

@Module({
  imports: [
    JwtModule.register({
      secret: appConfig.getAppSecret(),
      signOptions: { expiresIn: appConfig.getJwtExpired() },
    }),
  ],
  providers: [EventGateway, EventService, JwtStrategy],
  exports: [EventService],
})
export class EventModule {}

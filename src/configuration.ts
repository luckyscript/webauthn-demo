import { App, Configuration, ILifeCycle } from '@midwayjs/core';
import { join } from 'path';
import * as egg from '@midwayjs/web';
import * as view from '@midwayjs/view-ejs';
import * as orm from '@midwayjs/typeorm';

@Configuration({
  imports: [egg, view, orm],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration implements ILifeCycle {
  @App('egg')
  app: egg.Application;

  async onReady() {}
}

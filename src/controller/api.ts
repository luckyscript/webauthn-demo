import { Inject, Controller, Post, Get } from '@midwayjs/core';
import { Context } from '@midwayjs/web';
import { UserService } from '../service/user';
import { PasskeyService } from '../service/passkey';

@Controller('/api')
export class APIController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Inject()
  passkeyService: PasskeyService;

  @Post('/register')
  async register() {
    const { username, password } = this.ctx.request.body;

    await this.userService.createUser({ username, password });

    this.ctx.redirect('/index');
  }

  @Post('/login')
  async login() {
    const { username, password } = this.ctx.request.body;
    const user = await this.userService.getUserByUsername(username);
    if (!user) {
      throw new Error('User not found');
    }
    if (!this.userService.validatePassword(password, user.password)) {
      throw new Error('Password is incorrect');
    }
    this.ctx.session.user = user;
    this.ctx.redirect('/index');
  }

  @Get('/passkey/getKeyInfo')
  async getPasskeyInfo() {
    return this.passkeyService.getPasskeyInfo();
  }

  @Post('/passkey/register')
  async registerPasskey() {
    const passkey = this.ctx.request.body;
    return this.passkeyService.registerPasskey(passkey);
  }

  @Post('/passkey/login')
  async loginByPasskey() {
    const { username } = this.ctx.request.body;

    return this.userService.loginByPasskey(username);
  }

  @Post('/passkey/login/validate')
  async validatePasskey() {
    const passkey = this.ctx.request.body;

    const valid = await this.passkeyService.validatePasskey(passkey);
    if (valid) {
      const user = await this.userService.getUserByUsername(
        this.ctx.session.loginingUser
      );
      this.ctx.session.user = user;
      return { success: true };
    } else {
      return { success: false };
    }
  }

  @Post('/v2/passkey/login')
  async loginByPasskeyV2() {
    return this.userService.loginByPasskeyV2();
  }

  @Post('/v2/passkey/login/validate')
  async validatePasskeV2() {
    const passkey = this.ctx.request.body;

    const valid = await this.passkeyService.validatePasskeyV2(passkey);
    if (valid) {
      const userId = valid.userId;
      const user = await this.userService.getUser(userId);
      this.ctx.session.user = user;
      return { success: true };
    } else {
      return { success: false };
    }
  }
}

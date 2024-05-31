import { Controller, Get, Inject } from '@midwayjs/core';
import { PasskeyService } from '../service/passkey';
import { UserService } from '../service/user';

@Controller('/')
export class HomeController {
  @Inject()
  ctx;

  @Inject()
  passkeyService: PasskeyService;

  @Inject()
  userService: UserService;

  @Get('/')
  async home() {
    return this.ctx.redirect('/index');
  }

  @Get('/index')
  async index() {
    await this.ctx.render('index.ejs', {
      user: this.ctx.session?.user,
    });
  }

  @Get('/register')
  async register() {
    await this.ctx.render('register.ejs');
  }

  @Get('/login')
  async login() {
    await this.ctx.render('login.ejs');
  }

  @Get('/passkey-login')
  async passkeyLogin() {
    await this.ctx.render('passkey-login.ejs');
  }

  @Get('/passkey-login-2')
  async passkeyLogin2() {
    await this.ctx.render('passkey-login-2.ejs');
  }

  @Get('/passkey')
  async passkey() {
    let authenticator = [];
    if (this.ctx.session?.user) {
      authenticator = await this.userService.getAuthenticatorByUserId(
        this.ctx.session.user.id
      );
    }
    await this.ctx.render('passkey.ejs', {
      user: this.ctx.session?.user,
      authenticator,
    });
  }

  @Get('/logout')
  async logout() {
    this.ctx.session.user = null;
    this.ctx.redirect('/index');
  }
}

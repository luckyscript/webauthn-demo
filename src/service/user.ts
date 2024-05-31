import { Provide, Inject } from '@midwayjs/core';
import { IUserPayload } from '../interface';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { UserEntity } from '../entity/user.entity';
import { AuthenticatorEntity } from '../entity/authenticator.entity';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import * as crypto from 'node:crypto';
import { WebAuthNService } from './webauthn';
import { Context } from '@midwayjs/web';

@Provide()
export class UserService {
  @InjectEntityModel(UserEntity)
  userEntity: Repository<UserEntity>;

  @InjectEntityModel(AuthenticatorEntity)
  authenticatorEntity: Repository<AuthenticatorEntity>;

  @Inject()
  webAuthnService: WebAuthNService;

  @Inject()
  ctx: Context;

  async createUser(payload: IUserPayload) {
    const { username, password } = payload;
    const isUserExist = await this.getUserByUsername(username);

    if (isUserExist) {
      throw new Error('User already exists');
    }

    const encryptedPassword = this.encryptPassword(password);
    const user = this.userEntity.create({
      name: username,
      password: encryptedPassword,
    });

    return await this.userEntity.save(user);
  }

  async getUser(id: number) {
    return this.userEntity.findOneBy({ id });
  }

  async getUserByUsername(username: string) {
    return this.userEntity.findOneBy({ name: username });
  }

  async getAuthenticatorByUserId(id: number) {
    return this.authenticatorEntity.findBy({ userId: id });
  }

  async getAuthenticator() {
    return this.authenticatorEntity.find();
  }

  async registerAuthenticator(id, token) {
    const authenticator = this.authenticatorEntity.create({
      userId: id,
      ...token,
    });
    return await this.authenticatorEntity.save(authenticator);
  }

  hash(string) {
    const hash = crypto.createHash('sha256');
    hash.update(string);
    const hasdString = hash.digest('hex');
    return hasdString;
  }

  encryptPassword(password: string) {
    const randomSalt = uuid().replaceAll('-', '');
    const hashedPassword = this.hash(randomSalt + password);
    return randomSalt + '$' + hashedPassword;
  }

  validatePassword(password: string, encryptedPassword: string) {
    const [salt, hashedPassword] = encryptedPassword.split('$');
    const hashed = this.hash(salt + password);
    return hashed === hashedPassword;
  }

  async loginByPasskey(username) {
    const user = await this.getUserByUsername(username);
    if (!user) {
      throw new Error('User not found');
    }
    const authenticator = await this.getAuthenticatorByUserId(user.id);
    if (!authenticator) {
      throw new Error('passkey not found');
    }

    const assertion = await this.webAuthnService.login();
    assertion.allowCredentials = authenticator;
    this.ctx.allowCredentials = authenticator;
    this.ctx.session.loginingUser = username;
    this.ctx.session.challenge = assertion.challengeBase64;
    return assertion;
  }

  async loginByPasskeyV2() {
    const authenticator = await this.getAuthenticator();
    if (!authenticator) {
      throw new Error('passkey not found');
    }

    const assertion = await this.webAuthnService.login();
    assertion.allowCredentials = authenticator;
    this.ctx.allowCredentials = authenticator;
    this.ctx.session.challenge = assertion.challengeBase64;
    return assertion;
  }
}

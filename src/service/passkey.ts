/**
 * @author lukai
 * @file passkey service
 */
import { Provide, Inject } from '@midwayjs/core';
import { UnauthorizedError } from '@midwayjs/core/dist/error/http';
import { Context } from '@midwayjs/web';
import { WebAuthNService } from './webauthn';
import { UserService } from './user';

@Provide()
export class PasskeyService {
  @Inject()
  ctx: Context;

  @Inject()
  webAuthnService: WebAuthNService;

  @Inject()
  userService: UserService;

  /**
   * get Passkey Register Info for user
   * website need this info to call broswer API
   * @returns Passkey Register Info
   */
  async getPasskeyInfo() {
    const user = this.ctx.session.user;
    if (!user) {
      return new UnauthorizedError('please Login first');
    }

    const challengeCred = await this.webAuthnService.registration({
      id: user.id,
      username: user.name,
      displayName: user.name,
    });

    this.ctx.session.challenge = challengeCred.challengeBase64;

    const excludeCredentials = await this.userService.getAuthenticatorByUserId(
      user.id
    );
    return {
      ...challengeCred,
      excludeCredentials,
    };
  }

  async registerPasskey(passkey) {
    const user = this.ctx.session.user;
    if (!user) {
      return new UnauthorizedError('please Login first');
    }

    const { rawId: rawIdBase64, response, type, transports } = passkey;
    passkey.rawId = this.webAuthnService.base64URLdecode(rawIdBase64);
    passkey.response.attestationObject = this.webAuthnService.base64URLdecode(
      response.attestationObject
    );
    const attetationResult = await this.webAuthnService.attestation(
      passkey,
      this.ctx.session.challenge
    );

    const token = {
      credId: this.webAuthnService.base64URLencode(
        attetationResult.authnrData.get('credId')
      ),
      publicKey: attetationResult.authnrData.get('credentialPublicKeyPem'),
      type,
      transports: transports.join(','),
      counter: attetationResult.authnrData.get('counter'),
    };
    return this.userService.registerAuthenticator(user.id, token);
  }

  async validatePasskey(passkey) {
    const { rawId: rawIdBase64, response } = passkey;
    const passKey = {
      ...passkey,
      rawId: this.webAuthnService.base64URLdecode(rawIdBase64),
      response: {
        ...response,
        authenticatorData: this.webAuthnService.base64URLdecode(
          response.authenticatorData
        ),
        clientDataJSON: this.webAuthnService.base64URLdecode(
          response.clientDataJSON
        ),
        signature: this.webAuthnService.base64URLdecode(response.signature),
        userHandle: this.webAuthnService.base64URLdecode(rawIdBase64),
      },
    };

    const user = await this.userService.getUserByUsername(
      this.ctx.session.loginingUser
    );

    const authenticators = await this.userService.getAuthenticatorByUserId(
      user.id
    );

    const validAuthenticators = await Promise.all(
      authenticators.map(async item => {
        const assertionExpectations = {
          allowCredentials: this.ctx.session.allowCredentials,
          challenge: this.ctx.session.challenge,
          factor: 'either',
          origin: this.webAuthnService.webauthnConfig.origin,
          publicKey: item.publicKey,
          prevCounter: item.counter,
          userHandle: this.webAuthnService.base64URLdecode(item.credId),
        };

        const result = await this.webAuthnService.assertion(
          passKey,
          assertionExpectations
        );
        if (result) {
          return item;
        }
      })
    ).then(arr => arr.find(item => item));

    if (validAuthenticators) {
      return validAuthenticators;
    } else {
      return null;
    }
  }

  async validatePasskeyV2(passkey) {
    const { rawId: rawIdBase64, response } = passkey;
    const passKey = {
      ...passkey,
      rawId: this.webAuthnService.base64URLdecode(rawIdBase64),
      response: {
        ...response,
        authenticatorData: this.webAuthnService.base64URLdecode(
          response.authenticatorData
        ),
        clientDataJSON: this.webAuthnService.base64URLdecode(
          response.clientDataJSON
        ),
        signature: this.webAuthnService.base64URLdecode(response.signature),
        userHandle: this.webAuthnService.base64URLdecode(rawIdBase64),
      },
    };

    const authenticators = await this.userService.getAuthenticator();

    const validAuthenticators = await Promise.all(
      authenticators.map(async item => {
        const assertionExpectations = {
          allowCredentials: this.ctx.session.allowCredentials,
          challenge: this.ctx.session.challenge,
          factor: 'either',
          origin: this.webAuthnService.webauthnConfig.origin,
          publicKey: item.publicKey,
          prevCounter: item.counter,
          userHandle: this.webAuthnService.base64URLdecode(item.credId),
        };

        const result = await this.webAuthnService.assertion(
          passKey,
          assertionExpectations
        );
        if (result) {
          return item;
        }
      })
    ).then(arr => arr.find(item => item));

    if (validAuthenticators) {
      return validAuthenticators;
    } else {
      return null;
    }
  }
}

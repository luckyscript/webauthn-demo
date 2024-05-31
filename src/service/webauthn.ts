import { Config, Init, Provide } from '@midwayjs/core';
import { Fido2Lib } from 'fido2-lib';

@Provide('webAuthnService')
export class WebAuthNService {
  f2l: Fido2Lib;

  @Config('webauthn')
  webauthnConfig;

  @Init()
  init() {
    this.f2l = new Fido2Lib({
      timeout: this.webauthnConfig.timeout,
      rpId: this.webauthnConfig.rp.id,
      rpName: this.webauthnConfig.rp.name,
      challengeSize: 128,
      attestation: 'none',
      cryptoParams: [-7, -257],
      authenticatorRequireResidentKey: false,
      authenticatorUserVerification: 'preferred',
    });
  }

  async registration(user) {
    const registrationOption = await this.f2l.attestationOptions();

    registrationOption.user = {
      id: new Uint8Array(user.id),
      name: user.username,
      displayName: user.displayName,
    };

    const challengeBase64 = this.base64URLencode(registrationOption.challenge);
    const userIdBase64 = this.base64URLencode(user.id);
    return {
      ...registrationOption,
      challengeBase64: challengeBase64,
      userIdBase64: userIdBase64,
    };
  }

  async attestation(clientAttestationResponse, challenge) {
    const attestationExpectations: any = {
      challenge: this.base64URLdecode(challenge),
      origin: this.webauthnConfig.origin,
      factor: 'either',
    };

    const regResult = await this.f2l.attestationResult(
      clientAttestationResponse,
      attestationExpectations
    );
    return regResult;
  }

  async login() {
    const assertionOptions: any = await this.f2l.assertionOptions();
    assertionOptions.challengeBase64 = this.base64URLencode(
      assertionOptions.challenge
    );
    assertionOptions.status = 'ok';
    return assertionOptions;
  }

  async assertion(assertionResult, expectedAssertionResult) {
    try {
      const authnResult = await this.f2l.assertionResult(
        assertionResult,
        expectedAssertionResult
      );
      return authnResult;
    } catch (err) {
      return false;
    }
  }

  /**
   * encode ArrayBuffer to base64URL
   * @param buffer ArrayBuffer
   * @returns base64String
   */
  base64URLencode(buffer: ArrayBuffer) {
    return btoa(
      Array.from(new Uint8Array(buffer), b => String.fromCharCode(b)).join('')
    )
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  base64URLdecode(base64URL: string) {
    const m = base64URL.length % 4;
    return Uint8Array.from(
      atob(
        base64URL
          .replace(/-/g, '+')
          .replace(/_/g, '/')
          .padEnd(base64URL.length + (m === 0 ? 0 : 4 - m), '=')
      ),
      c => c.charCodeAt(0)
    ).buffer;
  }
}

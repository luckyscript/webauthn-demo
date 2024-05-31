/**
 * @description User-Service parameters
 */
export interface IUserOptions {
  uid: string;
}

export interface IUserPayload {
  username: string;
  password: string;
}

export interface IGetUserResponse {
  success: boolean;
  message: string;
  data: IUserOptions;
}

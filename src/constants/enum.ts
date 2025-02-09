export enum UserVerifyStatus {
  Verified,
  Unverified
}

export enum UserStatus {
  Active,
  Inactive
}

export enum UserRole {
  Admin,
  Moderator,
  WarehouseStaff,
  Customer
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  VerifyEmailToken,
  ForgotPasswordToken
}

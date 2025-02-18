import { UserRole, UserStatus, UserVerifyStatus } from '~/constants/enum'

export type TokenPayload = {
  userId: string
  userVerifyStatus: UserVerifyStatus
  userStatus: UserStatus
  userRole: UserRole
}

export type RegisterReqBody = {
  email: string
  password: string
  confirmPassword: string
  role: UserRole
}

export type LogoutReqBody = {
  refreshToken: string
}

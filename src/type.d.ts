import 'express'

import User from '~/models/databases/User'
import { TokenPayload } from '~/models/requests/User.request'

declare module 'express' {
  interface Request {
    user?: User
    decodedAuthorization?: TokenPayload
    decodedRefreshToken?: TokenPayload
    decodedEmailVerifyToken?: TokenPayload
    decodedForgotPasswordToken?: TokenPayload
  }
}

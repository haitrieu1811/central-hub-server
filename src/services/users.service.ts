import { ObjectId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import { TokenType, UserStatus, UserVerifyStatus } from '~/constants/enum'
import User from '~/models/databases/User'
import { RegisterReqBody, TokenPayload } from '~/models/requests/User.request'
import databaseService from '~/services/database.service'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'

class UsersService {
  // Tạo access token
  async signAccessToken(payload: TokenPayload) {
    return signToken({
      payload: {
        ...payload,
        tokenType: TokenType.AccessToken
      },
      privateKey: ENV_CONFIG.ACCESS_TOKEN_SECRET,
      options: {
        expiresIn: ENV_CONFIG.ACCESS_TOKEN_EXPIRES_IN as any
      }
    })
  }

  // Tạo refresh token
  async signRefreshToken(payload: TokenPayload) {
    const { exp } = payload
    if (exp) {
      return signToken({
        payload: {
          ...payload,
          tokenType: TokenType.RefreshToken,
          exp
        },
        privateKey: ENV_CONFIG.REFRESH_TOKEN_SECRET
      })
    }
    return signToken({
      payload: {
        ...payload,
        tokenType: TokenType.RefreshToken
      },
      privateKey: ENV_CONFIG.REFRESH_TOKEN_SECRET,
      options: {
        expiresIn: ENV_CONFIG.REFRESH_TOKEN_EXPIRES_IN as any
      }
    })
  }

  // Tạo access và refresh token
  async signAccessAndRefreshToken(payload: TokenPayload) {
    return Promise.all([this.signAccessToken(payload), this.signRefreshToken(payload)])
  }

  // Tạo token xác thực email
  async signVerifyEmailToken(payload: TokenPayload) {
    return signToken({
      payload: {
        ...payload,
        tokenType: TokenType.VerifyEmailToken
      },
      privateKey: ENV_CONFIG.VERIFY_EMAIL_TOKEN_SECRET,
      options: {
        expiresIn: ENV_CONFIG.VERIFY_EMAIL_TOKEN_EXPIRES_IN as any
      }
    })
  }

  // Đăng ký tài khoản
  async register(body: RegisterReqBody) {
    const userId = new ObjectId()
    const verifyEmailToken = await this.signVerifyEmailToken({
      userId: userId.toString(),
      userVerifyStatus: UserVerifyStatus.Unverified,
      userStatus: UserStatus.Active,
      userRole: body.role
    })
    const [, [accessToken, refreshToken]] = await Promise.all([
      await databaseService.users.insertOne(
        new User({
          ...body,
          _id: userId,
          password: hashPassword(body.password),
          verifyEmailToken
        })
      ),
      usersService.signAccessAndRefreshToken({
        userId: userId.toString(),
        userRole: body.role,
        userStatus: UserStatus.Active,
        userVerifyStatus: UserVerifyStatus.Unverified
      })
    ])
    const user = await databaseService.users.findOne(userId, {
      projection: {
        email: 1,
        fullName: 1,
        createdAt: 1,
        updatedAt: 1
      }
    })
    return {
      accessToken,
      refreshToken,
      user
    }
  }
}

const usersService = new UsersService()
export default usersService

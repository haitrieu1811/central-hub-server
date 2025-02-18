import pick from 'lodash/pick'
import { ObjectId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import { TokenType, UserRole, UserStatus, UserVerifyStatus } from '~/constants/enum'
import { RefreshToken } from '~/models/databases/RefreshToken'
import User from '~/models/databases/User'
import { RegisterReqBody, TokenPayload } from '~/models/requests/User.request'
import databaseService from '~/services/database.service'
import { hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'

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
  async signRefreshToken({ exp, ...payload }: TokenPayload & { exp?: number }) {
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
  async signAccessAndRefreshToken({ exp, ...payload }: TokenPayload & { exp?: number }) {
    return Promise.all([this.signAccessToken(payload), this.signRefreshToken({ exp, ...payload })])
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

  // Giải mã refresh token
  async decodedRefreshToken(refreshToken: string) {
    const tokenPayload = await verifyToken({
      token: refreshToken,
      secretOrPublicKey: ENV_CONFIG.REFRESH_TOKEN_SECRET
    })
    return tokenPayload
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

  // Đăng nhập
  async login(user: User) {
    const { _id, role, status, verifyStatus } = user
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({
      userId: _id.toString(),
      userRole: role,
      userStatus: status,
      userVerifyStatus: verifyStatus
    })
    const { iat, exp } = await this.decodedRefreshToken(refreshToken)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: refreshToken,
        iat,
        exp
      })
    )
    const configuredUser = pick(user, ['_id', 'email', 'fullName', 'createdAt', 'updatedAt'])
    return {
      accessToken,
      refreshToken,
      user: configuredUser
    }
  }

  // Đăng xuất
  async logout(refreshToken: string) {
    await databaseService.refreshTokens.deleteOne({
      token: refreshToken
    })
    return true
  }

  // Refresh token
  async refreshToken({
    oldRefreshToken,
    userId,
    userStatus,
    userVerifyStatus,
    userRole,
    exp
  }: {
    oldRefreshToken: string
    userId: string
    userStatus: UserStatus
    userVerifyStatus: UserVerifyStatus
    userRole: UserRole
    exp: number
  }) {
    // Tạo access token và refresh token mới
    const [newAccessToken, newRefreshToken] = await this.signAccessAndRefreshToken({
      userId,
      userStatus,
      userVerifyStatus,
      userRole,
      exp
    })
    console.log('>>> newRefreshToken', newRefreshToken)
    console.log('>>> oldRefreshToken', oldRefreshToken)
    // Giải mã refresh token mới
    const decodedRefreshToken = await this.decodedRefreshToken(newRefreshToken)
    // Lưu refresh token mới vào DB và xóa refresh token cũ
    await Promise.all([
      databaseService.refreshTokens.insertOne(
        new RefreshToken({
          token: newRefreshToken,
          iat: decodedRefreshToken.iat,
          exp: decodedRefreshToken.exp
        })
      ),
      databaseService.refreshTokens.deleteOne({
        token: oldRefreshToken
      })
    ])
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    }
  }
}

const usersService = new UsersService()
export default usersService

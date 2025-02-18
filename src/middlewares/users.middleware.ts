import { Request } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import capitalize from 'lodash/capitalize'

import { ENV_CONFIG } from '~/constants/config'
import { UserRole } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.service'
import { hashPassword } from '~/utils/crypto'
import { numberEnumToArray } from '~/utils/helpers'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

const roles = numberEnumToArray(UserRole)

const emailSchema: ParamSchema = {
  trim: true,
  notEmpty: {
    errorMessage: 'Email là bắt buộc.'
  },
  isEmail: {
    errorMessage: 'Email không hợp lệ.'
  }
}

export const registerValidator = validate(
  checkSchema(
    {
      email: {
        ...emailSchema,
        custom: {
          options: async (value) => {
            const email = await databaseService.users.findOne({ email: value })
            if (email) {
              throw new Error('Email đã tồn tại trên hệ thống.')
            }
            return true
          }
        }
      },
      password: {
        trim: true,
        notEmpty: {
          errorMessage: 'Mật khẩu là bắt buộc.'
        },
        isLength: {
          options: {
            min: 8,
            max: 32
          },
          errorMessage: 'Mật khẩu phải dài từ 8 đến 32 ký tự.'
        },
        isStrongPassword: {
          options: {
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage:
            'Mật khẩu phải có ít nhất một chữ cái thường, một chữ cái hoa, một chữ số và một ký tự đặc biệt.'
        }
      },
      confirmPassword: {
        trim: true,
        notEmpty: {
          errorMessage: 'Nhập lại mật khẩu là bắt buộc.'
        },
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error('Nhập lại mật khẩu không chính xác.')
            }
            return true
          }
        }
      },
      role: {
        notEmpty: {
          errorMessage: 'Vai trò người dùng là bắt buộc.'
        },
        isIn: {
          options: [roles],
          errorMessage: 'Vai trò người dùng không hợp lệ.'
        }
      }
    },
    ['body']
  )
)

export const loginValidator = validate(
  checkSchema(
    {
      email: emailSchema,
      password: {
        trim: true,
        notEmpty: {
          errorMessage: 'Mật khẩu là bắt buộc.'
        },
        custom: {
          options: async (value: string, { req }) => {
            const user = await databaseService.users.findOne({
              email: req.body.email,
              password: hashPassword(value)
            })
            if (!user) {
              throw new Error('Email hoặc mật khẩu không chính xác.')
            }
            ;(req as Request).user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refreshToken: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: 'Refresh token là bắt buộc.',
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const [decodedRefreshToken, refreshToken] = await Promise.all([
                verifyToken({
                  token: value,
                  secretOrPublicKey: ENV_CONFIG.REFRESH_TOKEN_SECRET
                }),
                databaseService.refreshTokens.findOne({
                  token: value
                })
              ])
              if (!refreshToken) {
                throw new ErrorWithStatus({
                  message: 'Refresh token không tồn tại.',
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              ;(req as Request).decodedRefreshToken = decodedRefreshToken
              return true
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                if (error instanceof TokenExpiredError) {
                  throw new ErrorWithStatus({
                    message: 'Refresh token đã hết hạn.',
                    status: HTTP_STATUS.UNAUTHORIZED
                  })
                }
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              throw error
            }
          }
        }
      }
    },
    ['body']
  )
)

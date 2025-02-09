import { checkSchema } from 'express-validator'

import { UserRole } from '~/constants/enum'
import databaseService from '~/services/database.service'
import { numberEnumToArray } from '~/utils/helpers'
import { validate } from '~/utils/validation'

const roles = numberEnumToArray(UserRole)

export const registerValidator = validate(
  checkSchema(
    {
      email: {
        trim: true,
        notEmpty: {
          errorMessage: 'Email là bắt buộc.'
        },
        isEmail: {
          errorMessage: 'Email không hợp lệ.'
        },
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

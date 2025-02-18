import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import User from '~/models/databases/User'
import { RefreshTokenReqBody, RegisterReqBody, TokenPayload } from '~/models/requests/User.request'
import usersService from '~/services/users.service'

// Đăng ký tài khoản
export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  res.json({
    message: 'Đăng ký tài khoản thành công.',
    data: result
  })
}

// Đăng nhập
export const loginController = async (req: Request, res: Response) => {
  const result = await usersService.login(req.user as User)
  res.json({
    message: 'Đăng nhập thành công.',
    data: result
  })
}

// Đăng xuất
export const logoutController = async (req: Request<ParamsDictionary, any, RefreshTokenReqBody>, res: Response) => {
  await usersService.logout(req.body.refreshToken)
  res.json({
    message: 'Đăng xuất thành công.'
  })
}

// Refresh token
export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response
) => {
  const decodedRefreshToken = req.decodedRefreshToken as TokenPayload & { exp: number }
  const result = await usersService.refreshToken({
    oldRefreshToken: req.body.refreshToken,
    ...decodedRefreshToken
  })
  console.log('>>> decodedRefreshToken', req.decodedRefreshToken)
  res.json({
    message: 'Refresh token thành công.',
    data: result
  })
}

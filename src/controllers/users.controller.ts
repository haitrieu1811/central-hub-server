import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import User from '~/models/databases/User'
import { LogoutReqBody, RegisterReqBody } from '~/models/requests/User.request'
import usersService from '~/services/users.service'

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  res.json({
    message: 'Đăng ký tài khoản thành công.',
    data: result
  })
}

export const loginController = async (req: Request, res: Response) => {
  const result = await usersService.login(req.user as User)
  res.json({
    message: 'Đăng nhập thành công.',
    data: result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  await usersService.logout(req.body.refreshToken)
  res.json({
    message: 'Đăng xuất thành công.'
  })
}

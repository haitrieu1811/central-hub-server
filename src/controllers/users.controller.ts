import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { RegisterReqBody } from '~/models/requests/User.request'
import usersService from '~/services/users.service'

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  res.json({
    message: 'Đăng ký tài khoản thành công.',
    data: result
  })
}

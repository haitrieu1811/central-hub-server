import express from 'express'

import { ENV_CONFIG } from '~/constants/config'
import databaseService from '~/services/database.service'

databaseService.connect()

const app = express()
const port = ENV_CONFIG.PORT || 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

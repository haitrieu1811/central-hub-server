import { Db, MongoClient } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'

const uri = `mongodb+srv://${ENV_CONFIG.DB_USERNAME}:${ENV_CONFIG.DB_PASSWORD}@central-hub-cluster.x1sdk.mongodb.net/?retryWrites=true&w=majority&appName=central-hub-cluster`

class DatabaseService {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(ENV_CONFIG.DB_NAME)
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}

const databaseService = new DatabaseService()
export default databaseService

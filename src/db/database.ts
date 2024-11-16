import { IllustDTO } from '@/types'
import { getRandomSamples, parseRedisHash } from '@/utils'
import { createClient } from 'redis'

export class Database {
  private _client
  constructor(url: string) {
    this._client = createClient({ url }).on('error', (err) => {
      console.error(err)
    })
  }

  async connect(retries: number = 5, timeout: number = 10000) {
    for (let i = 0; i < retries; i++) {
      try {
        if (!this._client.isOpen) {
          await this._client.connect()
          return
        }
      } catch (err) {
        console.error(err)
        if (i === retries - 1) throw err
        await new Promise((resolve) => setTimeout(resolve, timeout))
      }
    }
  }

  async disconnect() {
    if (this._client.isOpen) {
      await this._client.disconnect()
    }
  }

  async getIllusts(num: number): Promise<IllustDTO[]> {
    const illusts: IllustDTO[] = []
    await this.connect()
    const tags = await this._client.keys('baTag*')

    const ids = await this._client.sUnion(tags)

    const pids = getRandomSamples(ids, num)
    for (const pid of pids) {
      const illust = await this._client.hGetAll(`baId:${pid}`)
      const illustInfo = {
        ...parseRedisHash<IllustDTO>(illust),
        id: parseInt(pid),
      }
      illusts.push(illustInfo)
    }
    await this.disconnect()

    return illusts
  }

  async getIllustsByTag(tag: string, num: number): Promise<IllustDTO[]> {
    const illusts: IllustDTO[] = []
    await this.connect()
    const ids = await this._client.sMembers(`baTag:${tag}`)

    const pids = getRandomSamples(ids, num)
    for (const pid of pids) {
      const illust = await this._client.hGetAll(`baId:${pid}`)
      const illustInfo = {
        ...parseRedisHash<IllustDTO>(illust),
        id: parseInt(pid),
      }
      illusts.push(illustInfo)
    }
    await this.disconnect()

    return illusts
  }
}

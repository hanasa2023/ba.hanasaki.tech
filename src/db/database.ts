import { Illust, IllustDetails, IllustDTO, IRequest } from '@/types'
import { getRandomSamples, parseRedisHash, translateTag } from '@/utils'
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
          console.log('Connecting to Redis...')
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
      console.log('Disconnected from Redis')
    }
  }

  async getIllusts(req: IRequest): Promise<Illust[]> {
    const illusts: Illust[] = []
    await this.connect()
    const ids: string[] = []
    if (req.tags.length === 0) {
      // 取交集
      const ids1 = await this._client.sInter([
        `baImg:${req.isAI ? 'ai' : 'notAI'}`,
        `baImg:${req.restrict}`,
      ])

      ids.push(...ids1)
    } else {
      const ids1 = await this._client.sInter([
        `baImg:${req.isAI ? 'ai' : 'notAI'}`,
        `baImg:${req.restrict}`,
        // ...req.tags.map((tag) => `baTag:${tag}`),
        ...req.tags.map((tag) => `baTag:${translateTag(tag)}`),
      ])
      ids.push(...ids1)
    }

    const pids = getRandomSamples(ids, req.num)
    for (const pid of pids) {
      const illust = await this._client.hGetAll(`baId:${pid}`)
      const illustInfo = parseRedisHash<IllustDTO>(illust)
      illusts.push({
        pid: illustInfo.id,
        uid: illustInfo.authorId,
        author: illustInfo.author,
        title: illustInfo.title,
        tags: illustInfo.tags.split(', '),
        imageUrl: illustInfo.imgUrl,
        aiType: illustInfo.aiType !== 1,
        restrict: illustInfo.restrict,
      })
    }
    await this.disconnect()

    return illusts
  }

  async setIllusts(pid: string): Promise<string> {
    // 获取图片信息
    const response = await fetch(
      `https://www.pixiv.net/touch/ajax/illust/details?illust_id=${pid}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
          Referer: `https://www.pixiv.net`,
        },
      },
    )

    if (response.ok) {
      await this.connect()
      const illust: IllustDetails = (await response.json()).body.illust_details
      // 过滤掉收藏数小于300的图片
      if (illust.bookmark_user_total < 300) return '该图片收藏数小于300, 已过滤'
      const tags = illust.tags.reduce((acc: string, cur: string) => {
        return acc + ', ' + cur
      })
      // 设置baTag:tag
      for (const tag of illust.tags) {
        await this._client.sAdd(`baTag:${tag}`, pid)
      }
      // 设置baImg:ai/notAI, baImg:safe/r18
      await this._client.sAdd(
        `baImg:${illust.ai_type !== 1 ? 'ai' : 'notAI'}`,
        pid,
      )
      await this._client.sAdd(
        `baImg:${illust.restrict === '0' ? 'safe' : 'r18'}`,
        pid,
      )
      const existsId = await this._client.exists(`baId:${pid}`)
      if (!existsId) {
        await this._client.del(`baId:${pid}`)
        await this._client.hSet(`baId:${pid}`, 'id', illust.id)
        await this._client.hSet(`baId:${pid}`, 'title', illust.title)
        await this._client.hSet(`baId:${pid}`, 'tags', tags)
        await this._client.hSet(
          `baId:${pid}`,
          'restrict',
          illust.restrict === '0' ? 'safe' : 'r18',
        )
        await this._client.hSet(`baId:${pid}`, 'aiType', illust.ai_type)
        await this._client.hSet(
          `baId:${pid}`,
          'imgUrl',
          illust.url_big.replace('i.pximg.net', 'pximg.hanasaki.tech'),
        )
        await this._client.hSet(
          `baId:${pid}`,
          'author',
          illust.author_details.user_name,
        )
        await this._client.hSet(
          `baId:${pid}`,
          'authorId',
          illust.author_details.user_id,
        )
      }
      await this.disconnect()
    }
    return '图片信息已存入数据库'
  }
}

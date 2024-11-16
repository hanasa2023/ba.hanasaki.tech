import { Database } from '@/db/database'
import { IRequest } from '@/types'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const original_req: IRequest = await req.json()
  const real_req: IRequest = {
    num: original_req.num || 1,
    tags: original_req.tags || [],
    isAI: original_req.isAI || false,
    restrict: original_req.restrict || 'safe',
  }

  const db = new Database(process.env.REDIS_URL as string)

  try {
    const illusts = await db.getIllusts(real_req)
    return NextResponse.json({
      code: 200,
      message: illusts.length === 0 ? '未找到符合条件的插画' : 'success',
      data: { illusts, total: illusts.length },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

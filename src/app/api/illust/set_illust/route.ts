import { Database } from '@/db/database'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { pid } = await req.json()
  const db = new Database(process.env.REDIS_URL as string)
  try {
    const res = await db.setIllusts(pid.toString())
    return NextResponse.json({
      code: 200,
      message: res,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

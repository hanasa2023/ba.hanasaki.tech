import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/db/database'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tag: string; num: string }> },
) {
  const { tag, num } = await params
  const n = parseInt(num)
  if (isNaN(n)) {
    return NextResponse.json({ error: 'Invalid number' }, { status: 400 })
  }

  const db = new Database(process.env.REDIS_URL as string)

  try {
    const illusts = await db.getIllustsByTag(tag, n)

    return NextResponse.json(illusts)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

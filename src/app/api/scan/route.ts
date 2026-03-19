import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('image') as File
  if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 503 })

  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')
  const mediaType = file.type || 'image/jpeg'

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'content-type': 'application/json', 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            { type: 'text', text: `Analyze this wine label. Return JSON only:\n{"name":"wine name","producer":"producer","vintage":2020,"region":"region","country":"country","grape":"grape variety","estimatedValue":"€XX","drinkingWindow":"2024-2030","tastingNotes":"brief tasting notes","foodPairings":["dish1","dish2"],"rating":"XX/100 if known"}` }
          ],
        }],
      }),
    })
    const data = await res.json()
    const text = data.content?.[0]?.text || '{}'
    const cleaned = text.replace(/```json\s*/i, '').replace(/```\s*/i, '').trim()
    const result = JSON.parse(cleaned)
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: 'Could not analyze the label. Try a clearer photo.' }, { status: 500 })
  }
}

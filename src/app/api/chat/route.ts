import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { message, wines } = await req.json()
  if (!message) return NextResponse.json({ error: 'message required' }, { status: 400 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ reply: "AI sommelier is not configured yet. Add ANTHROPIC_API_KEY to enable." })

  const collectionSummary = (wines || []).slice(0, 30).map((w: any) =>
    `${w.name} ${w.vintage || ''} by ${w.producer} (${w.region}, ${w.country}) — ${w.quantity}btl, €${w.current_market_value || w.purchase_price || '?'}`
  ).join('\n')

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'content-type': 'application/json', 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: `You are an expert sommelier and wine advisor. The user has a wine collection:\n\n${collectionSummary || 'No wines yet.'}\n\nGive concise, practical advice about their wines. Be warm and knowledgeable. Use wine terminology but explain it. Keep responses under 150 words.`,
        messages: [{ role: 'user', content: message }],
      }),
    })
    const data = await res.json()
    const reply = data.content?.[0]?.text || 'Sorry, I could not process that request.'
    return NextResponse.json({ reply })
  } catch (err: any) {
    return NextResponse.json({ reply: 'The sommelier is temporarily unavailable. Please try again.' })
  }
}

// POST /api/openai/bigfive-analyze
// Recebe os escores Big Five + contexto do usuário e gera uma análise completa.
// Retorna: BigFiveAnalysis

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getUserApiKey } from '@/lib/getUserApiKey'
import type { BigFiveResult, BigFiveAnalysis } from '@/types/profile'

export async function POST(req: NextRequest) {
  let current: BigFiveResult
  let previous: BigFiveResult | null
  let habitNames: string[]
  try {
    const body    = await req.json()
    current       = body.current   as BigFiveResult
    previous      = body.previous  as BigFiveResult | null ?? null
    habitNames    = body.habitNames as string[] ?? []
    if (!current?.openness && current?.openness !== 0) {
      return NextResponse.json({ error: 'invalid_payload', message: 'current obrigatório com escores.' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const scoreBlock = `Escores OCEAN (0-100):
- Openness (Abertura): ${current.openness}
- Conscientiousness (Conscienciosidade): ${current.conscientiousness}
- Extraversion (Extroversão): ${current.extraversion}
- Agreeableness (Amabilidade): ${current.agreeableness}
- Neuroticism (Neuroticismo): ${current.neuroticism}`

  const previousBlock = previous
    ? `\nEscores do trimestre anterior (${previous.quarter}):
- Openness: ${previous.openness} → ${current.openness}
- Conscientiousness: ${previous.conscientiousness} → ${current.conscientiousness}
- Extraversion: ${previous.extraversion} → ${current.extraversion}
- Agreeableness: ${previous.agreeableness} → ${current.agreeableness}
- Neuroticism: ${previous.neuroticism} → ${current.neuroticism}`
    : ''

  const habitsBlock = habitNames.length > 0
    ? `\nHábitos ativos do usuário: ${habitNames.join(', ')}`
    : ''

  const systemPrompt = `Você é um psicólogo especialista em personalidade e desenvolvimento humano. Analise o perfil Big Five (OCEAN) abaixo e produza uma análise profunda, personalizada e orientada a ação para uso em um app de hábitos e performance.

${scoreBlock}${previousBlock}${habitsBlock}

Responda SOMENTE com JSON válido neste formato exato (sem texto adicional, sem markdown):
{
  "personalityProfile": "<parágrafo descrevendo o perfil de personalidade de forma integrada e personalizada>",
  "strengthsFromTraits": ["<força 1 derivada dos traços>", "<força 2>", "<força 3>"],
  "challengesFromTraits": ["<desafio 1 derivado dos traços>", "<desafio 2>", "<desafio 3>"],
  "habitCompatibility": [
    {
      "habitKey": "<nome do hábito>",
      "habitName": "<nome do hábito>",
      "compatibility": "alta|media|baixa",
      "explanation": "<1 frase explicando a compatibilidade com o perfil>"
    }
  ],
  "moodPatterns": "<parágrafo sobre padrões de humor e energia esperados com base no perfil>",
  "consistencyPrediction": "<parágrafo prevendo como esse perfil tende a se comportar em relação a consistência nos hábitos>",
  "actionableInsights": ["<insight acionável 1>", "<insight acionável 2>", "<insight acionável 3>"],
  "quarterComparison": ${previous ? '"<parágrafo comparando com o trimestre anterior e identificando tendências>"' : 'null'}
}

Regras:
- habitCompatibility: inclua todos os hábitos listados. Se não houver hábitos, retorne array vazio.
- Seja específico com os escores reais. Evite generalidades.
- Tom: direto, baseado em ciência, sem julgamentos negativos.
- Idioma: português brasileiro.`

  try {
    const { key, source } = await getUserApiKey('openai')
    const client     = new OpenAI({ apiKey: key })
    const completion = await client.chat.completions.create({
      model:       'gpt-4o',
      max_tokens:  2000,
      temperature: 0.4,
      messages: [
        { role: 'system', content: 'Você é um psicólogo especialista em personalidade. Responda SEMPRE com JSON válido.' },
        { role: 'user',   content: systemPrompt },
      ],
    })

    const text      = completion.choices[0]?.message?.content?.trim() ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'parse_failed', message: 'Resposta inesperada do modelo.' }, { status: 502 })
    }

    const analysis = JSON.parse(jsonMatch[0]) as BigFiveAnalysis
    return NextResponse.json(
      { analysis: { ...analysis, generatedAt: new Date().toISOString() }, keySource: source },
      { headers: { 'X-AI-Key-Source': source } },
    )
  } catch (err) {
    console.error('[bigfive-analyze] OpenAI error:', err)
    return NextResponse.json({ error: 'openai_error', message: 'Erro ao gerar análise.' }, { status: 502 })
  }
}

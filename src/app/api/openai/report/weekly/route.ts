// ─────────────────────────────────────────────
//  POST /api/openai/report/weekly
//  Relatório semanal completo via GPT-4o.
//  Rate limit: 5 req/min (relatório é caro e lento).
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { getOpenAI } from '@/lib/openai'

const rateLimitMap = new Map<string, { count: number; reset: number }>()

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  if (rateLimitMap.size > 200) {
    for (const [k, v] of rateLimitMap) {
      if (now > v.reset) rateLimitMap.delete(k)
    }
  }
  const entry = rateLimitMap.get(key)
  if (!entry || now > entry.reset) {
    rateLimitMap.set(key, { count: 1, reset: now + 60_000 })
    return true
  }
  if (entry.count >= 5) return false
  entry.count++
  return true
}

interface HabitWeekEntry {
  name: string
  sessions: number
  target: number
  progressPct: number
  totalMinutes: number
}

interface WeekData {
  week: number
  year: number
  habits: HabitWeekEntry[]
  sleep?: { avgHours?: number; debt?: number; avgWakeTime?: string }
  body?: { weight?: number; bodyFat?: number; weightGoal?: number }
  finance?: { income?: number; expenses?: number; investments?: number; investmentRate?: number }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'rate_limit', report: 'Limite atingido. Aguarde 1 minuto.' },
      { status: 429 },
    )
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { report: 'Configure OPENAI_API_KEY no servidor para gerar relatórios.' },
      { status: 503 },
    )
  }

  let weekData: WeekData
  try {
    const body = await req.json()
    weekData = body.weekData as WeekData
    if (!weekData?.habits || !Array.isArray(weekData.habits)) {
      return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const habitsText = weekData.habits.map((h) =>
    `- ${h.name}: ${h.sessions}/${h.target} sessões (${h.progressPct}%) · ${h.totalMinutes}min`
  ).join('\n')

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: `Você é um coach de alta performance que analisa dados reais. Responde em português brasileiro.
Gere um relatório semanal estruturado EXATAMENTE neste formato (com os títulos em caixa alta):

1. DIAGNÓSTICO GERAL
(2-3 frases sobre a semana como um todo)

2. DESTAQUES
(o que foi bem, com dados específicos, formato de lista)

3. ALERTAS
(o que precisa de atenção, sem drama, formato de lista)

4. FOCO DA PRÓXIMA SEMANA
(3 ações priorizadas e mensuráveis, formato de lista)

Use os números reais do usuário. Seja direto e específico.
Não use emojis em nenhuma parte da resposta.`,
        },
        {
          role: 'user',
          content: `Semana ${weekData.week} de ${weekData.year}

HÁBITOS:
${habitsText}

SONO:
- Média: ${weekData.sleep?.avgHours ?? 'não registrado'}h por noite
- Débito acumulado: ${weekData.sleep?.debt ?? 0}h
- Horário médio de acordar: ${weekData.sleep?.avgWakeTime ?? 'não registrado'}

CORPO:
- Peso: ${weekData.body?.weight ?? 'não registrado'}kg
- % Gordura: ${weekData.body?.bodyFat ?? 'não registrado'}%
- Meta peso: ${weekData.body?.weightGoal ?? 'não definida'}kg

FINANÇAS:
- Receita do mês: R$ ${weekData.finance?.income?.toLocaleString('pt-BR') ?? 0}
- Gastos: R$ ${weekData.finance?.expenses?.toLocaleString('pt-BR') ?? 0}
- Investimentos: R$ ${weekData.finance?.investments?.toLocaleString('pt-BR') ?? 0}
- Taxa de investimento: ${weekData.finance?.investmentRate ?? 0}%`,
        },
      ],
    })

    const report = (completion.choices[0]?.message?.content ?? '').trim()
    return NextResponse.json({ report })
  } catch (err) {
    console.error('[openai/report/weekly]', err)
    return NextResponse.json(
      { report: 'Erro ao gerar relatório. Tente novamente.' },
      { status: 200 },
    )
  }
}

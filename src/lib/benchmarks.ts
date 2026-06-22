// ─────────────────────────────────────────────
//  Benchmarks científicos centralizados
//  Dados de comparação pré-carregados por módulo
// ─────────────────────────────────────────────

export interface BenchmarkSet {
  national?: number
  global?: number
  recommended?: number
  top10?: number
  worst25?: number
  unit: string
  source: string
}

export const BENCHMARKS = {
  body: {
    bodyFat_male: {
      national: 25.4, global: 22.0, recommended: 15.0, top10: 12.0, worst25: 30.0,
      unit: '%', source: 'VIGITEL/MS 2023, ACSM 2023',
    } as BenchmarkSet,
    bodyFat_female: {
      national: 33.0, global: 29.0, recommended: 22.0, top10: 18.0, worst25: 38.0,
      unit: '%', source: 'VIGITEL/MS 2023, ACSM 2023',
    } as BenchmarkSet,
    bmi: {
      national: 26.8, global: 25.1, recommended: 22.0, top10: 20.0, worst25: 30.0,
      unit: 'kg/m²', source: 'IBGE PNAD 2023, WHO 2023',
    } as BenchmarkSet,
    weight_loss_rate: {
      recommended: 0.5, top10: 1.0,
      unit: 'kg/semana', source: 'ABESO 2023, NEJM 2022',
    } as BenchmarkSet,
    waist_male: {
      national: 94.0, recommended: 88.0, top10: 78.0, worst25: 102.0,
      unit: 'cm', source: 'IBGE PNAD 2023, IDF 2023',
    } as BenchmarkSet,
    waist_female: {
      national: 86.0, recommended: 80.0, top10: 70.0, worst25: 94.0,
      unit: 'cm', source: 'IBGE PNAD 2023, IDF 2023',
    } as BenchmarkSet,
  },
  sleep: {
    hoursPerNight: {
      national: 6.9, global: 7.1, recommended: 7.5, top10: 8.5, worst25: 5.5,
      unit: 'h', source: 'National Sleep Foundation 2023, ABRASSO 2022',
    } as BenchmarkSet,
    wakeConsistency: {
      recommended: 15, top10: 5, worst25: 60,
      unit: 'min variação', source: 'Chronobiology International 2022',
    } as BenchmarkSet,
  },
  finance: {
    investmentRate: {
      national: 6.3, global: 15.8, recommended: 20.0, top10: 35.0, worst25: 0.0,
      unit: '% da renda', source: 'Anbima Raio X do Investidor 2023, Banco Central',
    } as BenchmarkSet,
    emergencyMonths: {
      national: 1.2, recommended: 6.0, top10: 12.0, worst25: 0.0,
      unit: 'meses de reserva', source: 'Banco Central do Brasil 2023',
    } as BenchmarkSet,
    debtToIncome: {
      national: 48.0, recommended: 30.0, top10: 10.0,
      unit: '% comprometimento renda', source: 'Banco Central 2024',
    } as BenchmarkSet,
  },
  habits: {
    reading: {
      national: 1.8, global: 12.0, recommended: 12.0, top10: 52.0,
      unit: 'livros/ano', source: 'SNEL Pesquisa de Leitura no Brasil 2023',
    } as BenchmarkSet,
    exercise: {
      national: 1.2, global: 2.5, recommended: 3.0, top10: 5.0, worst25: 0.0,
      unit: 'sessões/semana', source: 'IBGE PNAD 2023, WHO Guidelines 2023',
    } as BenchmarkSet,
    hiit: {
      national: 0.8, recommended: 2.0, top10: 4.0,
      unit: 'sessões/semana', source: 'ACSM Fitness Trends 2024',
    } as BenchmarkSet,
    fasting: {
      national: 0.3, recommended: 1.0, top10: 5.0,
      unit: 'ciclos/ano', source: 'NEJM Fasting Research 2022',
    } as BenchmarkSet,
  },
} as const

export interface ScientificFact {
  stat: string
  source: string
  category: 'neurociencia' | 'beneficio' | 'abandono' | 'comparacao' | 'financeiro' | 'sono' | 'corpo'
  percentage: number
  module: 'habito' | 'corpo' | 'sono' | 'financas' | 'meta'
}

export const SCIENTIFIC_FACTS: Record<string, ScientificFact[]> = {
  reading: [
    { stat: '67% dos brasileiros não leram um único livro no último ano', percentage: 67, source: 'SNEL 2023', category: 'comparacao', module: 'habito' },
    { stat: 'Ler 20 min/dia aumenta vocabulário em 40% ao longo de um ano', percentage: 40, source: 'Journal of Educational Psychology 2022', category: 'beneficio', module: 'habito' },
    { stat: '6 minutos de leitura reduzem estresse em 68% — mais que ouvir música', percentage: 68, source: 'University of Sussex 2009', category: 'neurociencia', module: 'habito' },
    { stat: 'Leitores ávidos (12+ livros/ano) têm 21% menos risco de demência', percentage: 21, source: 'Neurology Journal 2021', category: 'beneficio', module: 'habito' },
  ],
  english: [
    { stat: 'Apenas 5% dos brasileiros falam inglês fluentemente', percentage: 5, source: 'British Council Brasil 2022', category: 'comparacao', module: 'habito' },
    { stat: 'Profissional bilíngue ganha em média 61% a mais no Brasil', percentage: 61, source: 'Vagas.com / Robert Half 2023', category: 'beneficio', module: 'habito' },
    { stat: 'Consistência diária (vs irregular) acelera aprendizado de idiomas em 3×', percentage: 300, source: 'Language Learning Journal 2022', category: 'neurociencia', module: 'habito' },
    { stat: '80% dos que tentam aprender inglês desistem nos primeiros 90 dias', percentage: 80, source: 'Duolingo Language Report 2023', category: 'abandono', module: 'habito' },
  ],
  hiit: [
    { stat: 'HIIT 3×/semana reduz gordura visceral em 17% em 8 semanas', percentage: 17, source: 'Journal of Obesity 2021', category: 'beneficio', module: 'habito' },
    { stat: 'Apenas 23% dos brasileiros fazem o mínimo de exercício recomendado pela OMS', percentage: 23, source: 'IBGE PNAD 2023', category: 'comparacao', module: 'habito' },
    { stat: 'Cada sessão de HIIT eleva o metabolismo por até 24h após o treino', percentage: 15, source: 'ACSM Exercise Research 2023', category: 'neurociencia', module: 'habito' },
    { stat: '67% das pessoas que começam HIIT abandonam nos primeiros 3 meses', percentage: 67, source: 'Sports Medicine Journal 2022', category: 'abandono', module: 'habito' },
  ],
  dopamine: [
    { stat: 'Detox digital por 24h aumenta foco em 42% no dia seguinte', percentage: 42, source: 'University of California 2021', category: 'neurociencia', module: 'habito' },
    { stat: 'Adulto médio passa 7h/dia em telas — equivale a 106 dias por ano', percentage: 7, source: 'DataReportal 2023', category: 'comparacao', module: 'habito' },
    { stat: 'Baixa estimulação digital por 30+ dias melhora qualidade do sono em 35%', percentage: 35, source: 'Sleep Medicine Reviews 2022', category: 'beneficio', module: 'habito' },
  ],
  ppci: [
    { stat: '92% dos projetos paralelos são abandonados antes do primeiro resultado mensurável', percentage: 92, source: 'Harvard Business School 2022', category: 'abandono', module: 'habito' },
    { stat: 'Trabalho profundo (deep work) de 4h/semana dobra produção de resultados de alta qualidade', percentage: 100, source: 'Cal Newport - Deep Work 2016', category: 'beneficio', module: 'habito' },
  ],
  fasting: [
    { stat: 'Jejum intermitente de 40 dias melhora sensibilidade à insulina em 27%', percentage: 27, source: 'New England Journal of Medicine 2022', category: 'beneficio', module: 'habito' },
    { stat: 'Apenas 3% das pessoas completam um protocolo de jejum de 40+ dias', percentage: 3, source: 'Intermittent Fasting Research Database 2023', category: 'comparacao', module: 'habito' },
  ],
  body: [
    { stat: 'Homens brasileiros têm em média 25.4% de gordura corporal', percentage: 25, source: 'VIGITEL/MS 2023', category: 'comparacao', module: 'corpo' },
    { stat: 'Cada kg de músculo queima 50-100kcal extras por dia em repouso', percentage: 75, source: 'Journal of Applied Physiology 2022', category: 'neurociencia', module: 'corpo' },
    { stat: 'Perda de 5-10% do peso reduz risco cardiovascular em 58%', percentage: 58, source: 'NEJM 2022', category: 'beneficio', module: 'corpo' },
    { stat: 'Apenas 14% dos brasileiros têm % gordura considerado saudável', percentage: 14, source: 'IBGE PNAD Saúde 2023', category: 'comparacao', module: 'corpo' },
    { stat: 'IMC brasileiro masculino médio é 26.8 — limiar do sobrepeso é 25.0', percentage: 54, source: 'IBGE 2023', category: 'comparacao', module: 'corpo' },
  ],
  sleep: [
    { stat: 'Adultos dormem em média 6h58min — abaixo dos 7-9h recomendados', percentage: 73, source: 'National Sleep Foundation 2023', category: 'comparacao', module: 'sono' },
    { stat: '1 noite com menos de 6h reduz cognição equivalente a 2 dias sem dormir', percentage: 40, source: 'University of Pennsylvania Sleep Lab', category: 'abandono', module: 'sono' },
    { stat: 'Regularizar horário de acordar aumenta qualidade do sono em 54%', percentage: 54, source: 'Chronobiology International 2022', category: 'beneficio', module: 'sono' },
    { stat: 'Débito de sono acumulado aumenta risco de obesidade em 55%', percentage: 55, source: 'Sleep Medicine Reviews 2022', category: 'abandono', module: 'sono' },
  ],
  finance: [
    { stat: 'Apenas 3% dos brasileiros investem mais de 20% da renda', percentage: 3, source: 'Anbima Raio X do Investidor 2023', category: 'comparacao', module: 'financas' },
    { stat: 'Quem investe 20%+ por 10 anos tem patrimônio 4× maior que a média', percentage: 80, source: 'Fidelity Research 2022', category: 'beneficio', module: 'financas' },
    { stat: 'Brasil tem taxa de poupança média de 6.3% — uma das mais baixas do G20', percentage: 6, source: 'Banco Central do Brasil 2023', category: 'comparacao', module: 'financas' },
    { stat: 'R$ 500/mês a 1% a.m. por 20 anos = R$ 989.000', percentage: 90, source: 'Simulação Tesouro Direto', category: 'beneficio', module: 'financas' },
  ],
  goals: [
    { stat: 'Metas escritas têm 42% mais chance de serem atingidas', percentage: 42, source: 'Dominican University of California', category: 'beneficio', module: 'meta' },
    { stat: 'Metas com deadline têm 3× mais taxa de conclusão', percentage: 67, source: 'American Psychological Association', category: 'beneficio', module: 'meta' },
    { stat: 'Revisão semanal de metas aumenta performance em 76%', percentage: 76, source: 'Harvard Business Review 2023', category: 'beneficio', module: 'meta' },
    { stat: '92% das metas de Ano Novo são abandonadas antes de fevereiro', percentage: 92, source: 'University of Scranton 2023', category: 'abandono', module: 'meta' },
  ],
}

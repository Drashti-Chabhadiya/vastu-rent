// Derives the scenario label from usageLimit + perUserLimit combination
export function getScenarioLabel(
  usageLimit?: number | null,
  perUserLimit?: number | null,
) {
  const hasGlobal = !!usageLimit
  const hasPerUser = !!perUserLimit
  if (hasGlobal && hasPerUser)
    return { label: 'First Come + Once Per User', color: 'violet' }
  if (hasGlobal)
    return { label: `First ${usageLimit} Users (FCFS)`, color: 'amber' }
  if (hasPerUser)
    return {
      label: perUserLimit === 1 ? 'Once Per User' : `${perUserLimit}× Per User`,
      color: 'rose',
    }
  return { label: 'Unlimited', color: 'emerald' }
}

export const scenarioColorMap: Record<string, string> = {
  violet: 'text-violet-700 bg-violet-50 border-violet-100',
  amber: 'text-amber-700 bg-amber-50 border-amber-100',
  rose: 'text-rose-700 bg-rose-50 border-rose-100',
  emerald: 'text-emerald-700 bg-emerald-50 border-emerald-100',
}

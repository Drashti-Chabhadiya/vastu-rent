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
  amber: 'text-warning-foreground bg-warning border-amber-100',
  rose: 'text-danger-foreground bg-danger border-danger/30',
  emerald: 'text-emerald-700 bg-emerald-50 border-emerald-100',
}

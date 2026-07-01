export type DiffConfig = {
  leftDocId: string
  rightDocId: string
}

export function pickOtherDocId(documents: { id: string }[], excludeId: string) {
  return documents.find((doc) => doc.id !== excludeId)?.id ?? excludeId
}

export function normalizeCompareConfig(
  documents: { id: string }[],
  config: DiffConfig,
): DiffConfig {
  if (documents.length < 2) return config
  if (config.leftDocId !== config.rightDocId) return config

  return {
    ...config,
    rightDocId: pickOtherDocId(documents, config.leftDocId),
  }
}

export function defaultCompareConfig(
  documents: { id: string }[],
  activeId: string,
): DiffConfig {
  const otherId = pickOtherDocId(documents, activeId)

  if (documents.length === 1) {
    return { leftDocId: activeId, rightDocId: activeId }
  }

  return normalizeCompareConfig(documents, {
    leftDocId: activeId,
    rightDocId: otherId,
  })
}

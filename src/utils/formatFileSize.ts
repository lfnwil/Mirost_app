export function formatFileSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) {
    return 'Taille inconnue'
  }

  if (size < 1024 * 1024) {
    return `${Math.ceil(size / 1024)} Ko`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} Mo`
}

export const downloadFile = (filename: string, contents: string, mimeType: string): void => {
  const url = URL.createObjectURL(new Blob([contents], { type: mimeType }))
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  anchor.click()

  URL.revokeObjectURL(url)
}

export function encodeError (msg: string) {
  return 'err_' + msg
}

export function decodeError (err: Error): string {
  if (err && err.message) {
    return err.message.startsWith('err_')
      ? browser.i18n.getMessage(err.message)
      : err.message
  }
  return ''
}

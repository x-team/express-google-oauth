// @flow

module.exports = function normalizeWhitelist (whitelist: string): Array<string> {
  return whitelist.split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

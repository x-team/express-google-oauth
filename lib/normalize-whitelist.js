module.exports = function normalizeWhitelist (whitelist) {
  return whitelist.split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

module.exports = function isEmailInWhitelist (whitelist, email) {
  return whitelist.some((item) => {
    // exact match
    if (item === email) { return true }

    // wildcard match
    const itemParts = item.split('@')
    const emailParts = email.split('@')

    return (itemParts[0] === '*' && itemParts[1] === emailParts[1])
  })
}

/**
 * Hosting provider integration layer.
 *
 * Currently stubbed — no real provider API exists yet.
 * Replace the body of each function with real SDK/API calls
 * when the integration is available.
 */

/**
 * Signs a hosting account out of the remote desktop environment.
 *
 * @param {object} account - Row from hosting_accounts
 * @returns {{ signedOutAt: string }}
 */
async function signOutHostingAccount(account) {
  // TODO: call real provider API, e.g.:
  //   await providerClient.sessions.terminate({ username: account.username });
  return { signedOutAt: new Date().toISOString() };
}

module.exports = { signOutHostingAccount };

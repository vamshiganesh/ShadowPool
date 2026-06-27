/** Accept common truthy env values: 1, true, yes (case-insensitive). */
export function isSubmitOnChainEnabled(): boolean {
  const raw = process.env.SUBMIT_ON_CHAIN?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

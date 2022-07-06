export function logUnhandledError(message: string) {
  logError(`Unhandled: ${message}`);
}

export function logError(message: string) {
  console.log(`❌  ${message}`);
}

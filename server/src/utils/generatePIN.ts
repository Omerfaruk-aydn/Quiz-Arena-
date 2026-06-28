import { GAME_PIN_LENGTH } from '@quizarena/shared';

const PIN_CHARS = '0123456789';

export function generatePIN(length: number = GAME_PIN_LENGTH): string {
  let pin = '';
  for (let i = 0; i < length; i++) {
    pin += PIN_CHARS[Math.floor(Math.random() * PIN_CHARS.length)];
  }
  return pin;
}

export async function generateUniquePIN(
  existsFn: (pin: string) => Promise<boolean>,
  maxAttempts = 20,
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const pin = generatePIN();
    const exists = await existsFn(pin);
    if (!exists) return pin;
  }
  throw new Error('Benzersiz PIN üretilemedi');
}

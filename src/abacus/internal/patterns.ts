/**
 * ABACUS dahili kalıp modülü (yaprak modül — hiçbir motoru import etmez).
 *
 * Amaç: Aynı kalıbın iki motorda ayrı ayrı tanımlanmasını (SSOT ihlali) ve
 * motorlar arası dairesel import'u önlemek. `validate.email` ile
 * `text.email` bu tek kaynağı kullanır.
 *
 * Bu klasör dışa açık API değildir; barrel üzerinden export edilmez.
 */

/** E-posta biçim kalıbı (user@domain.tld). Tek doğruluk kaynağı. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** E-posta biçim denetimi. Boş/geçersiz girdide false. */
export function isEmailShaped(s: string): boolean {
  if (!s) return false;
  return EMAIL_PATTERN.test(s.trim());
}

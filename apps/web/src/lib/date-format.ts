import { format as dateFnsFormat } from 'date-fns'
import type { Locale } from 'date-fns'
import { enUS, uk } from 'date-fns/locale'
import i18n from '../i18n'

const locales: Record<string, Locale | undefined> = {
  en: enUS,
  uk: uk,
}

export function formatDate(
  date: Date | number | string,
  formatStr: string,
): string {
  const currentLang = i18n.language || 'en'
  // Support variants like 'en-US' by taking the prefix
  const langKey = currentLang.split('-')[0]
  const locale = locales[langKey] ?? enUS

  let finalFormatStr = formatStr
  if (langKey === 'uk') {
    if (finalFormatStr === 'MM/dd/yyyy' || finalFormatStr === 'yyyy-MM-dd') {
      finalFormatStr = 'dd.MM.yyyy'
    } else if (finalFormatStr === 'LLL d, yyyy') {
      finalFormatStr = 'd LLL yyyy'
    }
  }

  // Ensure invalid dates do not crash
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return String(date)

  return dateFnsFormat(dateObj, finalFormatStr, { locale })
}

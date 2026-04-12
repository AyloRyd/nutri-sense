import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  // i18next language detector returns cases like en-US, we just want to match the prefix,
  // but let's use the explicit value 'en' or 'uk' to render.
  const currentLang = i18n.language.startsWith('uk') ? 'uk' : 'en'

  const handleLanguageChange = (value: string | null) => {
    if (value) i18n.changeLanguage(value)
  }

  return (
    <Select value={currentLang} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[80px] h-10 brutal-border rounded-none bg-black text-white font-mono uppercase text-xs focus:ring-primary focus:border-primary">
        <SelectValue placeholder="Lang" />
      </SelectTrigger>
      <SelectContent className="brutal-border bg-black text-white rounded-none border-2 border-white">
        <SelectItem
          value="en"
          className="font-mono uppercase text-xs focus:bg-primary focus:text-black rounded-none"
        >
          EN
        </SelectItem>
        <SelectItem
          value="uk"
          className="font-mono uppercase text-xs focus:bg-primary focus:text-black rounded-none"
        >
          UK
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

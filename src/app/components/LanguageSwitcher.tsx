import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Languages, Check } from 'lucide-react';
import { languageLabels, type Language, useI18n } from '../i18n';

export const LanguageSwitcher: React.FC<{ mobile?: boolean; onSelect?: () => void }> = ({
  mobile = false,
  onSelect,
}) => {
  const { language, setLanguage, t } = useI18n();
  const languages = Object.entries(languageLabels) as Array<[Language, string]>;

  if (mobile) {
    return (
      <div className="rounded-lg border border-border/70 bg-background/50 p-2">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground">
          <Languages className="h-3.5 w-3.5 text-purple-500" />
          {t('common.language')}
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {languages.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setLanguage(value);
                onSelect?.();
              }}
              className={`rounded-md border px-2 py-1.5 text-xs font-semibold transition-colors ${
                language === value
                  ? 'border-purple-500 bg-purple-600 text-white'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border/80 px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          aria-label={t('common.language')}
          title={t('common.language')}
        >
          <Languages className="h-4 w-4 text-purple-500" />
          <span>{languageLabels[language]}</span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="min-w-[160px] rounded-xl border border-border bg-popover p-2 shadow-[0_20px_40px_rgba(35,31,54,0.14)]"
        >
          {languages.map(([value, label]) => (
            <DropdownMenu.Item
              key={value}
              onSelect={() => {
                setLanguage(value);
                onSelect?.();
              }}
              className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground"
            >
              <span>{label}</span>
              {language === value ? <Check className="h-4 w-4 text-purple-500" /> : null}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

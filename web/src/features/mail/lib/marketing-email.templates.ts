import { getAppHomeUrl } from './email-layout';
import { getGenericEmailHtml } from './generic-email.templates';

type MarketingEmailTemplateParams = {
  eyebrow?: string | null;
  title: string;
  intro?: string | null;
  content: string;
  note?: string | null;
  imageUrl?: string | null;
  links?: string[];
};

export function getMarketingEmailHtml({
  eyebrow,
  title,
  intro,
  content,
  note,
  imageUrl,
  links,
}: MarketingEmailTemplateParams) {
  return getGenericEmailHtml({
    eyebrow: eyebrow ?? null,
    title,
    intro: intro ?? '',
    content,
    note,
    imageUrl,
    links,
    showAction: false,
    footerText:
      "Actualités et informations\n\nSi vous souhaitez ne plus recevoir d'emails commerciaux de notre part, vous pouvez modifier vos préférences en vous connectant à votre compte.",
    footerUrl: getAppHomeUrl(),
  });
}

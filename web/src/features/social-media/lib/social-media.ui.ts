import type { IconType } from 'react-icons';
import type { SocialMediaType } from '@prisma/client';
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaTiktok,
  FaSnapchat,
  FaWhatsapp,
  FaDiscord,
} from 'react-icons/fa';

export type TSocialMediaUI = {
  label: string;
  Icon: IconType;
};

export const SOCIAL_MEDIA_UI: Record<SocialMediaType, TSocialMediaUI> = {
  FACEBOOK: { label: 'Facebook', Icon: FaFacebook },
  INSTAGRAM: { label: 'Instagram', Icon: FaInstagram },
  TWITTER: { label: 'Twitter', Icon: FaTwitter },
  TIKTOK: { label: 'TikTok', Icon: FaTiktok },
  SNAPCHAT: { label: 'Snapchat', Icon: FaSnapchat },
  WHATSAPP: { label: 'WhatsApp', Icon: FaWhatsapp },
  DISCORD: { label: 'Discord', Icon: FaDiscord },
};

export function getSocialMediaUI(
  socialMediaType: SocialMediaType,
): TSocialMediaUI {
  return SOCIAL_MEDIA_UI[socialMediaType];
}

import { LinkWithIcon } from '@/components/custom-ui/link-with-icon';
import type { SocialMedia } from '../lib/social-media.types';
import { SOCIAL_MEDIA_UI } from '../lib/social-media.ui';
import { EditSocialMediasAdminButton } from './edit-social-medias-admin-button';

type Props = {
  socialMedias: SocialMedia[];
};

export function SocialMediaList({ socialMedias }: Props) {
  const mediasToDisplay = socialMedias
    .filter((social) => social.url?.trim() && SOCIAL_MEDIA_UI[social.id])
    .map((social) => ({
      Icon: SOCIAL_MEDIA_UI[social.id].Icon,
      label: SOCIAL_MEDIA_UI[social.id].label,
      name: social.name,
      url: social.url!,
    }));

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm">
      {mediasToDisplay.map((social, index) => (
        <LinkWithIcon
          key={index}
          Icon={social.Icon}
          text={social.name}
          href={social.url}
        />
      ))}
      <EditSocialMediasAdminButton socialMedias={socialMedias} />
    </div>
  );
}

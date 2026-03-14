'use client';

import { FC, ImgHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/utils';

import './styles/avatar.css';

export enum AvatarSize {
  XS = 'xs',
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  XL = 'xl',
}

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string | null;
  alt: string;
  size?: AvatarSize;
  fallback?: string;
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
};

export const Avatar: FC<Props> = ({
  src,
  alt,
  size = AvatarSize.MD,
  fallback,
  className,
  ...props
}) => {
  const displayFallback = fallback || getInitials(alt) || '?';

  return (
    <div className={cn('avatar', `avatar--${size}`, className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="avatar__image"
          loading="lazy"
          {...props}
        />
      ) : (
        <span className="avatar__fallback" aria-label={alt}>
          {displayFallback}
        </span>
      )}
    </div>
  );
};

const avatarSizeClassMap: Record<AvatarSize, string> = {
  [AvatarSize.XS]: 'w-6 h-6 text-xs',
  [AvatarSize.SM]: 'w-8 h-8 text-sm',
  [AvatarSize.MD]: 'w-10 h-10 text-base',
  [AvatarSize.LG]: 'w-12 h-12 text-lg',
  [AvatarSize.XL]: 'w-16 h-16 text-2xl',
};

type AvatarGroupProps = {
  avatars: Array<{ src?: string | null; alt: string }>;
  max?: number;
  size?: AvatarSize;
  className?: string;
};

export const AvatarGroup: FC<AvatarGroupProps> = ({
  avatars,
  max = 5,
  size = AvatarSize.MD,
  className,
}) => {
  const displayAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={cn('avatar-group', className)}>
      {displayAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          alt={avatar.alt}
          size={size}
          className="ring-2 ring-neutral-900"
        />
      ))}
      {remaining > 0 && (
        <div className={cn('avatar-group__overflow', avatarSizeClassMap[size])}>
          +{remaining}
        </div>
      )}
    </div>
  );
};

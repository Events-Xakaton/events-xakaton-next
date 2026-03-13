/**
 * Avatar Component
 *
 * User profile images with fallback initials.
 * Accessible with proper alt text.
 */

import { ImgHTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/lib/utils";

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  alt: string; // Required for accessibility
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fallback?: string; // Initials or single letter
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, size = "md", fallback, className, ...props }, ref) => {
    const sizeClasses = {
      xs: "w-6 h-6 text-xs", // 24px
      sm: "w-8 h-8 text-sm", // 32px
      md: "w-10 h-10 text-base", // 40px
      lg: "w-12 h-12 text-lg", // 48px
      xl: "w-16 h-16 text-2xl", // 64px
    };

    const baseClasses = `
      relative inline-flex items-center justify-center
      rounded-full overflow-hidden
      bg-gradient-to-br from-primary-500 to-primary-700
      text-white font-semibold
      border-2 border-white/10
    `;

    // Generate initials from alt text if no fallback provided
    const getInitials = (name: string): string => {
      return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? "")
        .join("");
    };

    const displayFallback = fallback || getInitials(alt) || "?";

    return (
      <div ref={ref} className={cn(baseClasses, sizeClasses[size], className)}>
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            loading="lazy"
            {...props}
          />
        ) : (
          <span aria-label={alt}>{displayFallback}</span>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

/**
 * AvatarGroup - Stack of avatars
 */
export interface AvatarGroupProps {
  avatars: Array<{ src?: string | null; alt: string }>;
  max?: number;
  size?: AvatarProps["size"];
  className?: string;
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ avatars, max = 5, size = "md", className }, ref) => {
    const displayAvatars = avatars.slice(0, max);
    const remaining = avatars.length - max;

    return (
      <div ref={ref} className={cn("flex items-center -space-x-2", className)}>
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
          <div
            className={cn(
              "inline-flex items-center justify-center rounded-full bg-neutral-800 border-2 border-neutral-700 text-neutral-300 font-medium ring-2 ring-neutral-900",
              size === "xs" && "w-6 h-6 text-xs",
              size === "sm" && "w-8 h-8 text-sm",
              size === "md" && "w-10 h-10 text-base",
              size === "lg" && "w-12 h-12 text-lg",
              size === "xl" && "w-16 h-16 text-2xl"
            )}
          >
            +{remaining}
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = "AvatarGroup";

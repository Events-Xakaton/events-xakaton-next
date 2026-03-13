/**
 * Card Component
 *
 * Flexible card container with consistent styling.
 * Mobile-first with responsive padding.
 */

import { HTMLAttributes, ReactNode, forwardRef } from "react";
import { cn } from "@/shared/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined" | "ghost";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  children: ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { variant = "default", padding = "md", hover = false, children, className, ...props },
    ref
  ) => {
    const baseClasses = `
      rounded-xl
      transition-all duration-200
    `;

    const variantClasses = {
      default: `
        bg-neutral-900/80 backdrop-blur-sm
        border border-white/10
        shadow-lg shadow-black/20
      `,
      elevated: `
        bg-neutral-900
        border border-white/10
        shadow-2xl shadow-black/30
      `,
      outlined: `
        bg-transparent
        border border-neutral-700
      `,
      ghost: `
        bg-transparent
        border-none
      `,
    };

    const paddingClasses = {
      none: "",
      sm: "p-3 sm:p-4",
      md: "p-4 sm:p-5 md:p-6",
      lg: "p-5 sm:p-6 md:p-8",
    };

    const hoverClasses = hover
      ? "hover:scale-[1.02] hover:shadow-xl hover:shadow-black/30"
      : "";

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          paddingClasses[padding],
          hoverClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

/**
 * CardHeader - Semantic card section
 */
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("mb-4", className)} {...props}>
        {children}
      </div>
    );
  }
);

CardHeader.displayName = "CardHeader";

/**
 * CardTitle - Semantic heading
 */
export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  children: ReactNode;
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ as: Component = "h3", children, className, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn("text-xl font-semibold text-white", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

CardTitle.displayName = "CardTitle";

/**
 * CardDescription - Secondary text
 */
export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <p ref={ref} className={cn("text-sm text-neutral-400", className)} {...props}>
        {children}
      </p>
    );
  }
);

CardDescription.displayName = "CardDescription";

/**
 * CardContent - Main content area
 */
export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(className)} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = "CardContent";

/**
 * CardFooter - Actions area
 */
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("mt-4 flex items-center gap-2", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = "CardFooter";

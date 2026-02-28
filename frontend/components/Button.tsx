import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50',
                    {
                        'bg-accent text-white hover:bg-black': variant === 'primary',
                        'bg-primary text-black hover:bg-primary/80': variant === 'secondary',
                        'border-2 border-border bg-transparent hover:bg-primary': variant === 'outline',
                        'hover:bg-primary hover:text-accent': variant === 'ghost',
                        'h-9 px-4 text-sm': size === 'sm',
                        'h-12 px-8 text-base': size === 'md',
                        'h-14 px-10 text-lg': size === 'lg',
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button };

import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    // Extract any extra className that Radix Slot may inject via props
    const { className: extraClassName, ...restProps } = props as any;
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(className, extraClassName, isActive && activeClassName, isPending && pendingClassName)
        }
        {...restProps}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };

"use client";

import { ChevronDownIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface SmoothDropdownItem {
  id: string;
  label: string;
}

interface SmoothDropdownProps {
  items: SmoothDropdownItem[];
  value: string;
  onChange: (value: string) => void;
  footerAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const easeOutQuint: [number, number, number, number] = [0.23, 1, 0.32, 1];

export function SmoothDropdown({
  items,
  value,
  onChange,
  footerAction,
  className,
}: SmoothDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedItem = items.find((item) => item.id === value) ?? items[0];

  useEffect(() => {
    if (!items.some((item) => item.id === value) && items[0]) {
      onChange(items[0].id);
    }
  }, [items, onChange, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={cn("relative z-50 h-9 w-[220px]", className)}
    >
      <motion.div
        layout
        initial={false}
        animate={{
          maxHeight: isOpen ? 360 : 36,
          borderRadius: isOpen ? 12 : 8,
        }}
        transition={{
          type: "spring",
          damping: 34,
          stiffness: 380,
          mass: 0.8,
        }}
        className="absolute inset-x-0 top-0 z-50 overflow-hidden border border-gray-200 bg-white text-gray-700 shadow-sm"
      >
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex h-9 w-full items-center justify-between px-3 text-left text-sm"
        >
          <span className="truncate">{selectedItem?.label ?? ""}</span>
          <ChevronDownIcon
            className={cn(
              "size-4 text-gray-500 transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </button>

        <motion.ul
          initial={false}
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.2, delay: isOpen ? 0.05 : 0 }}
          className="max-h-[300px] list-none space-y-1 overflow-y-auto px-2 pb-2 pr-1"
          style={{ pointerEvents: isOpen ? "auto" : "none" }}
        >
            {items.map((item, index) => {
              const isActive = item.id === value;
              const showIndicator = hoveredItem
                ? hoveredItem === item.id
                : isActive;

              return (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{
                    opacity: isOpen ? 1 : 0,
                    x: isOpen ? 0 : 8,
                  }}
                  transition={{
                    delay: isOpen ? 0.03 + index * 0.02 : 0,
                    duration: 0.15,
                    ease: easeOutQuint,
                  }}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => {
                    onChange(item.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "relative cursor-pointer rounded-md px-3 py-2 text-sm transition-colors",
                    isActive ? "text-gray-900" : "text-gray-600",
                  )}
                >
                  {showIndicator && (
                    <motion.div
                      layoutId="smooth-dropdown-active"
                      className="absolute inset-0 rounded-md bg-gray-100"
                      transition={{
                        type: "spring",
                        damping: 30,
                        stiffness: 520,
                        mass: 0.8,
                      }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </motion.li>
              );
            })}

            {footerAction && (
              <>
                <li className="mt-1 border-t border-gray-200" />
                <motion.li
                  key="smooth-dropdown-footer-action"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{
                    opacity: isOpen ? 1 : 0,
                    x: isOpen ? 0 : 8,
                  }}
                  transition={{
                    delay: isOpen ? 0.03 + items.length * 0.02 : 0,
                    duration: 0.15,
                    ease: easeOutQuint,
                  }}
                  onMouseEnter={() => setHoveredItem("__footer__")}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => {
                    footerAction.onClick();
                    setIsOpen(false);
                  }}
                  className="relative cursor-pointer rounded-md px-3 py-2 text-sm text-gray-600 transition-colors hover:text-green-700"
                >
                  {hoveredItem === "__footer__" && (
                    <motion.div
                      layoutId="smooth-dropdown-active"
                      className="absolute inset-0 rounded-md bg-green-50"
                      transition={{
                        type: "spring",
                        damping: 30,
                        stiffness: 520,
                        mass: 0.8,
                      }}
                    />
                  )}
                  <span className="relative z-10">{footerAction.label}</span>
                </motion.li>
              </>
            )}
        </motion.ul>
      </motion.div>
    </div>
  );
}

export default SmoothDropdown;

"use client";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { RemoteFontAwesomeIcon } from "@fern-docs/components";
import { AnimatePresence, motion } from "framer-motion";
import { useAtomValue, useSetAtom } from "jotai";
import { ChevronDown, Package } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  CURRENT_PRODUCT_ID_ATOM,
  PRODUCTS_ATOM,
  VERSIONS_ATOM,
} from "../atoms/navigation";
import { FernLink } from "../components/FernLink";
import { useToHref } from "../hooks/useHref";
import { VersionDropdown } from "./VersionDropdown";

export declare namespace ProductDropdown {
  export interface Props {}
}

const menuVariants = {
  hidden: {
    opacity: 0,
    y: -15,
    scale: 0.95,
    transition: { duration: 0.15, ease: "easeOut" },
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.98,
    transition: { duration: 0.1, ease: "easeIn" },
  },
};

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.035,
      delayChildren: 0.03,
    },
  },
  exit: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: 5,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

export const ProductDropdown: React.FC<ProductDropdown.Props> = () => {
  const products = useAtomValue(PRODUCTS_ATOM);
  const versions = useAtomValue(VERSIONS_ATOM);
  const currentProductId = useAtomValue(CURRENT_PRODUCT_ID_ATOM);
  const setCurrentProductId = useSetAtom(CURRENT_PRODUCT_ID_ATOM);
  const toHref = useToHref();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (products.length <= 1) {
    return null;
  }

  const currentProduct = products.find(
    ({ productId }) => productId === currentProductId
  );

  const gridCols =
    products.length <= 2
      ? "md:grid-cols-2"
      : products.length <= 3
        ? "md:grid-cols-3"
        : "md:grid-cols-3 xl:grid-cols-4";

  return (
    <div className="relative" id="fern-product-dropdown">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:text-accent group flex items-center gap-1 transition-all"
        ref={buttonRef}
      >
        <div className="text-foreground font-small">
          {currentProduct?.title ?? currentProductId}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <ChevronDown className="text-muted size-4" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* 
            Header blur effect if desired:
            <motion.div
              className="bg-background/5 fixed inset-0 z-40 backdrop-blur-[1px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            /> */}
            <motion.div
              className="fixed inset-x-4 z-50 mt-2 origin-top xl:absolute xl:inset-x-auto"
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div
                className="border-border bg-background w-[min(calc(100vw-2rem),1000px)] rounded-xl border p-6 shadow-lg"
                ref={menuRef}
              >
                <motion.div
                  className={`grid grid-cols-1 gap-4 ${gridCols}`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {products.map(
                    ({
                      productId,
                      title,
                      subtitle,
                      slug,
                      pointsTo,
                      hidden,
                      icon,
                    }) => (
                      <FernLink
                        key={productId}
                        href={toHref(pointsTo ?? slug)}
                        onClick={() => {
                          setCurrentProductId(
                            productId as FernNavigation.ProductId
                          );
                          setIsOpen(false);
                        }}
                        className="group block h-full"
                      >
                        <motion.div
                          variants={itemVariants}
                          className={`border-border/50 group-hover:border-accent/30 group-hover:bg-background-secondary/50 flex h-full cursor-pointer items-center gap-4 rounded-lg border bg-white/50 p-4 transition-all ${currentProductId === productId ? "border-accent bg-accent/5" : ""} ${hidden ? "opacity-50" : ""}`}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="bg-background-tertiary/50 group-hover:bg-background-tertiary flex size-12 shrink-0 items-center justify-center rounded-lg transition-colors">
                            <ProductIcon icon={icon} isLarge />
                          </div>
                          <div className="flex flex-1 flex-col justify-center gap-1">
                            <span className="text-foreground font-medium leading-snug">
                              {title}
                            </span>
                            {subtitle && (
                              <span className="text-muted text-sm/tight">
                                {subtitle}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      </FernLink>
                    )
                  )}
                </motion.div>
                {versions.length > 1 && (
                  <div className="border-border/50 mt-4 border-t pt-4 md:hidden">
                    <div className="text-muted mb-2 text-sm font-medium">
                      Version
                    </div>
                    <div className="max-w-full">
                      <VersionDropdown />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProductIcon = ({
  icon,
  isLarge,
}: {
  icon?: string;
  isLarge?: boolean;
}) => {
  const className = `text-accent transition-colors group-hover:text-accent-hover ${isLarge ? "size-6" : "size-4"}`;

  if (icon) {
    return (
      <RemoteFontAwesomeIcon
        className={className}
        icon={icon.replace(/^fa-(?:brands|regular|solid)-/, "")}
      />
    );
  }

  return <Package className={className} />;
};

import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { RemoteFontAwesomeIcon } from "@fern-docs/components";
import { AnimatePresence, motion } from "framer-motion";
import { useAtomValue, useSetAtom } from "jotai";
import { ChevronDown, Package } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CURRENT_PRODUCT_ID_ATOM, PRODUCTS_ATOM } from "../atoms/navigation";
import { FernLink } from "../components/FernLink";
import { useToHref } from "../hooks/useHref";

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
  const currentProductId = useAtomValue(CURRENT_PRODUCT_ID_ATOM);
  const setCurrentProductId = useSetAtom(CURRENT_PRODUCT_ID_ATOM);
  const toHref = useToHref();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
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
    <div className="relative">
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="border-border/50 bg-background-secondary/50 hover:border-accent/30 hover:bg-background-secondary group flex items-center gap-2 rounded-lg border px-3 py-2 transition-all"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-2">
          <div className="bg-background-tertiary/50 group-hover:bg-background-tertiary flex size-8 shrink-0 items-center justify-center rounded-md transition-colors">
            <ProductIcon icon={currentProduct?.icon} />
          </div>
          <span className="text-foreground font-medium">
            {currentProduct?.title ?? currentProductId}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <ChevronDown className="text-muted size-4" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="bg-background/5 fixed inset-0 z-40 backdrop-blur-[1px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="absolute inset-x-0 z-50 mt-2 origin-top"
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="border-border bg-background w-[1000px] max-w-[calc(100vw-2rem)] rounded-xl border p-6 shadow-lg">
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
                      >
                        <motion.div
                          variants={itemVariants}
                          className={`border-border/50 group flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-all ${currentProductId === productId ? "border-accent bg-accent/5" : "hover:border-accent/30 hover:bg-background-secondary/50"} ${hidden ? "opacity-50" : ""} `}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="bg-background-tertiary/50 group-hover:bg-background-tertiary flex size-12 shrink-0 items-center justify-center rounded-lg transition-colors">
                            <ProductIcon icon={icon} isLarge />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-foreground font-medium">
                              {title}
                            </span>
                            {subtitle && (
                              <span className="text-muted text-sm">
                                {subtitle}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      </FernLink>
                    )
                  )}
                </motion.div>
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

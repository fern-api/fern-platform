import { Transition } from "@headlessui/react";
import clsx from "clsx";
import { motion } from "framer-motion";
import React, { useCallback, useEffect, useState } from "react";
import { Link, ThumbsDown, ThumbsUp } from "react-feather";
import { usePopper } from "react-popper";
import { capturePosthogEvent } from "../analytics/posthog";
import { FernButton, FernButtonGroup } from "../components/FernButton";
import { FernTextarea } from "../components/FernTextarea";

export const FeedbackPopover: React.FC = () => {
  const [isHelpful, setIsHelpful] = useState<boolean>();
  const [showMenu, setShowMenu] = useState(false);
  const [referenceElement, setReferenceElement] = useState<any>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "top",
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 8],
        },
      },
    ],
  });

  const handleThumbsUp = useCallback(() => {
    setIsHelpful(true);
    capturePosthogEvent("feedback_voted", {
      satisfied: true,
    });
  }, []);

  const handleThumbsDown = useCallback(() => {
    setIsHelpful(false);
    capturePosthogEvent("feedback_voted", {
      satisfied: false,
    });
  }, []);

  const handleCreateHighlightLink = async () => {
    const selection = window.getSelection();
    if (selection?.toString().trim()) {
      const selectedText = selection.toString();
      const encodedText = encodeURIComponent(selectedText);

      // This is a cleanup incase there are already anchors in the URL
      const currentURL = window.location.href.split("#")[0];

      const highlightLink = `${currentURL}#:~:text=${encodedText}`;

      await navigator.clipboard.writeText(highlightLink);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 1500); // Change the duration (in milliseconds) as needed
    }
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection?.toString().trim()) {
        const range = selection.getRangeAt(0);
        const selectionRect = range.getBoundingClientRect();

        const virtualReference = {
          getBoundingClientRect: () => selectionRect,
        };

        setReferenceElement(virtualReference);
        setShowMenu(true);
      } else {
        setShowMenu(false);
        setReferenceElement(null);
        // Clear feedback states when text selection is removed
        setIsHelpful(undefined);
        setCopied(false);
      }
    };

    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#:~:text=")) {
        const encodedText = hash.slice("#:~:text=".length);
        const decodedText = decodeURIComponent(encodedText);

        const textNode = findTextNode(document.body, decodedText);
        if (textNode) {
          const range = document.createRange();
          range.selectNodeContents(textNode);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
          textNode.parentElement?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    window.addEventListener("hashchange", handleHashChange);

    // Check for the highlight hash on initial load
    handleHashChange();

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const findTextNode = (node: Node, text: string): Node | null => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.includes(text)) {
      return node;
    }

    for (let i = 0; i < node.childNodes.length; i++) {
      const foundNode = findTextNode(node.childNodes[i], text);
      if (foundNode) {
        return foundNode;
      }
    }

    return null;
  };

  return (
    <Transition
      show={showMenu}
      as={React.Fragment}
      enter="transition-all origin-bottom-right"
      enterFrom="opacity-0 scale-90"
      enterTo="opacity-100 scale-100"
      leave="transition-all"
      leaveFrom="opacity-100 scale-100 translate-y-0"
      leaveTo="opacity-0 -translate-y-8"
    >
      <motion.div
        ref={setPopperElement}
        style={styles.popper}
        {...attributes.popper}
        className="fixed z-50 rounded-lg border border-default bg-white/50 backdrop-blur-xl dark:bg-background/50 p-1 shadow-xl"
      >
        <FernButtonGroup>
          <FernButton
            icon={<ThumbsUp className={clsx("opacity-60", { "animate-thumb-rock": isHelpful })} />}
            variant="minimal"
            intent={isHelpful ? "success" : "none"}
            active={isHelpful}
            onClick={handleThumbsUp}
          >
            Helpful
          </FernButton>
          <FernButton
            icon={<ThumbsDown className={clsx("opacity-60", { "animate-thumb-rock": isHelpful === false })} />}
            variant="minimal"
            intent={isHelpful === false ? "danger" : "none"}
            active={isHelpful === false}
            onClick={handleThumbsDown}
          >
            Not Helpful
          </FernButton>
          <div className="w-px h-8 mx-1 bg-border-default" />
          <FernButton
            icon={<Link className="opacity-60" />}
            variant="minimal"
            onClick={handleCreateHighlightLink}
          >
            {copied ? "Copied!" : "Copy highlight"}
          </FernButton>
        </FernButtonGroup>
        {
          isHelpful !== undefined && (
            <>
              <label htmlFor="more-feedback" className="block mt-2">{isHelpful ? "What did you like?" : "What went wrong?"}</label>
              <FernTextarea id="more-feedback" />
            </>
          )
        }
      </motion.div>
    </Transition>
  );
};
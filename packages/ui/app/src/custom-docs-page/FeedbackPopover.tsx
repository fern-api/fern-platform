import { Transition } from "@headlessui/react";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { Link, ThumbsDown, ThumbsUp } from "react-feather";
import { usePopper } from "react-popper";
import { FernButton, FernButtonGroup } from "../components/FernButton";

export const FeedbackPopover: React.FC = () => {
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
      <div
        ref={setPopperElement}
        style={styles.popper}
        {...attributes.popper}
        className={clsx(
          "fixed z-50 rounded-lg border border-gray-200 bg-white/50 backdrop-blur-xl dark:bg-background/50 p-1 shadow-xl",
        )}
      >
        <FernButtonGroup>
          <FernButton
            icon={<ThumbsUp className="opacity-60" />}
            variant="minimal"
          // active={thumbsUpClicked}
          // onClick={handleThumbsUp}
          // className={thumbsUpClicked ? 'animate-thumbs-up' : ''}
          >
            Helpful
          </FernButton>
          <FernButton

            variant="minimal"
          // intent={feedback === "yes" ? "success" : "none"}
          // onClick={handleYes}
          // active={feedback === "yes"}
          >
            Helpful
          </FernButton>
          <FernButton
            icon={<ThumbsDown className="opacity-60" />}
            variant="minimal"
          // intent={feedback === "no" ? "danger" : "none"}
          // onClick={handleNo}
          // active={feedback === "no"}
          >
            Not helpful
          </FernButton>
          <div className="w-px h-8 mx-1 bg-gray-200" />
          <FernButton
            icon={<Link className="opacity-60" />}
            variant="minimal"
            // intent={feedback === "no" ? "danger" : "none"}
            onClick={handleCreateHighlightLink}
          // active={feedback === "no"}
          >
            {copied ? "Copied!" : "Copy highlight"}
          </FernButton>
        </FernButtonGroup>
      </div>
    </Transition>
  );
};
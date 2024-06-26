const SCRIPT = `
// customize
const inkeepSettings = {
  baseSettings: {
    apiKey: "12635516a4a692e13659290691ac8fef0d88d853a4e88c87",
    integrationId: "clxw4fiuw002h3tglgbz0eivj",
    organizationId: "org_uAO57LhANfNm628d",
    primaryBrandColor: "#FFDCDC",
  },
  aiChatSettings: {
    chatSubjectName: "Hume AI",
    botAvatarSrcUrl:
      "https://storage.googleapis.com/organization-image-assets/humeai-botAvatarSrcUrl-1717460311269.svg",
    getHelpCallToActions: [
      {
        name: "Contact Us",
        url: "mailto:hello@hume.ai",
        icon: {
          builtIn: "IoChatbubblesOutline",
        },
      },
      {
        name: "Discord",
        url: "https://link.hume.ai/discord",
        icon: {
          builtIn: "FaDiscord",
        },
      },
    ],
    quickQuestions: [
      "How do I create a custom model using the API?",
      "What's the difference between regression and classification models?",
      "Can I process audio files in languages other than English?",
    ],
  },
  modalSettings: {
    isShortcutKeyEnabled: false, // disable default cmd+k behavior
    // ...optional settings
  },
};

// The Fern search triggers, which we'll reuse to trigger the Inkeep modal
const searchButtonContainerIds = [
  "fern-search-bar",
];

// Clone and replace the search triggers, needed to remove existing event listeners
const clonedSearchButtonContainers = searchButtonContainerIds.map((id) => {
  const originalElement = document.getElementById(id);
  const clonedElement = originalElement.cloneNode(true);
  originalElement.parentNode.replaceChild(clonedElement, originalElement);

  return clonedElement;
});

// Load the Inkeep component library
const inkeepScript = document.createElement("script");
inkeepScript.type = "module";
inkeepScript.src =
  "https://unpkg.com/@inkeep/widgets-embed@latest/dist/embed.js";
document.body.appendChild(inkeepScript);

// Once the Inkeep library is loaded, instantiate the UI components
inkeepScript.addEventListener("load", function () {
  // Customization settings

  // for syncing with dark mode
  const colorModeSettings = {
    observedElement: document.documentElement,
    isDarkModeCallback: (el) => {
      return el.classList.contains("dark");
    },
    colorModeAttribute: "class",
  };

  // Instantiate the "Ask AI" pill chat button
  Inkeep().embed({
    componentType: "ChatButton",
    colorModeSync: colorModeSettings,
    properties: inkeepSettings,
  });

  // Instantiate the search bar modal
  const inkeepSearchModal = Inkeep({
    ...inkeepSettings.baseSettings,
  }).embed({
    componentType: "CustomTrigger",
    colorModeSync: colorModeSettings,
    properties: {
      ...inkeepSettings,
      isOpen: false,
      onClose: () => {
        inkeepSearchModal.render({
          isOpen: false,
        });
      },
    },
  });

  // When the Fern search bar elements are clicked, open the Inkeep search modal
  clonedSearchButtonContainers.forEach((trigger) => {
    trigger.addEventListener("click", function () {
      inkeepSearchModal.render({
        isOpen: true,
      });
    });
  });

  // Open the Inkeep Modal with cmd+k
  window.addEventListener(
    "keydown",
    (event) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        (event.key === "k" || event.key === "K")
      ) {
        event.stopPropagation();
        inkeepSearchModal.render({ isOpen: true });
        return false;
      }
    },
    true
  );
});
`;

export function getHumeScript(): string {
    return SCRIPT;
}

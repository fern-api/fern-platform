import { CaretDownIcon } from "@radix-ui/react-icons";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FernButton } from "./FernButton";
import { FernDropdown } from "./FernDropdown";

const meta: Meta<typeof FernDropdown> = {
  title: "General/FernDropdown",
  component: FernDropdown,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    defaultOpen: true,
    usePortal: true,
    children: <FernButton
      text={<span className="t-muted">Select an enum...</span>}
      variant="outlined"
      rightIcon={<CaretDownIcon />}
      className="w-full text-left"
    />,
    options: [
      {
        type: "value",
        label: "Option 1",
        value: "option1",
        helperText: "This is a helper text",
      },
      {
        type: "value",
        label: "Option 2",
        value: "option2",
        helperText: "This is a helper text",
      },
      {
        type: "separator",
      },
      {
        type: "value",
        label: "Option 3",
        value: "option3",
        helperText: "This is a helper text",
      },
      {
        type: "value",
        label: "Option 4",
        value: "option4",
        helperText: "This is a helper text",
      }
    ]
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultOpen: true,
  },
  render: (args) => {
    const [value, setValue] = useState<string>();
    return (<FernDropdown value={value} onValueChange={setValue} {...args} />);
  },
};


export const RealWorldExample: Story = {
  args: {
    options: [
      {
        "type": "value",
        "value": "mp3_22050_32",
        "label": "mp3_22050_32",
        "helperText": "Output format, mp3 with 22.05kHz sample rate at 32kbps"
      },
      {
        "type": "value",
        "value": "mp3_44100_128",
        "label": "mp3_44100_128",
        "helperText": "Default output format, mp3 with 44.1kHz sample rate at 128kbps"
      },
      {
        "type": "value",
        "value": "mp3_44100_192",
        "label": "mp3_44100_192",
        "helperText": "Output format, mp3 with 44.1kHz sample rate at 192kbps."
      },
      {
        "type": "value",
        "value": "mp3_44100_32",
        "label": "mp3_44100_32",
        "helperText": "Output format, mp3 with 44.1kHz sample rate at 32kbps"
      },
      {
        "type": "value",
        "value": "mp3_44100_64",
        "label": "mp3_44100_64",
        "helperText": "Output format, mp3 with 44.1kHz sample rate at 64kbps"
      },
      {
        "type": "value",
        "value": "mp3_44100_96",
        "label": "mp3_44100_96",
        "helperText": "Output format, mp3 with 44.1kHz sample rate at 96kbps"
      },
      {
        "type": "value",
        "value": "pcm_16000",
        "label": "pcm_16000",
        "helperText": "PCM format (S16LE) with 16kHz sample rate."
      },
      {
        "type": "value",
        "value": "pcm_22050",
        "label": "pcm_22050",
        "helperText": "PCM format (S16LE) with 22.05kHz sample rate."
      },
      {
        "type": "value",
        "value": "pcm_24000",
        "label": "pcm_24000",
        "helperText": "PCM format (S16LE) with 24kHz sample rate."
      },
      {
        "type": "value",
        "value": "pcm_44100",
        "label": "pcm_44100",
        "helperText": "PCM format (S16LE) with 44.1kHz sample rate. Requires you to be subscribed to Independent Publisher tier or above."
      },
      {
        "type": "value",
        "value": "ulaw_8000",
        "label": "ulaw_8000",
        "helperText": "μ-law format (sometimes written mu-law, often approximated as u-law) with 8kHz sample rate. Note that this format is commonly used for Twilio audio inputs."
      }
    ]
  },
  render: (args) => {
    const [value, setValue] = useState<string>();
    return (<FernDropdown value={value} onValueChange={setValue} {...args} />);
  },
};
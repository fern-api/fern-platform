Note: we are in the process of updating the links in this notebook. If a link doesn't work, please open an issue and we'll rectify it ASAP. Thanks for your understanding!

Links to add:
* Cell 1: full system for auto-meeting notes

# Recipes for better meeting notes summaries

This notebook builds on top of [our guide towards building better meeting summaries](https://github.com/cohere-ai/notebooks/blob/22dceb0ce27d73cc27f74cbf2b7c82568cbd26b7/notebooks/Meeting_Summaries_General_%26_LangChain.ipynb). In that guide, we saw how to use Command-R to summarize meeting transcripts with a focus on imparting distinct formatting requirements.

In this notebook, we'll cover useful recipes that we use internally to summarize our own meeting notes automatically (see [this guide](https://colab.research.google.com/drive/1BTAAV4ss-iPtxT0ueS7djbIIwPSt3Dpp) for an outline of the full system). We will focus on extracting specific items from the meeting notes, namely:

1. Extract action items with assignees (who's on the hook for which task)
2. Summarise speaker perspectives (who said what)
3. Focus on a narrow topic (what was said about a given topic)

Finally, we'll show that prompting the model for 1.-3. can be combined with the formatting instructions covered from our previous guide.

We're constantly improving our summarisation capabilities across domains. For more information, you can reach out to us at summarize@cohere.com.



## Setup

You'll need a Cohere API key to run this notebook. If you don't have a key, head to https://cohere.com/ to generate your key.


```python
%%capture
# TODO: upgrade to "cohere>5"!pip install "cohere<5" datasets tokenizers

import cohere
from getpass import getpass
from datasets import load_dataset

import re
from typing import Optional

# Set up Cohere client
co_api_key = getpass("Enter your Cohere API key: ")
co_model = "command-r"
co = cohere.Client(co_api_key)

```


```python
# We're also defining some util functions for later

def pprint(s: Optional[str] = None, maxchars: int = 100):
  """
  Wrap long text into lines of at most `maxchars` (preserves linebreaks occurring in text)
  """
  if not s:
    print()
  else:
    print("\n".join(line.strip() for line in re.findall(rf".{{1,{maxchars}}}(?:\s+|$)", s)))

```

## Load test data

Let's load a meeting transcript to see Command in action!

* If you have your own transcript, you can load it to Colab using your favourite method.
* If you don't, we'll use a sample from the [QMSum dataset](https://github.com/Yale-LILY/QMSum). QMSum contains cleaned meeting transcripts with [diarised speakers](https://en.wikipedia.org/wiki/Speaker_diarisation); this will be perfect for testing our model's ability to assign action items to specific speakers.
* We'll see later that the recipe shared herein isn't limited to meeting notes transcript, but extends to any data with diarised speakers!


```python
# If you have your own transcript you would like to test Command on, load it here
# transcript = ...

# Otherwise, we'll use QMSum
# Note this will download the QMSum dataset to your instance
qmsum = load_dataset("MocktaiLEngineer/qmsum-processed")
# Pick any one transcript
transcripts = qmsum["validation"]["meeting_transcript"]
transcript = transcripts[60]
pprint(transcript)
pprint()

# Measure the number of tokens
num_tokens = len(co.tokenize(transcript).tokens)
pprint(f"Number of tokens: {num_tokens}")

```

If you've loaded the QMSum dataset, you'll see a back-and-forth dialogue between a Project Manager, an Industrial Designer, and two speakers responsible for Marketing and the User Interface. They seem engaged in a  design discussion with elements of retropsective. Let's see what action items followed from this meeting!

Note that if your text length exceeds the context window of Command, you'll need to pre-process that text. Learn more about how to efficiently pre-process long texts at XXX [_include reference_].



## Build the prompt to extract action items

To extract action items, no special training is needed with Command!

Here's one possible prompt to get action items with the speaker they were assigned to, in the form of bullet points:




```python
prompt_template = """
## meeting transcript
{transcript}

## instructions
Summarize the meeting transcript above, focusing it exclusively around action items. \
Format your answer in the form of bullets. \
Make sure to include the person each action item is assigned to. \
Don't include preambles, postambles or explanations, but respond only with action items.

## summary
"""
```

We applied a few best practices in constructing this prompt:

1. We include a preamble imbuing the model with a persona
2. We use Markdown-style headers (i.e. with `##`) to delineate the preamble, the text-to-summarise, the instructions, and the output
3. We make the instructions specific: we specify that we want action items with their assignees and specify the expected format

Experiment with your own prompts, and let us know which worked best for you!

## Generate action items

Let's string together the prompt, and generate action items!


```python
prompt = prompt_template.format(transcript=transcript)
resp = co.chat(message=prompt, model=co_model, temperature=0.3)
action_items = resp.text
print(action_items)

```

Not bad! We can see that the model successfully retrieved the action items that needed an immediate follow-up, and assigned the correct speaker to them. It also formatted the output as bullet points, as requested.

Sometimes, we need to specify more complex output formats. For instance, we might want to automatically send action items to a company's project management software, which might only accept a certain data format.

Say that software accepts only action items as JSON objects where assignees are keys. We could postprocess the previous response into that JSON. Or we could specify those requirements directly into our prompt template:


```python
prompt_template_json = """
## meeting transcript
{transcript}

## instructions
Summarize the meeting transcript above, focusing it exclusively around action items. \
Format your answer in the form of a compilable JSON, where every speaker is a new key. \
Make sure to include the person each action item is assigned to. \
Don't include preambles, postambles or explanations, but respond only with action items.

## summary
"""

prompt = prompt_template_json.format(transcript=transcript)
resp = co.chat(message=prompt, model=co_model, temperature=0.3)
action_items = resp.text
print(action_items)

```

Great! All we needed was to specify the target output format for Command to obey.

Try using different instructions to suit Command's outputs to your needs.

## How to replicate this pattern for more sub-tasks

Command-R readily accommodates changes to the instructions to focus it on other subtasks. As an example, below we adapt the recipe developed for action items to perform two new tasks out-of-the-box:

* a. Summarise the meeting from the point of view of every speaker
* b. Summarise everything's that been said about a specific topic

#### a. User perspectives

We'll also make the summary extractive, i.e. we encourage the model to reuse passages from the actual meeting.


```python
prompt_template_perspectives = """
## meeting transcript
{transcript}

## instructions
Summarize the perspectives of every speaker. \
Format your answer in the form of a JSON, where every speaker is a new key. Don't use your own words, but reuse passages from the meeting transcript where possible. \
Don't include preambles, postambles or explanations, but respond only with your summary of each speaker's perspectives.

## summary
"""

prompt = prompt_template_perspectives.format(transcript=transcript)
resp = co.chat(message=prompt, model=co_model, temperature=0.3)
perspectives = resp.text
print(perspectives)

```

#### b. Topic focus


```python
prompt_template_focus_topic = """\
## meeting transcript
{transcript}

## instructions
Summarize everything that's been said about {topic} in the meeting transcript above. If the meeting transcript doesn't mention {topic}, simply state \
that there is no trace of {topic} in the provided meeting transcript. \
Format your answer in the form of paragraphs. \
Don't include preambles, postambles or explanations, but respond only with your summary of {topic}.

## summary
"""

# Try new topics here!
topic = "objects shaped like bananas"

prompt = prompt_template_focus_topic.format(transcript=transcript, topic=topic)
resp = co.chat(message=prompt, model=co_model, temperature=0.3)
perspectives = resp.text
print(perspectives)

```

Try some of your own prompts and share them back with us at summarize@cohere.com!

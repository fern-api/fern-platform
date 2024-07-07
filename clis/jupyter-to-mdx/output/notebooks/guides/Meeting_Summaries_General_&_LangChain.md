# Summarizing meeting notes

Welcome to Cohere! In this notebook, you'll learn how to:
* Use Cohere's Command-R model to summarize meeting transcripts.
* Modify your prompt to include specific formatting instructions, especially if the model output is used in downstream applications.
* Use Command-R with LangChain for summarization.

## Setup

You'll need a Cohere API key to run this notebook. If you don't have a key, head to https://cohere.com/ to generate your key.


```python
%%capture
# TODO: upgrade to "cohere>5"!pip install "cohere<5" datasets tokenizers langchain
```


```python
import re
from string import Template
from typing import Optional

import cohere
from getpass import getpass
from datasets import load_dataset

# Set up Cohere client
co_api_key = getpass("Enter your Cohere API key: ")
co_model = "command-r"
co = cohere.Client(api_key=co_api_key)
```

    Enter your Cohere API key: ··········



```python
# We'll also defining some util functions for later

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

* If you have your own transcript, you can load it to Colab using your favorite method.
* If you don't, we'll use a sample from the [QMSum dataset](https://github.com/Yale-LILY/QMSum). QMSum contains cleaned meeting transcripts with [diarised speakers](https://en.wikipedia.org/wiki/Speaker_diarisation).
* We'll see later that the recipe shared herein isn't limited to meeting notes transcript, but extends to any data with diarised speakers!


```python
# If you have your own transcript you would like to test Command on, load it here
# transcript = ...

# Otherwise, we'll use QMSum
# Note this will download the QMSum dataset to your instance
qmsum = load_dataset("MocktaiLEngineer/qmsum-processed")
# Pick any one transcript
transcripts = qmsum["validation"]["meeting_transcript"]
transcript = transcripts[0]
pprint(transcript)
```

    /usr/local/lib/python3.10/dist-packages/huggingface_hub/utils/_token.py:88: UserWarning: 
    The secret `HF_TOKEN` does not exist in your Colab secrets.
    To authenticate with the Hugging Face Hub, create a token in your settings tab (https://huggingface.co/settings/tokens), set it as secret in your Google Colab and restart your session.
    You will be able to reuse this secret in all of your notebooks.
    Please note that authentication is recommended but still optional to access public models or datasets.
      warnings.warn(



    Downloading readme:   0%|          | 0.00/21.0 [00:00<?, ?B/s]



    Downloading data:   0%|          | 0.00/4.45M [00:00<?, ?B/s]



    Downloading data:   0%|          | 0.00/950k [00:00<?, ?B/s]



    Downloading data:   0%|          | 0.00/917k [00:00<?, ?B/s]



    Generating train split: 0 examples [00:00, ? examples/s]



    Generating validation split: 0 examples [00:00, ? examples/s]



    Generating test split: 0 examples [00:00, ? examples/s]


    PhD D: Sure because I I need a lot of time to to put the label or to do that
    Professor E: I mean we we know that there s noise There s there s continual noise from fans and so
    forth and there is more impulsive noise from taps and so forth and and something in between with
    paper rustling We know that all that s there and it s a g worthwhile thing to study but obviously it
    takes a lot of time to mark all of these things Whereas th i I would think that you we can study
    more or less as a distinct phenomenon the overlapping of people talking So Then you can get the Cuz
    you need If it s three hundred i i it sounds like you probably only have fifty or sixty or seventy
    events right now that are really And and you need to have a lot more than that to have any kind of
    even visual sense of of what s going on much less any kind of reasonable statistics
    PhD C: Now why do you need to mark speaker overlap by hand if you can infer it from the relative
    energy in the
    Grad G: Well that s That s what I was going to bring up
    PhD C: I mean you should not need to do this p completely by hand
    Professor E: OK So let s back up because you were not here for an earlier conversation
    PhD C: right ? I m sorry
    Professor E: So the idea was that what he was going to be doing was experimenting with different
    measures such as the increase in energy such as the energy in the LPC residuals such as I mean there
    s a bunch of things I mean increased energy is is sort of an obvious one
    PhD C: Mm In the far field mike
    Professor E: and it s not obvious I mean you could you could do the dumbest thing and get get it
    ninety percent of the time But when you start going past that and trying to do better it s not
    obvious what combination of features is going to give you the you know the right detector So the
    idea is to have some ground truth first And so the i the idea of the manual marking was to say `` OK
    this i you know it s it s really here ``
    PhD A: But I think Liz is saying why not get it out of the transcripts ?
    PhD C: What I mean is pause get it from the close talking mikes A or ge get a first pass from those
    Professor E: We t we t w we t we talked about that
    PhD C: and then go through sort of It would be a lot faster probably to
    Professor E: We we we talked about that s But so it s a bootstrapping thing and the thing is the
    idea was i we i i we thought it would be useful for him to look at the data anyway and and then
    whatever he could mark would be helpful and we could it s a question of what you bootstrap from You
    know do you bootstrap from a simple measurement which is right most of the time and then you g do
    better or do you bootstrap from some human being looking at it and then then do your simple
    measurements from the close talking mike I mean even with the close talking mike you are not going
    to get it right all the time
    PhD C: Well that s what I wonder because or how bad it is be because that would be interesting
    Grad G: I m working on a program to do that and
    PhD C: especially because the bottleneck is the transcription Right ? I mean we ve got a lot more
    data than we have transcriptions for We have the audio data we have the close talking mike so I mean
    it seems like one kind of project that s not perfect but that you can get the training data for
    pretty quickly is you know if you infer form the close talking mikes where the on off points are of
    speech you know how can we detect that from a far field ?
    Grad G: I ve I ve written a program to do that
    PhD C: OK I m sorry I missed the
    Grad G: and so but it s it s doing something very very simple It just takes a threshold based on on
    the volume
    PhD F: Or you can set the threshold low and then weed out the false alarms by hand
    Grad G: and then it does a median filter and then it looks for runs And it seems to work I ve I m
    sort of fiddling with the parameters to get it to actually generate something and I have not I do
    not what I m working on was working on was getting it to a form where we can import it into the user
    interface that we have pause into Transcriber And so I told I said it would take about a day I ve
    worked on it for about half a day so give me another half day and I we will have something we can
    play with
    Professor E: See this is where we really need the Meeting Recorder query stuff to be working because
    we ve had these meetings and we ve had this discussion about this and I m sort of remembering a
    little bit about what we decided
    PhD C: Right I m sorry I just
    Professor E: but I could not remember all of it So I think it was partly that you know give somebody
    a chance to actually look at the data and see what these are like partly that we have e some ground
    truth to compare against you know when when he he gets his thing going
    PhD C: Well it s definitely good to have somebody look at it I was just thinking as a way to speed
    up you know the amount of
    Professor E: That was that was exactly the notion that that that we discussed


Let's also check how many tokens that transcript corresponds to.


```python
# Measure the number of tokens
num_tokens = len(co.tokenize(transcript, model=co_model).tokens)
pprint(f"Number of tokens: {num_tokens}")
```

    Number of tokens: 1152


## Simple summarization

First, we'll show an example of a simple summarization task. The prompt template we are using is shown below, and we can obtain the completion using a one line call to the Cohere API.


```python
prompt_template = Template("""## meeting transcript
$transcript

## instructions
Generate a summary of the above meeting transcript. \
Don't include preambles, postambles or explanations. \
""")
prompt = prompt_template.substitute(transcript=transcript)

# Use the Cohere API to get the response
resp = co.chat(message=prompt, model=co_model, temperature=0.2).text
pprint(resp)
```

    The team discusses the time-consuming process of identifying instances of speaker overlap in audio
    recordings. PhD C suggests using close-talking microphones and automated methods to establish ground
    truth data, which Grad G is working on. This data would help develop a more efficient system than
    manual marking.


We applied a few best practices in constructing this prompt:

1. We include a preamble imbuing the model with a persona.
2. We use Markdown-style headers (i.e. with `##`) to delineate the preamble, the text-to-summarise, the instructions, and the output

For some other prompting best practices and tips/tricks, see our [prompting guide](https://docs.google.com/document/d/1k0KBiOUEPq65vqEuAQyg6Y5l1s2_Ybwv-lOLho6NHsw/edit)!

## More advanced formatting

That worked well, but what if you want to have more control over the summary? What if you wanted a bulleted summary and wanted exactly 3 bullets in a json structure?

Let's try adding in some more specific formatting instructions.



```python
prompt_template = Template("""## meeting transcript
$transcript

## instructions
Generate a summary of the above meeting transcript in 3 bullets. \
Use the following JSON format:
{
    "summary_bullets": [
        "<bullet 1>",
        "<bullet 2>",
        ...
    ]
}
Don't include preambles, postambles or explanations.\
""")
prompt = prompt_template.substitute(transcript=transcript)

# Use the Cohere API to get the response
resp = co.chat(message=prompt, model=co_model, temperature=0.2).text
print(resp)
```

    ```json
    {
        "summary_bullets": [
            "There's a need to identify instances of speaker overlap in recorded meetings, but it's a time-consuming task to mark these events manually.",
            "An alternative is to infer speaker overlap using various measurements of energy in the audio, such as close-talking microphones, LPC residuals, etc.",
            "A threshold-based program that detects speech based on volume can speed up the process, and further improvements can be explored once a robust system is in place."
        ]
    }
    ```


That worked well! Asking for a structured response like a JSON object is a great approach for use cases where you will need to parse or post-process the output for use in downstream applications. To ensure the best possible completion, I provided a template of the expected JSON that the model filled out.

Let's also try asking for a short 1 sentence summary.


```python
prompt_template = Template("""## meeting transcript
$transcript

## instructions
Generate a summary of the above meeting transcript in 1 concise sentence. Make sure the sentence is extremely short.\
Don't include preambles, postambles or explanations.\
""")
prompt = prompt_template.substitute(transcript=transcript)

# Use the Cohere API to get the response
resp = co.chat(message=prompt, model=co_model, temperature=0.2).text
pprint(resp)
```

    The team discusses using various methods, including close-talking mics and threshold-based volume
    filters, to accurately identify instances of speaker overlap in recorded meetings.


## LangChain summarization
It's also very easy to use Command-R with LangChain for summarization.


```python
from langchain.chains.combine_documents.stuff import StuffDocumentsChain
from langchain.chains.llm import LLMChain
from langchain.prompts import PromptTemplate
from langchain.docstore.document import Document
from langchain_community.chat_models import ChatCohere

llm = ChatCohere(
    cohere_api_key=co_api_key,
    model="command-r",
    temperature=0.2,
  )

# Define prompt
prompt_template = """## meeting transcript
{transcript}

## instructions
Generate a summary of the above meeting transcript. \
Don't include preambles, postambles or explanations."""
prompt = PromptTemplate.from_template(prompt_template)

# Define LLM chain
llm_chain = LLMChain(llm=llm, prompt=prompt)

# Define StuffDocumentsChain
stuff_chain = StuffDocumentsChain(llm_chain=llm_chain, document_variable_name="transcript", verbose=True)

# Load documents
docs = [Document(page_content=transcript)]

pprint(stuff_chain.run(docs))
```

    /usr/local/lib/python3.10/dist-packages/langchain_core/_api/deprecation.py:117: LangChainDeprecationWarning: The function `run` was deprecated in LangChain 0.1.0 and will be removed in 0.2.0. Use invoke instead.
      warn_deprecated(


    
    
    [1m> Entering new StuffDocumentsChain chain...[0m
    
    [1m> Finished chain.[0m
    The team discusses the time-consuming process of identifying instances of speaker overlap in audio
    recordings. PhD C suggests using close-talking microphones and automated methods to establish ground
    truth data, which Grad G is working on. This data would help develop a more efficient system than
    manual marking.


Command-R has a context window of 128K tokens, so you can use very long documents, or multiple documents, all in a single API call.



## Wrap up

Those were some simple examples of how you can use Cohere's Command-R model for summarization.

For more advanced summarization objectives and to see some other cool things you can do with the Command-R model, see [recipes for better meeting notes summaries](https://colab.research.google.com/drive/1XqRpJH7qRnRTbOEt6kthwqZG6gtEn4gN#scrollTo=LplM9PSe8djM).

In cases where you can't fit the input text into the context window, see our [cookbook for long document strategies](https://colab.research.google.com/drive/1zxSAbruOWwWJHNsj3N56uxZtUeiS7Evd#scrollTo=4JgYYTg7Shvq).

For more information, you can reach out to us at summarize@cohere.com!

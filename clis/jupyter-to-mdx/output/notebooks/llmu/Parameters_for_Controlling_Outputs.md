<a target="_blank" href="https://colab.research.google.com/github/cohere-ai/notebooks/blob/main/notebooks/llmu/Parameters_for_Controlling_Outputs.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

# Parameters for Controlling Outputs

In this notebook, you’ll learn about the parameters you can use to control the Chat endpoint's outputs.

*Read the accompanying [blog post here](https://docs.cohere.com/docs/parameters-for-controlling-outputs).*

## Overview

The notebook has 2 sections:
- **Model Type** - Select a variation of the Command model.
- **Randomness** - Use the `temperature` parameter to control the level of randomness of the model.

## Setup

We'll start by installing the tools we'll need and then importing them.


```python
! pip install cohere -q
```


```python
#@title Enable text wrapping in Google Colab

from IPython.display import HTML, display

def set_css():
  display(HTML('''
  <style>
    pre {
        white-space: pre-wrap;
    }
  </style>
  '''))
get_ipython().events.register('pre_run_cell', set_css)
```

Fill in your Cohere API key in the next cell. To do this, begin by [signing up to Cohere](https://os.cohere.ai/) (for free!) if you haven't yet. Then get your API key [here](https://dashboard.cohere.com/api-keys).


```python
import cohere

# Paste your API key here. Remember to not share publicly
co = cohere.Client("COHERE_API_KEY") # Insert your Cohere API key
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



## Model Type

When calling the Chat endpoint, use the `model` parameter to choose from several variations of the Command model. In the example, we select [Command R+](https://docs.cohere.com/docs/command-r-plus).


```python
response = co.chat(message="Hello",
                   model="command-r-plus")
print(response.text)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    Hello! How can I help you today?


[See the documentation](https://docs.cohere.com/docs/models#command) for the most updated list of available Cohere models.

## Randomness

You can use the `temperature` parameter to control the level of randomness of the model. It is a value between 0 and 1. As you increase the temperature, the model gets more creative and random. Temperature can be tuned for different problems, and most people will find that the default temperature of 0.3 is a good starting point.

Consider the example below, where we ask the model to generate alternative titles for a blog post. Prompting the endpoint five times when the temperature is set to 0 yields the same output each time. 


```python
message = """Suggest a more exciting title for a blog post titled: Intro to Retrieval-Augmented Generation. \
Respond in a single line."""

for _ in range(5):
    response = co.chat(message=message,
                       temperature=0,
                       model="command-r-plus")
    print(response.text)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    The Future of AI: Unlocking the Power of Retrieval-Augmented Generation
    The Future of AI: Unlocking the Power of Retrieval-Augmented Generation
    The Future of AI: Unlocking the Power of Retrieval-Augmented Generation
    The Future of AI: Unlocking the Power of Retrieval-Augmented Generation
    The Future of AI: Unlocking the Power of Retrieval-Augmented Generation


However, if we increase the temperature to the maximum value of 1, the model gives different proposals.


```python
message = """Suggest a more exciting title for a blog post titled: Intro to Retrieval-Augmented Generation. \
Respond in a single line."""

for _ in range(5):
    response = co.chat(message=message,
                       temperature=1,
                       model="command-r-plus")
    print(response.text)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    Unleashing the Power of Retrieval-Augmented Generation: A Comprehensive Guide
    The Exciting Future of AI: How Retrieval-Augmented Generation Will Transform the Way We Interact With Machines
    The Magic of AI: Unlocking the Power of Retrieval-Augmented Generation
    The Future of AI: Unlocking the Power of Retrieval-Augmented Generation
    "Unleashing the Power of AI: The Rise of Retrieval-Augmented Generation."


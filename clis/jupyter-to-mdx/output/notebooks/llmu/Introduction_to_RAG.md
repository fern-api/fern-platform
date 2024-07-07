<a target="_blank" href="https://colab.research.google.com/github/cohere-ai/notebooks/blob/main/notebooks/llmu/Introduction_to_RAG.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

# Introduction to RAG

This notebook shows a quickstart example on how to build a RAG-powered chatbot with the Cohere's Chat endpoint. The chatbot can extract relevant information from external documents and produce verifiable, inline citations in its responses.

Read the accompanying [article here](https://txt.cohere.com/rag-start/).

The diagram below provides an overview of what we’ll build.

<img src="../images/llmu/rag/rag-workflow-1.png" alt="Workflow">

# Setup


```python
! pip install cohere -q
```

    [?25l     [90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m0.0/118.8 kB[0m [31m?[0m eta [36m-:--:--[0m[2K     [90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m118.8/118.8 kB[0m [31m3.7 MB/s[0m eta [36m0:00:00[0m
    [2K     [90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m75.6/75.6 kB[0m [31m8.2 MB/s[0m eta [36m0:00:00[0m
    [2K     [90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m77.8/77.8 kB[0m [31m6.1 MB/s[0m eta [36m0:00:00[0m
    [2K     [90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m58.3/58.3 kB[0m [31m6.7 MB/s[0m eta [36m0:00:00[0m
    [?25h


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



<style>
  pre {
      white-space: pre-wrap;
  }
</style>





<style>
  pre {
      white-space: pre-wrap;
  }
</style>





<style>
  pre {
      white-space: pre-wrap;
  }
</style>





<style>
  pre {
      white-space: pre-wrap;
  }
</style>




```python
import cohere
co = cohere.Client("COHERE_API_KEY") # Get your API key here: https://dashboard.cohere.com/api-keys
```

# Define documents

We define the documents that we want to ground an LLM’s response with, formatted as a list. In our case, each document consists of two fields: title and text.



```python
documents = [
    {
        "title": "Tall penguins",
        "text": "Emperor penguins are the tallest."},
    {
        "title": "Penguin habitats",
        "text": "Emperor penguins only live in Antarctica."},
    {
        "title": "What are animals?",
        "text": "Animals are different from plants."}
]
```

# Generate response with citations

Cohere’s RAG functionalities are part of the Chat endpoint, with the Command model as the underlying LLM. This allows developers to build chatbots that have the full context of a conversation and are not limited to a single interaction.

First, we define the user message. Then we generate the response from the LLM and display it, together with citations and the source documents used.


```python
# Get the user message
message = "What are the tallest living penguins?"

# Generate the response
response = co.chat_stream(message=message,
                          model="command-r-plus",
                          documents=documents)

# Display the response
citations = []
cited_documents = []

for event in response:
    if event.event_type == "text-generation":
        print(event.text, end="")
    elif event.event_type == "citation-generation":
        citations.extend(event.citations)
    elif event.event_type == "stream-end":
      cited_documents = event.response.documents

# Display the citations and source documents
if citations:
  print("\n\nCITATIONS:")
  for citation in citations:
    print(citation)

  print("\nDOCUMENTS:")
  for document in cited_documents:
    print(document)
```

    The tallest living penguins are emperor penguins, which are found only in Antarctica.
    
    CITATIONS:
    start=32 end=48 text='emperor penguins' document_ids=['doc_0']
    start=66 end=85 text='only in Antarctica.' document_ids=['doc_1']
    
    DOCUMENTS:
    {'id': 'doc_0', 'text': 'Emperor penguins are the tallest.', 'title': 'Tall penguins'}
    {'id': 'doc_1', 'text': 'Emperor penguins only live in Antarctica.', 'title': 'Penguin habitats'}


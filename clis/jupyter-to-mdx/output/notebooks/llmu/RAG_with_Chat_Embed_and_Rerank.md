<a target="_blank" href="https://colab.research.google.com/github/cohere-ai/notebooks/blob/main/notebooks/llmu/RAG_with_Chat_Embed_and_Rerank.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

# RAG with Chat, Embed, and Rerank

This notebook shows how to build a RAG-powered chatbot with Cohere's Chat endpoint.  The chatbot can extract relevant information from external documents and produce verifiable, inline citations in its responses.

Read the accompanying [article here](https://txt.cohere.com/rag-chatbot/).

This application will use several Cohere API endpoints:

- Chat: For handling the main logic of the chatbot, including turning a user message into queries, generating responses, and producing citations
- Embed: For turning textual documents into their embeddings representation, later to be used in retrieval (we’ll use the latest, state-of-the-art Embed v3 model)
- Rerank: For reranking the retrieved documents according to their relevance to a query

The diagram below provides an overview of what we’ll build.

![Workflow](../images/llmu/rag/rag-workflow-2.png)

Here is a summary of the steps involved.

Initial phase:
- **Step 0**: Ingest the documents – get documents, chunk, embed, and index.

For each user-chatbot interaction:
- **Step 1**: Get the user message
- **Step 2**: Call the Chat endpoint in query-generation mode
- If at least one query is generated
  - **Step 3**: Retrieve and rerank relevant documents
  - **Step 4**: Call the Chat endpoint in document mode to generate a grounded response with citations
- If no query is generated
  - **Step 4**: Call the Chat endpoint in normal mode to generate a response

# Setup


```python
! pip install cohere hnswlib unstructured -q
```


```python
import cohere
import uuid
import hnswlib
from typing import List, Dict
from unstructured.partition.html import partition_html
from unstructured.chunking.title import chunk_by_title

co = cohere.Client("COHERE_API_KEY") # Get your API key here: https://dashboard.cohere.com/api-keys
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

# Create a vector store for ingestion and retrieval


![RAG components - Vectorstore](../images/llmu/rag/rag-components-vectorstore.png)


First, we define the list of documents we want to ingest and make available for retrieval. As an example, we'll use the contents from the first module of Cohere's *LLM University: What are Large Language Models?*.


```python
raw_documents = [
    {
        "title": "Text Embeddings",
        "url": "https://docs.cohere.com/docs/text-embeddings"},
    {
        "title": "Similarity Between Words and Sentences",
        "url": "https://docs.cohere.com/docs/similarity-between-words-and-sentences"},
    {
        "title": "The Attention Mechanism",
        "url": "https://docs.cohere.com/docs/the-attention-mechanism"},
    {
        "title": "Transformer Models",
        "url": "https://docs.cohere.com/docs/transformer-models"}
]
```

Usually the number of documents for practical applications is vast, and so we'll need to be able to search documents efficiently.  This involves breaking the documents into chunks, generating embeddings, and indexing the embeddings, as shown in the image below.  

We implement this in the `Vectorstore` class below, which takes the `raw_documents` list as input.  Three methods are immediately called when creating an object of the `Vectorstore` class:


`load_and_chunk()`  
This method uses the `partition_html()` method from the `unstructured` library to load the documents from URL and break them into smaller chunks.  Each chunk is turned into a dictionary object with three fields:
- `title` - the web page’s title,
- `text` - the textual content of the chunk, and
- `url` - the web page’s URL.  
  
  
`embed()`  
This method uses Cohere's `embed-english-v3.0` model to generate embeddings of the chunked documents.  Since our documents will be used for retrieval, we set `input_type="search_document"`.  We send the documents to the Embed endpoint in batches, because the endpoint has a limit of 96 documents per call.

`index()`  
This method uses the `hsnwlib` package to index the document chunk embeddings.  This will ensure efficient similarity search during retrieval.  Note that `hnswlib` uses a vector library, and we have chosen it for its simplicity.


```python
class Vectorstore:
    """
    A class representing a collection of documents indexed into a vectorstore.

    Parameters:
    raw_documents (list): A list of dictionaries representing the sources of the raw documents. Each dictionary should have 'title' and 'url' keys.

    Attributes:
    raw_documents (list): A list of dictionaries representing the raw documents.
    docs (list): A list of dictionaries representing the chunked documents, with 'title', 'text', and 'url' keys.
    docs_embs (list): A list of the associated embeddings for the document chunks.
    docs_len (int): The number of document chunks in the collection.
    idx (hnswlib.Index): The index used for document retrieval.

    Methods:
    load_and_chunk(): Loads the data from the sources and partitions the HTML content into chunks.
    embed(): Embeds the document chunks using the Cohere API.
    index(): Indexes the document chunks for efficient retrieval.
    retrieve(): Retrieves document chunks based on the given query.
    """

    def __init__(self, raw_documents: List[Dict[str, str]]):
        self.raw_documents = raw_documents
        self.docs = []
        self.docs_embs = []
        self.retrieve_top_k = 10
        self.rerank_top_k = 3
        self.load_and_chunk()
        self.embed()
        self.index()


    def load_and_chunk(self) -> None:
        """
        Loads the text from the sources and chunks the HTML content.
        """
        print("Loading documents...")

        for raw_document in self.raw_documents:
            elements = partition_html(url=raw_document["url"])
            chunks = chunk_by_title(elements)
            for chunk in chunks:
                self.docs.append(
                    {
                        "title": raw_document["title"],
                        "text": str(chunk),
                        "url": raw_document["url"],
                    }
                )

    def embed(self) -> None:
        """
        Embeds the document chunks using the Cohere API.
        """
        print("Embedding document chunks...")

        batch_size = 90
        self.docs_len = len(self.docs)
        for i in range(0, self.docs_len, batch_size):
            batch = self.docs[i : min(i + batch_size, self.docs_len)]
            texts = [item["text"] for item in batch]
            docs_embs_batch = co.embed(
                texts=texts, model="embed-english-v3.0", input_type="search_document"
            ).embeddings
            self.docs_embs.extend(docs_embs_batch)

    def index(self) -> None:
        """
        Indexes the document chunks for efficient retrieval.
        """
        print("Indexing document chunks...")

        self.idx = hnswlib.Index(space="ip", dim=1024)
        self.idx.init_index(max_elements=self.docs_len, ef_construction=512, M=64)
        self.idx.add_items(self.docs_embs, list(range(len(self.docs_embs))))

        print(f"Indexing complete with {self.idx.get_current_count()} document chunks.")

    def retrieve(self, query: str) -> List[Dict[str, str]]:
        """
        Retrieves document chunks based on the given query.

        Parameters:
        query (str): The query to retrieve document chunks for.

        Returns:
        List[Dict[str, str]]: A list of dictionaries representing the retrieved document chunks, with 'title', 'text', and 'url' keys.
        """

        # Dense retrieval
        query_emb = co.embed(
            texts=[query], model="embed-english-v3.0", input_type="search_query"
        ).embeddings

        doc_ids = self.idx.knn_query(query_emb, k=self.retrieve_top_k)[0][0]

        # Reranking
        rank_fields = ["title", "text"] # We'll use the title and text fields for reranking

        docs_to_rerank = [self.docs[doc_id] for doc_id in doc_ids]

        rerank_results = co.rerank(
            query=query,
            documents=docs_to_rerank,
            top_n=self.rerank_top_k,
            model="rerank-english-v3.0",
            rank_fields=rank_fields
        )

        doc_ids_reranked = [doc_ids[result.index] for result in rerank_results.results]

        docs_retrieved = []
        for doc_id in doc_ids_reranked:
            docs_retrieved.append(
                {
                    "title": self.docs[doc_id]["title"],
                    "text": self.docs[doc_id]["text"],
                    "url": self.docs[doc_id]["url"],
                }
            )

        return docs_retrieved
```

In the code cell below, we initialize an instance of the `Vectorstore` class and pass in the `raw_documents` list as input.


```python
# Create an instance of the Vectorstore class with the given sources
vectorstore = Vectorstore(raw_documents)
```

    Loading documents...
    Embedding document chunks...
    Indexing document chunks...
    Indexing complete with 134 document chunks.


The `Vectorstore` class also has a `retrieve()` method, which we'll use to retrieve relevant document chunks given a query (as in Step 3 in the diagram shared at the beginning of this notebook).  This method has two components: (1) dense retrieval, and (2) reranking.

### Dense retrieval

First, we embed the query using the same `embed-english-v3.0` model we used to embed the document chunks, but this time we set `input_type="search_query"`.

Search is performed by the `knn_query()` method from the `hnswlib` library. Given a query, it returns the document chunks most similar to the query. We can define the number of document chunks to return using the attribute `self.retrieve_top_k=10`.

### Reranking

After semantic search, we implement a reranking step.  While our semantic search component is already highly capable of retrieving relevant sources, the [Rerank endpoint](https://cohere.com/rerank) provides an additional boost to the quality of the search results, especially for complex and domain-specific queries. It takes the search results and sorts them according to their relevance to the query.

We call the Rerank endpoint with the `co.rerank()` method and define the number of top reranked document chunks to retrieve using the attribute `self.rerank_top_k=3`.  The model we use is `rerank-english-v2.0`.  

This method returns the top retrieved document chunks `chunks_retrieved` so that they can be passed to the chatbot.

In the code cell below, we check the document chunks that are retrieved for the query `"multi-head attention definition"`.

## Test Retrieval


```python
vectorstore.retrieve("multi-head attention definition")
```




    [{'title': 'Transformer Models',
      'text': 'The attention step used in transformer models is actually much more powerful, and it’s called multi-head attention. In multi-head attention, several different embeddings are used to modify the vectors and add context to them. Multi-head attention has helped language models reach much higher levels of efficacy when processing and generating text.',
      'url': 'https://docs.cohere.com/docs/transformer-models'},
     {'title': 'The Attention Mechanism',
      'text': "What you learned in this chapter is simple self-attention. However, we can do much better than that. There is a method called multi-head attention, in which one doesn't only consider one embedding, but several different ones. These are all obtained from the original by transforming it in different ways. Multi-head attention has been very successful at the task of adding context to text. If you'd like to learn more about the self and multi-head attention, you can check out the following two",
      'url': 'https://docs.cohere.com/docs/the-attention-mechanism'},
     {'title': 'Transformer Models',
      'text': 'Attention is a very useful technique that helps language models understand the context. In order to understand how attention works, consider the following two sentences:\n\nSentence 1: The bank of the river.\n\nSentence 2: Money in the bank.',
      'url': 'https://docs.cohere.com/docs/transformer-models'}]



# Create a chatbot

![RAG components - Chatbot](../images/llmu/rag/rag-components-chatbot.png)


Next, we implement a class to handle the interaction between the user and the chatbot.  It takes an instance of the `Vectorstore` class as input.

The `run()` method will be used to run the chatbot application.  It begins with the logic for getting the user message, along with a way for the user to end the conversation.  

Based on the user message, the chatbot needs to decide if it needs to consult external information before responding.  If so, the chatbot determines an optimal set of search queries to use for retrieval.  When we call `co.chat()` with `search_queries_only=True`, the Chat endpoint handles this for us automatically.

The generated queries can be accessed from the `search_queries` field of the object that is returned.  Then, what happens next depends on how many queries are returned.
- If queries are returned, we call the `retrieve()` method of the Vectorstore object for the  retrieval step.  The retrieved document chunks are then passed to the Chat endpoint by adding a `documents` parameter when we call `co.chat()` again.
- Otherwise, if no queries are returned, we call the Chat endpoint another time, passing the user message and without needing to add any documents to the call.

In either case, we also pass the `conversation_id` parameter, which retains the interactions between the user and the chatbot in the same conversation thread. We also enable the `stream` parameter so we can stream the chatbot response.

We then print the chatbot's response.  In the case that the external information was used to generate a response, we also display citations.


```python
class Chatbot:
    def __init__(self, vectorstore: Vectorstore):
        """
        Initializes an instance of the Chatbot class.

        Parameters:
        vectorstore (Vectorstore): An instance of the Vectorstore class.

        """
        self.vectorstore = vectorstore
        self.conversation_id = str(uuid.uuid4())

    def run(self):
        """
        Runs the chatbot application.

        """
        while True:
            print(f"\n{'-'*100}\n")
            # Get the user message
            message = input("User: ")

            # Typing "quit" ends the conversation
            if message.lower() == "quit":
              print("Ending chat.")
              break
            # else:                       # If using Google Colab, remove this line to avoid printing the same thing twice
            #   print(f"User: {message}") # If using Google Colab, remove this line to avoid printing the same thing twice

            # Generate search queries (if any)
            response = co.chat(message=message,
                               model="command-r",
                               search_queries_only=True)

            # If there are search queries, retrieve document chunks and respond
            if response.search_queries:
                print("Retrieving information...", end="")

                # Retrieve document chunks for each query
                documents = []
                for query in response.search_queries:
                    documents.extend(self.vectorstore.retrieve(query.text))

                # Use document chunks to respond
                response = co.chat_stream(
                    message=message,
                    model="command-r-plus",
                    documents=documents,
                    conversation_id=self.conversation_id,
                )

            # If there is no search query, directly respond
            else:
                response = co.chat_stream(
                    message=message,
                    model="command-r-plus",
                    conversation_id=self.conversation_id,
                )

            # Print the chatbot response, citations, and documents
            print("\nChatbot:")
            citations = []
            cited_documents = []

            # Display response
            for event in response:
                if event.event_type == "text-generation":
                    print(event.text, end="")
                elif event.event_type == "citation-generation":
                    citations.extend(event.citations)
                elif event.event_type == "stream-end":
                    cited_documents = event.response.documents

            # Display citations and source documents
            if citations:
              print("\n\nCITATIONS:")
              for citation in citations:
                print(citation)

              print("\nDOCUMENTS:")
              for document in cited_documents:
                print(document)
```

# Run the chatbot

We can now run the chatbot.  For this, we create the instance of `Chatbot` and run the chatbot by invoking the `run()` method.

The format of each citation is:
- `start`: The starting point of a span where one or more documents are referenced
- `end`: The ending point of a span where one or more documents are referenced
- `text`: The text representing this span
- `document_ids`: The IDs of the documents being referenced (`doc_0` being the ID of the first document passed to the `documents` creating parameter in the endpoint call, and so on)


```python
# Create an instance of the Chatbot class
chatbot = Chatbot(vectorstore)

# Run the chatbot
chatbot.run()
```

    User: Hello, I have a question
    
    Chatbot:
    Of course! I am here to assist you. Please go ahead with your question, and I will do my best to provide a helpful response.
    ----------------------------------------------------------------------------------------------------
    
    User: What’s the difference between word and sentence embeddings
    Retrieving information...
    Chatbot:
    Word embeddings are a way to associate words with lists of numbers (vectors) so that similar words are associated with numbers that are close by, and dissimilar words with numbers that are far away from each other. Sentence embeddings do the same thing but associate a vector to an entire sentence. Similar sentences are assigned similar vectors, and different sentences are assigned different vectors. Each coordinate in the vector identifies some property of the sentence.
    
    CITATIONS:
    start=0 end=15 text='Word embeddings' document_ids=['doc_0', 'doc_1']
    start=29 end=76 text='associate words with lists of numbers (vectors)' document_ids=['doc_1']
    start=85 end=144 text='similar words are associated with numbers that are close by' document_ids=['doc_1']
    start=150 end=214 text='dissimilar words with numbers that are far away from each other.' document_ids=['doc_1']
    start=215 end=234 text='Sentence embeddings' document_ids=['doc_0', 'doc_1', 'doc_2']
    start=257 end=298 text='associate a vector to an entire sentence.' document_ids=['doc_0', 'doc_1', 'doc_2']
    start=299 end=345 text='Similar sentences are assigned similar vectors' document_ids=['doc_0']
    start=351 end=402 text='different sentences are assigned different vectors.' document_ids=['doc_0']
    start=403 end=474 text='Each coordinate in the vector identifies some property of the sentence.' document_ids=['doc_0', 'doc_2']
    
    DOCUMENTS:
    {'id': 'doc_0', 'text': 'This is where sentence embeddings come into play. A sentence embedding is just like a word embedding, except it associates every sentence with a vector full of numbers, in a coherent way. By coherent, I mean that it satisfies similar properties as a word embedding. For instance, similar sentences are assigned to similar vectors, different sentences are assigned to different vectors, and most importantly, each of the coordinates of the vector identifies some (whether clear or obscure) property of', 'title': 'Text Embeddings', 'url': 'https://docs.cohere.com/docs/text-embeddings'}
    {'id': 'doc_1', 'text': 'In the previous chapters, you learned about word and sentence embeddings and similarity between words and sentences. In short, a word embedding is a way to associate words with lists of numbers (vectors) in such a way that similar words are associated with numbers that are close by, and dissimilar words with numbers that are far away from each other. A sentence embedding does the same thing, but associating a vector to every sentence. Similarity is a way to measure how similar two words (or', 'title': 'The Attention Mechanism', 'url': 'https://docs.cohere.com/docs/the-attention-mechanism'}
    {'id': 'doc_2', 'text': 'Sentence embeddings are even more powerful, as they assign a vector of numbers to each sentence, in a way that these numbers also carry important properties of the sentence. One of the Cohere embeddings assigns a vector of length 4096 (i.e., a list of 4096 numbers) to each sentence. Furthermore, multilingual embedding does this for sentences in more than 100 languages. In this way, the sentence “Hello, how are you?” and its corresponding French translation, “Bonjour, comment ça va?” will be', 'title': 'Similarity Between Words and Sentences', 'url': 'https://docs.cohere.com/docs/similarity-between-words-and-sentences'}
    
    ----------------------------------------------------------------------------------------------------
    
    User: And what are their similarities
    Retrieving information...
    Chatbot:
    Word and sentence embeddings both use vectors to represent words or sentences in a numerical space. The similarity between embeddings is calculated using a dot product. The similarity between an embedding and itself is 1, and the similarity between an irrelevant word or sentence and any other word or sentence is 0.
    
    CITATIONS:
    start=38 end=45 text='vectors' document_ids=['doc_0', 'doc_3', 'doc_4']
    start=59 end=77 text='words or sentences' document_ids=['doc_0', 'doc_3', 'doc_4']
    start=83 end=99 text='numerical space.' document_ids=['doc_0', 'doc_3', 'doc_4']
    start=104 end=114 text='similarity' document_ids=['doc_5']
    start=156 end=168 text='dot product.' document_ids=['doc_5']
    start=173 end=220 text='similarity between an embedding and itself is 1' document_ids=['doc_0', 'doc_4']
    start=230 end=316 text='similarity between an irrelevant word or sentence and any other word or sentence is 0.' document_ids=['doc_0', 'doc_4']
    
    DOCUMENTS:
    {'id': 'doc_0', 'text': 'But let me add some numbers to this reasoning to make it more clear. Imagine that we calculate similarities for the words in each sentence, and we get the following:\n\nThis similarity makes sense in the following ways:\n\nThe similarity between each word and itself is 1.\n\nThe similarity between any irrelevant word (“the”, “of”, etc.) and any other word is 0.\n\nThe similarity between “bank” and “river” is 0.11.\n\nThe similarity between “bank” and “money” is 0.25.', 'title': 'The Attention Mechanism', 'url': 'https://docs.cohere.com/docs/the-attention-mechanism'}
    {'id': 'doc_3', 'text': 'assigned very similar numbers, as they have the same semantic meaning.', 'title': 'Similarity Between Words and Sentences', 'url': 'https://docs.cohere.com/docs/similarity-between-words-and-sentences'}
    {'id': 'doc_4', 'text': 'But let me add some numbers to this reasoning to make it more clear. Imagine that we calculate similarities for the words in each sentence, and we get the following:\n\nThis similarity makes sense in the following ways:\n\nThe similarity between each word and itself is 1.\n\nThe similarity between any irrelevant word (“the”, “of”, etc.) and any other word is 0.\n\nThe similarity between “bank” and “river” is 0.11.\n\nThe similarity between “bank” and “money” is 0.25.', 'title': 'The Attention Mechanism', 'url': 'https://docs.cohere.com/docs/the-attention-mechanism'}
    {'id': 'doc_5', 'text': 'Dot Product Similarity\n\nLet’s calculate the dot products between the three sentences. The following line of code will do it.\n\nAnd the results are:\n\nThe similarity between sentences 1 and 2 (0.8188) is much larger than the similarities between the other pairs. This confirms our predictions.\n\nJust for consistency, we also calculate the similarities between each sentence and itself, to confirm that a sentence and itself has the highest similarity score.', 'title': 'Similarity Between Words and Sentences', 'url': 'https://docs.cohere.com/docs/similarity-between-words-and-sentences'}
    
    ----------------------------------------------------------------------------------------------------
    
    User: What do you know about 5G networks
    Retrieving information...
    Chatbot:
    I'm sorry, but I do not have any information about 5G networks. Can I help you with anything else?
    ----------------------------------------------------------------------------------------------------
    
    Ending chat.


In the conversation above, notice a few observations that reflect the different components of what we built:

- **Direct response**: For user messages that don’t require retrieval, such as "Hello, I have a question", the chatbot responds directly without requiring retrieval.
- **Citation generation**: For responses that do require retrieval ("What’s the difference between word and sentence embeddings"), the endpoint returns the response together with the citations.
- **State management**: The endpoint maintains the state of the conversation via the `conversation_id` parameter, for example, by being able to correctly respond to a vague user message of "And what are their similarities".
- **Response synthesis**: The model can decide if none of the retrieved documents provide the necessary information required to answer a user message. For example, when asked the question "What do you know about 5G networks", the chatbot goes on and retrieves external information from the index. However, it doesn’t use any of the information in its response as none of them is relevant to the question.

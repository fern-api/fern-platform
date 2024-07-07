<a target="_blank" href="https://colab.research.google.com/github/cohere-ai/notebooks/blob/main/notebooks/What_Is_Similarity_Between_Sentences.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

# Similarity Between Words and Sentences

Sentence embeddings are the bread and butter of language models, as they associate each sentence with a particular list of numbers (a vector), in a way that similar sentences give similar vectors. We can think of embeddings as a way to locate each sentence in space (a high dimensional space, but a space nonetheless), in a way that similar sentences are located close by. Once we have each sentence somewhere in space, it’s natural to think of distances between them. And an even more intuitive way to think of distances is to think of similarities, i.e., a score assigned to each pair of sentences, which is high when these sentences are similar, and low when they are different. The similarity is a very useful concept in large language models, as it can be used for search, for translation, for summarization, and in many other applications. 

In this notebook, we understand the intuition behind similarities between sentences, including dot product and cosine similarity.

_Read the accompanying [blog post here](https://docs.cohere.com/docs/similarity-between-words-and-sentences)._

## Overview

We'll do the following steps:
- **Step 1: Turn Text into Embeddings** - Use Cohere's Embed endpoint to get sentence embeddings.
- **Step 2: Calculate Dot Products** - Calculate the dot products between each pair of sentence embeddings to understand similarity between them.
- **Step 3: Calculate Cosine Similarities** - Use scikit-learn to get the cosine similarity for each pair of sentence embeddings.

## Setup

We'll start by installing the tools we'll need and then importing them.


```python
! pip install cohere -q
```


```python
import cohere
import numpy as np
import seaborn as sns
import altair as alt
from sklearn.metrics.pairwise import cosine_similarity
```

Fill in your Cohere API key in the next cell. To do this, begin by [signing up to Cohere](https://os.cohere.ai/) (for free!) if you haven't yet. Then get your API key [here](https://dashboard.cohere.com/api-keys).


```python
# Paste your API key here. Remember to not share publicly
co = cohere.Client("COHERE_API_KEY") 
```

## Step 1: Turn Text into Embeddings

In this notebook, we'll work with three sentences and store them in a Python list `texts`.


```python
texts = ["I like to be in my house", 
         "I enjoy staying home", 
         "the isotope 238u decays to 206pb"]
```

To get the corresponding sentence embeddings, we call the [Embed endpoint](https://docs.cohere.com/reference/embed) with `co.embed()`. We supply three parameters:
- `texts` - our list of sentences
- `model` - we use `embed-english-v3.0`, Cohere's latest (at the time of writing) English-only embeddings model to generate the embeddings
- `input_type` - we use `search_document` to indicate that we intend to use the embeddings for search use-cases

You'll learn about these parameters in more detail in the [LLMU Module on Text Representation](https://docs.cohere.com/docs/intro-text-representation).


```python
response = co.embed(
    texts=texts,
    model='embed-english-v3.0',
    input_type='search_document'
)
```

The embeddings are stored in the `embeddings` value of the response. After getting the embeddings, we separate them by sentence.


```python
embeddings = response.embeddings

[sentence1, sentence2, sentence3] = embeddings

print("Embedding for sentence 1", np.array(sentence1))
print("Embedding for sentence 2", np.array(sentence2))
print("Embedding for sentence 3", np.array(sentence3))
```

    Embedding for sentence 1 [ 0.04968262  0.03799438 -0.02963257 ... -0.0737915  -0.0079422
     -0.01863098]
    Embedding for sentence 2 [ 0.043396    0.05401611 -0.02461243 ... -0.06216431 -0.0196228
     -0.00948334]
    Embedding for sentence 3 [ 0.0243988   0.00712967 -0.04669189 ... -0.03903198 -0.02403259
      0.01942444]


Note that the embeddings are vectors (lists) of 1024 numbers, so they are truncated here (thus the dots in between).  One would expect that the vectors corresponding to sentences 1 and 2 are similar to each other and that both are different from the vector corresponding to sentence 3. However, from inspection, this is not very clear. We need to calculate some similarities to see if this is the case.  We will do that in the following two sections.

## Step 2: Calculate Dot Products

Let’s calculate the dot products between the three sentences to understand how similar they are to each other.


```python
print("Similarity between sentences 1 and 2:", np.dot(sentence1, sentence2))
print("Similarity between sentences 1 and 3:", np.dot(sentence1, sentence3))
print("Similarity between sentences 2 and 3:", np.dot(sentence2, sentence3))
```

    Similarity between sentences 1 and 2: 0.818827121924668
    Similarity between sentences 1 and 3: 0.19770800712384107
    Similarity between sentences 2 and 3: 0.19897217756830138


The similarity between sentences 1 and 2 (0.8188) is much larger than the similarities between the other pairs. This confirms our predictions.

Just for consistency, let’s calculate the similarities between each sentence and itself, to confirm that a sentence and itself has the highest similarity score.


```python
print("Similarity between sentences 1 and 1:", np.dot(sentence1, sentence1))
print("Similarity between sentences 2 and 2:", np.dot(sentence2, sentence2))
print("Similarity between sentences 3 and 3:", np.dot(sentence3, sentence3))
```

    Similarity between sentences 1 and 1: 0.9994656785851899
    Similarity between sentences 2 and 2: 1.0006820582016114
    Similarity between sentences 3 and 3: 1.0005095878377965


This checks out—the similarity between a sentence and itself is around 1, which is higher than all the other similarities.

## Step 3: Calculate Cosine Similarities

We use the `cosine_similarity()` function from scikit-learn to measure cosine similarity between the three sentences.


```python
print("Cosine similarity between sentences 1 and 2:", cosine_similarity([sentence1], [sentence2])[0][0])
print("Cosine similarity between sentences 1 and 3:", cosine_similarity([sentence1], [sentence3])[0][0])
print("Cosine similarity between sentences 2 and 3:", cosine_similarity([sentence2], [sentence3])[0][0])
```

    Cosine similarity between sentences 1 and 2: 0.818766792354783
    Cosine similarity between sentences 1 and 3: 0.1977104790996451
    Cosine similarity between sentences 2 and 3: 0.19885369669720415


Now let’s check the similarity between each sentence and itself. 


```python
print("Cosine similarity between sentences 1 and 1:", cosine_similarity([sentence1], [sentence1])[0][0])
print("Cosine similarity between sentences 2 and 2:", cosine_similarity([sentence2], [sentence2])[0][0])
print("Cosine similarity between sentences 3 and 3:", cosine_similarity([sentence3], [sentence3])[0][0])
```

    Cosine similarity between sentences 1 and 1: 0.9999999999999998
    Cosine similarity between sentences 2 and 2: 1.0000000000000004
    Cosine similarity between sentences 3 and 3: 1.0000000000000004


We also plot the results in a grid.


```python
# Get pairwise dot product similarities
dot_product_similarities = [[cosine_similarity([embeddings[i]], [embeddings[j]])[0][0] for i in range(len(embeddings))] for j in range(len(embeddings))]

# Plot in 3x3 grid
ax = sns.heatmap(dot_product_similarities, vmin=0, vmax=1,
                 linewidths=1, linecolor='grey',
                 xticklabels=texts,
                 yticklabels=texts,
)
ax.set_xticklabels(labels=texts, rotation=45)
```




    [Text(0.5, 0, 'I like to be in my house'),
     Text(1.5, 0, 'I enjoy staying home'),
     Text(2.5, 0, 'the isotope 238u decays to 206pb')]




    
![png](/Users/catherinedeskur/Documents/Fern/fern-platform/clis/jupyter-to-mdx/output/notebooks/llmu/What_Is_Similarity_Between_Sentences_24_1.png)
    


Notice that the dot product and cosine distance give nearly identical values. The reason for this is that the embedding is normalized (meaning each vector has norm equal to 1). When the embedding is not normalized, the dot product and cosine distance would give different values.

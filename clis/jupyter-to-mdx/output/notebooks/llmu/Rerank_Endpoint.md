# Reranking Unstructured and Semi-Structured Data

Enterprise data is often complex, and current systems have difficulty searching through multi-aspect and semi-structured data sources. The most useful data at companies is not often in simple document format, and semi-structured data formats such as JSON are common across enterprise applications.

The Rerank API Endpoint, powered by the [Rerank 3](https://docs.cohere.com/docs/rerank-2) model, can search over semi-structured data that is represented as JSON. You can simply take your JSON documents, e.g. from an Elasticsearch or MongoDB, and pass it to the Rerank 3 model. By setting the rank fields, you can select which fields should be considered by the model for the reranking.

In this notebook, we'll see how to use Rerank 3 to rank complex, multi-aspect data (e.g. emails) based on all of their relevant metadata fields. The diagram below provides an overview of what we'll build.

![rerank-email-example](https://cohere.com/_next/image?url=https%3A%2F%2Flh7-us.googleusercontent.com%2Fwvf252whPErQDMQi8LiS_5werbHEIKWWfyDZYinKcrQnNe2CX6rRmm8ahfyPT101I0YggS-h0nkaIENBysIHJfy8ztNSJIl1Q4LQaJWZeDMTO0bLNk9iREvcWBI3wd-q1Q_qdDCZQPL5L53vqAKi6P4&w=1920&q=75)

## Overview

We'll do the following steps: 
- **Step 1: Define a JSON Dataset** - Define the email dataset.
- **Step 2: Define Fields for the Reranking** - Select which fields should be considered by the model.
- **Step 3: Call the Rerank Endpoint** - Pull results deemed most relevant to two sample queries.

## Setup

We start by installing the Cohere SDK.


```python
! pip install cohere -q
```

Fill in your Cohere API key in the next cell. To do this, begin by [signing up to Cohere](https://os.cohere.ai/) (for free!) if you haven't yet. Then get your API key [here](https://dashboard.cohere.com/api-keys).


```python
import cohere

# Paste your API key here. Remember to not share publicly
co = cohere.Client("COHERE_API_KEY")
```

## Step 1: Define a JSON Dataset

We begin by creating our dataset, which is a Python list of JSON objects.  Each JSON object is a different email with five fields. 


```python
emails = [
    {
        "from": "Paul Doe <paul_fake_doe@oracle.com>",
        "to": ["Steve <steve@me.com>", "lisa@example.com"],
        "date": "2024-03-27",
        "subject": "Follow-up",
        "text": "We are happy to give you the following pricing for your project."
    },
    {
        "from": "John McGill <john_fake_mcgill@microsoft.com>",
        "to": ["Steve <steve@me.com>"],
        "date": "2024-03-28",
        "subject": "Missing Information",
        "text": "Sorry, but here is the pricing you asked for for the newest line of your models."
    },
    {
        "from": "John McGill <john_fake_mcgill@microsoft.com>",
        "to": ["Steve <steve@me.com>"],
        "date": "2024-02-15",
        "subject": "Commited Pricing Strategy",
        "text": "I know we went back and forth on this during the call but the pricing for now should follow the agreement at hand."
    },
    {
        "from": "Generic Airline Company<no_reply@generic_airline_email.com>",
        "to": ["Steve <steve@me.com>"],
        "date": "2023-07-25",
        "subject": "Your latest flight travel plans",
        "text": "Thank you for choose to fly Generic Airline Company. Your booking status is confirmed."
    },
    {
        "from": "Generic SaaS Company<marketing@generic_saas_email.com>",
        "to": ["Steve <steve@me.com>"],
        "date": "2024-01-26",
        "subject": "How to build generative AI applications using Generic Company Name",
        "text": "Hey Steve! Generative AI is growing so quickly and we know you want to build fast!"
    },
    {
        "from": "Paul Doe <paul_fake_doe@oracle.com>",
        "to": ["Steve <steve@me.com>", "lisa@example.com"],
        "date": "2024-04-09",
        "subject": "Price Adjustment",
        "text": "Re: our previous correspondence on 3/27 we'd like to make an amendment on our pricing proposal. We'll have to decrease the expected base price by 5%."
    },
]
```

## Step 2: Define Fields for the Reranking

Next, we define which fields we want to include for the reranking. In this case, we will use all fields.


```python
rank_fields = ["from", "to", "date", "subject", "text"]
```

## Step 3: Call the Rerank Endpoint

Now we are ready to call the Rerank endpoint, which will help us to find emails that are relevant to a particular query.

We'll begin with a query about pricing from Microsoft (MS). 


```python
query = "What is the pricing that we received from MS?"
```

To pull relevant emails, the model needs to combine information from the `"to"` field (e.g., `"john_fake_mcgill@microsoft.com"`) and the `"text"` field (e.g., `"Sorry, but here is the pricing you asked for ..."`). 

We call the Rerank endpoint with `co.rerank()` and use five parameters: 
- `query` - The query that we will use to find relevant documents
- `documents` -  The set of documents (or, in this case, emails) to rerank
- `top_n` - The number of most relevant documents to return
- `model` - For this data, we need to use 'rerank-english-v3.0', Cohere's latest English reranking model 
- `rank_fields` - The keys we would like to have considered for reranking

The next code cell prints the two emails deemed most relevant by the Rerank endpoint, in decreasing order of relevance. It correctly pulled the relevant emails, and in the correct order.


```python
results = co.rerank(query=query, 
                    documents=emails, 
                    top_n=2,
                    model='rerank-english-v3.0', 
                    rank_fields=rank_fields)

for hit in results.results:
    email = emails[hit.index]
    print(email)
```

    {'from': 'John McGill <john_fake_mcgill@microsoft.com>', 'to': ['Steve <steve@me.com>'], 'date': '2024-03-28', 'subject': 'Missing Information', 'text': 'Sorry, but here is the pricing you asked for for the newest line of your models.'}
    {'from': 'John McGill <john_fake_mcgill@microsoft.com>', 'to': ['Steve <steve@me.com>'], 'date': '2024-02-15', 'subject': 'Commited Pricing Strategy', 'text': 'I know we went back and forth on this during the call but the pricing for now should follow the agreement at hand.'}


Now we'll work with another query, this time asking for the pricing from Oracle.


```python
query = "Which pricing did we get from Oracle"
```

We call the Rerank endpoint a second time and print the results. Again, the model returns a correct result.


```python
results = co.rerank(query=query, 
                    documents=emails, 
                    top_n=2, 
                    model='rerank-english-v3.0', 
                    rank_fields=rank_fields)

print("Query:", query)
for hit in results.results:
    email = emails[hit.index]
    print(email)
```

    Query: Which pricing did we get from Oracle
    {'from': 'Paul Doe <paul_fake_doe@oracle.com>', 'to': ['Steve <steve@me.com>', 'lisa@example.com'], 'date': '2024-03-27', 'subject': 'Follow-up', 'text': 'We are happy to give you the following pricing for your project.'}
    {'from': 'Paul Doe <paul_fake_doe@oracle.com>', 'to': ['Steve <steve@me.com>', 'lisa@example.com'], 'date': '2024-04-09', 'subject': 'Price Adjustment', 'text': "Re: our previous correspondence on 3/27 we'd like to make an amendment on our pricing proposal. We'll have to decrease the expected base price by 5%."}


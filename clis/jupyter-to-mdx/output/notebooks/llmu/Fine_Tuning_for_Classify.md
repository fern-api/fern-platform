<a target="_blank" href="https://colab.research.google.com/github/cohere-ai/notebooks/blob/main/notebooks/llmu/Fine_Tuning_for_Classify.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

# Fine-Tuning for Classify

Cohere's large language models (LLMs) have been pre-trained with a vast amount of training data, allowing them to capture how words are being used and how their meaning changes depending on the context. 

However, there are many cases in which getting the best model performance requires performing an additional round of training on custom user data. Creating a custom model using this process is called fine-tuning.

Fine-tuning allows you to alter the model itself and customize it to excel at your specific task. In this notebook, you'll learn how to fine-tune a model for classification.

## Overview

We'll do the following steps:
- **Step 1: Prepare the Dataset** - Download the dataset, select a subset, and prepare it for the Classify endpoint.
- **Step 2: Fine-Tune the Model** - Kick off a fine-tuning job, and confirm when the model has completed training.
- **Step 3: Use/Evaluate the Fine-Tuned Model** - Evaluate the fine-tuned model's performance on the test dataset.

## Setup

We'll start by installing the tools we'll need and then importing them.


```python
! pip install cohere -q
```


```python
# Import the required modules
import os
import json
import cohere
import numpy as np
import pandas as pd
from cohere import ClassifyExample
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.metrics import f1_score
```

Fill in your Cohere API key in the next cell. To do this, begin by [signing up to Cohere](https://os.cohere.ai/) (for free!) if you haven't yet. Then get your API key [here](https://dashboard.cohere.com/api-keys).


```python
# Paste your API key here. Remember to not share publicly
co = cohere.Client("COHERE_API_KEY") # Insert your Cohere API key
```

## Step 1: Prepare the Dataset

We'll use the [Airline Travel Information System (ATIS)](https://www.kaggle.com/datasets/hassanamin/atis-airlinetravelinformationsystem?select=atis_intents_train.csv) intent classification dataset [[source](https://aclanthology.org/H90-1021/)]. For demonstration purposes, we’ll take just a small portion of the dataset: 1,000 data points in total.


```python
# Load the dataset to a dataframe
df = pd.read_csv('https://raw.githubusercontent.com/cohere-ai/notebooks/main/notebooks/data/atis_subset.csv', names=['query','intent'])
print("Number of entries:", len(df))
df.head()
```

    Number of entries: 1000





<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>query</th>
      <th>intent</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>i want to fly from boston at 838 am and arriv...</td>
      <td>atis_flight</td>
    </tr>
    <tr>
      <th>1</th>
      <td>what flights are available from pittsburgh to...</td>
      <td>atis_flight</td>
    </tr>
    <tr>
      <th>2</th>
      <td>what is the arrival time in san francisco for...</td>
      <td>atis_flight_time</td>
    </tr>
    <tr>
      <th>3</th>
      <td>cheapest airfare from tacoma to orlando</td>
      <td>atis_airfare</td>
    </tr>
    <tr>
      <th>4</th>
      <td>round trip fares from pittsburgh to philadelp...</td>
      <td>atis_airfare</td>
    </tr>
  </tbody>
</table>
</div>



The first thing we need is to create a training dataset, to be used for building the classifier, and a test dataset, to be used for testing the classifier performance. We will use 800 and 200 data points for these datasets, respectively.


```python
# Split the dataset into training and test portions
df_train, df_test = train_test_split(df, test_size=200, random_state=21)
```

Our goal is to train the classifier so it can predict the class of a new customer inquiry out of eight classes, as follows:


```python
# View the list of all available categories
intents = df_train.intent.unique().tolist()
print(intents)
```

    ['atis_flight', 'atis_airfare', 'atis_ground_service', 'atis_flight_time', 'atis_airline', 'atis_quantity', 'atis_abbreviation', 'atis_aircraft']


We transform the data to JSONL format to match the style expected by the Classification endpoint ([documentation](https://docs.cohere.com/docs/classify-preparing-the-data)).


```python
def create_classification_data(text, label):
    formatted_data = {
        "text": text,
        "label": label
    }
    return formatted_data

if not os.path.isfile("data.jsonl"):
    print("Creating jsonl file ...")
    with open("data.jsonl", 'w+') as file:
        for row in df_train.itertuples():
            formatted_data = create_classification_data(row.query, row.intent)
            file.write(json.dumps(formatted_data) + '\n')
        file.close()
        print("Done")
else:
    print("data.jsonl file already exists")
```

    Creating jsonl file ...
    Done


The JSONL file has a row for each example.  Each example has "text" and "label" fields.


```python
# Load jsonl file and print first 5 lines
N = 5
with open("data.jsonl") as f:
    for i in range(0, N):
        print(f.readline(), end = '')
```

    {"text": " what flights go from newark to boston after 5 pm", "label": "atis_flight"}
    {"text": " can you show me economy class one way fares for flights from oakland to dallas on december sixteenth", "label": "atis_airfare"}
    {"text": " show me the latest flight from salt lake city to phoenix", "label": "atis_flight"}
    {"text": " pittsburgh to denver", "label": "atis_flight"}
    {"text": " show me all flights from san francisco to atlanta", "label": "atis_flight"}


## Step 2: Fine-Tune the Model

We kick off a fine-tuning job by navigating to the [fine-tuning tab of the Dashboard](https://dashboard.cohere.com/fine-tuning).  Under "Classify", click on "Create a Classify model".

<img src="https://files.readme.io/48dad78-cohere_dashboard.png">

Next, upload the `.jsonl` file you just created as the training set by clicking on the "TRAINING SET" button. When ready, click on "Review data" to proceed to the next step.

<img src="https://files.readme.io/9c83f64-classify_data.png">

Then, you'll see a preview of how the model will ingest your data. If anything is wrong with the data, the page will also provide suggested changes to fix the training file. Otherwise, if everything looks good, you can proceed to the next step.

<img src="https://files.readme.io/d14803d-atis_review_data.png">

Finally, you'll see a page where you'll provide a nickname to your model. We used `atis-classify-ft` as the nickname for our model. Under "BASE MODEL", ensure "english" is selected.

<img src="https://files.readme.io/456ba27-model_nickname_select.png">

Then click on "Start training" to kick off the fine-tuning process. This will navigate you to a page where you can monitor the status of the model. A model that has finished fine-tuning will show the status as `READY`.

<img src="https://files.readme.io/48a2e02-atis_model_ready.png">

## Step 3: Use/Evaluate the Fine-Tuned Model

Once the model has finished fine-tuning, it’s time to evaluate its performance. Navigate to the API tab of the fine-tuned model. There, you'll see the model ID that you should use when calling `co.classify()`.

<img src="https://files.readme.io/580ff8c-get_model_ID.png">

We fill in the model ID to generate test predictions.


```python
# Generate classification predictions on the test dataset using the finetuned model

# Classification function
def classify_text_finetune(texts):
    classifications = co.classify(
        model='b2c94ac3-7a74-4de7-a11a-9808a3b8ef59-ft',
        inputs=texts,
        examples=None
    ).classifications
    return [c.predictions[0] for c in classifications]

# Create batches of texts and classify them
BATCH_SIZE = 90 # The API accepts a maximum of 96 inputs
y_pred = []
for i in range(0, len(df_test), BATCH_SIZE):
    batch_texts = df_test["query"][i:i+BATCH_SIZE].tolist()
    y_pred.extend(classify_text_finetune(batch_texts))
```

Next, we calculate the model's test accuracy and F1 score.


```python
# Compute metrics on the test dataset
accuracy = accuracy_score(df_test["intent"], y_pred)
f1 = f1_score(df_test["intent"], y_pred, average='weighted')

print(f'Accuracy: {100*accuracy:.2f}')
print(f'F1-score: {100*f1:.2f}')
```

    Accuracy: 98.00
    F1-score: 98.05


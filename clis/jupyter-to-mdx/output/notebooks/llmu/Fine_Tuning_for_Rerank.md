# Fine-Tuning for Rerank

Cohere's Rerank endpoint is a sophisticated semantic relevance scoring and ranking system that optimizes search results by evaluating the contextual relationship between queries and passages.

However, complex domains are a special challenge due to their intricate terminology, context, and domain-specific knowledge requirements. These domains include legal documents, medical research papers, scientific literature, technical manuals, developer documentation, code, financial reports, and other fields that demand a deep understanding of specific jargon and intricate concepts. These domains often necessitate fine-tuning on custom data to ensure the models capture the nuances and expertise essential for accurate comprehension.

To understand the importance of domain-specific training, we will work with a code example utilizing a dataset in the legal domain. You'll see how fine-tuning can dramatically increase model accuracy.

## Overview

We'll do the following steps:
- **Step 1: Prepare the Dataset** - Download the dataset, select a subset, and prepare it for the Rerank endpoint.
- **Step 2: Assess the Pre-Trained Model** - Calculate the test accuracy of the pre-trained model.
- **Step 3: Fine-Tune the Model** - Kick off a fine-tuning job, and confirm when the model has completed training.
- **Step 4: Evaluate the Fine-Tuned Model** - Evaluate the fine-tuned model's performance on the test dataset.

## Setup

We'll start by installing the tools we'll need and then importing them.


```python
! pip install cohere jsonlines datasets -q
```


```python
import os
import cohere
import json
import jsonlines
import pandas as pd
from sklearn.model_selection import train_test_split
from datasets import load_dataset
```

Fill in your Cohere API key in the next cell. To do this, begin by [signing up to Cohere](https://os.cohere.ai/) (for free!) if you haven't yet. Then get your API key [here](https://dashboard.cohere.com/api-keys).


```python
# Paste your API key here. Remember to not share publicly
co = cohere.Client("COHERE_API_KEY")
```

## Step 1: Prepare the Dataset

We begin by downloading [the CaseHOLD dataset](https://huggingface.co/datasets/casehold/casehold) from Hugging Face. CaseHOLD is a multiple choice Q&A task consisting of legal decisions referencing other decisions as precedents, called a holding statement. It's a challenging task that demands specialized legal expertise to solve.

<img src="https://cohere.com/_next/image?url=https%3A%2F%2Fcohere-ai.ghost.io%2Fcontent%2Fimages%2F2023%2F09%2FUntitled.png&w=3840&q=75">

We define it as an [IterableDataset](https://huggingface.co/docs/datasets/en/about_mapstyle_vs_iterable) to load only a small fraction of examples at a time and avoid loading the entire dataset in memory.


```python
iterable_dataset = load_dataset("casehold/casehold", split="train", streaming=True, trust_remote_code=True)
```

For this example, we'll use a subset of only 420 data points, to be split across training, validation and test sets.

The data is stored in a Pandas DataFrame `df` with 5 columns:
- `"query"` - The search query or question (in the image above, this corresponds to the "citing text" or "prompt")
- `"docs"` - A list of five documents, where only one correctly answers the query (in the image above, all five "holding statements")
- `"label"` - The index of the document that correctly answers the query (in the example in the image above, would be "0", corresponding to holding statement 0)
- `"relevant_passages"` - The document that correctly answers the query
- `"hard_negatives"`- The four documents that don't correctly answer the query


```python
# Size of data subset
num_examples = 420

# Labels for columns containing the 5 documents in raw dataset file
all_labels = ["holding_" + s for s in ["0", "1", "2", "3", "4"]]

# Instantiate list containing the data
d = []

# Store each dataset entry as dictionary within Python list
for example in iterable_dataset.take(num_examples):
    selected_passage_idx = "holding_{}".format(example["label"])
    hard_negatives_idx = [x for x in all_labels if x != selected_passage_idx]
    d.append(
        {
            'query': example["citing_prompt"],
            'docs': [example.get(key) for key in all_labels],
            'label': int(example["label"]),
            'relevant_passages': [example[selected_passage_idx]],
            'hard_negatives': [example.get(key) for key in hard_negatives_idx]
        }
    )

# Convert list to Pandas dataframe, preview the dataframe
df = pd.DataFrame(d)
df.head()
```




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
      <th>docs</th>
      <th>label</th>
      <th>relevant_passages</th>
      <th>hard_negatives</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>Drapeau’s cohorts, the cohort would be a “vict...</td>
      <td>[holding that possession of a pipe bomb is a c...</td>
      <td>0</td>
      <td>[holding that possession of a pipe bomb is a c...</td>
      <td>[holding that bank robbery by force and violen...</td>
    </tr>
    <tr>
      <th>1</th>
      <td>Colameta used customer information that he too...</td>
      <td>[recognizing that even if a plaintiff claims c...</td>
      <td>1</td>
      <td>[holding that included among trade secrets emp...</td>
      <td>[recognizing that even if a plaintiff claims c...</td>
    </tr>
    <tr>
      <th>2</th>
      <td>property tax sale. In reviewing section 6323(b...</td>
      <td>[holding that where there is a conflict betwee...</td>
      <td>4</td>
      <td>[holding that a specific statutory provision p...</td>
      <td>[holding that where there is a conflict betwee...</td>
    </tr>
    <tr>
      <th>3</th>
      <td>They also rely on Oswego Laborers’ Local 214 P...</td>
      <td>[holding that plaintiff stated a  349 claim wh...</td>
      <td>0</td>
      <td>[holding that plaintiff stated a  349 claim wh...</td>
      <td>[holding that plaintiff stated a claim for bre...</td>
    </tr>
    <tr>
      <th>4</th>
      <td>did not affect the defendant’s guideline range...</td>
      <td>[holding that united states v booker 543 us 22...</td>
      <td>3</td>
      <td>[holding that united states v booker 543 us 22...</td>
      <td>[holding that united states v booker 543 us 22...</td>
    </tr>
  </tbody>
</table>
</div>



We next split the data into training, validation, and test sets.


```python
# Set number of examples for train-valid-test split
train_num = 256
valid_num = 154
test_num = 10

# Do train-validation-test split
df_train = df[:train_num].copy()
df_valid = df[train_num:train_num+valid_num].copy()
df_test = df[train_num+valid_num:].copy()

print('Size of training set:', len(df_train))
print('Size of validation set:', len(df_valid))
print('Size of test set:', len(df_test))
```

    Size of training set: 256
    Size of validation set: 154
    Size of test set: 10


## Step 2: Assess the Pre-Trained Model

We'll now check the test accuracy of the pre-trained model. The `get_prediction()` function looks at a test example and uses the pre-trained model to predict the index of the document that it believes correctly answers the query.

To get predictions, we'll use the [`rerank()` method](https://docs.cohere.com/reference/rerank-1) of the Cohere client and supply four arguments:
- `model` - We will use [`rerank-english-v3.0`](https://docs.cohere.com/docs/rerank-2), Cohere's newest and most powerful pre-trained model for re-ranking English language documents
- `query` - The search query or question
- `documents` - List of documents to choose from
- `top_n` - Number of documents to return


```python
# Predict index of document that corrrectly answers query
def get_prediction(item, model="rerank-english-v3.0"):
    response = co.rerank(model=model,
                         query=item["query"],
                         documents=item["docs"],
                         top_n=1)
    prediction = response.results[0].index
    return prediction
```

We apply this function to every row in the test set and save the predictions in new column `"baseline_prediction"`. Then, to calculate the test accuracy, we compare the predictions to the ground truth labels in the `"label"` column.


```python
# Calculate pre-trained model's test accuracy
df_test["baseline_prediction"] = df_test.apply(get_prediction, axis=1)
print("Baseline accuracy:", sum(df_test["baseline_prediction"] == df_test["label"])/len(df_test))
```

    Baseline accuracy: 0.6


The pre-trained model gets 60% accuracy, which isn't bad!  But we can do better with fine-tuning.

## Step 3: Fine-Tune the Model

To prepare for fine-tuning with the Rerank endpoint, we'll need to convert the data to jsonl format, where each row is an example with three items:
- `"query"` - The search query or question
- `"relevant_passages"` - The document that correctly answers the query
- `"hard_negatives"`- The four documents that incorrectly answer the query

We do this separately for training and validation data. You can learn more about preparing the Rerank fine-tuning data in [the documentation](https://docs.cohere.com/docs/rerank-preparing-the-data).


```python
# Arranges the data to suit Cohere's format
def create_rerank_ft_data(query, relevant_passages, hard_negatives):
    formatted_data = {
        "query": query,
        "relevant_passages": relevant_passages,
        "hard_negatives": hard_negatives
    }
    return formatted_data

# Creates jsonl file if does not already exist
def create_jsonl_from_list(file_name, df):
    path = f'{file_name}.jsonl'
    if not os.path.isfile(path):
        with open(path, 'w+') as file:
            for idx, row in df.iterrows():
                formatted_data = create_rerank_ft_data(row["query"], row["relevant_passages"], row["hard_negatives"])
                file.write(json.dumps(formatted_data) + '\n')
            file.close()

# Create training and validation jsonl files
create_jsonl_from_list("casehold_train", df_train)
create_jsonl_from_list("casehold_valid", df_valid)
```

Next, we preview the first couple lines of the training file.


```python
# List the first 2 items in the training jsonl file
with jsonlines.open('casehold_train.jsonl') as f:
    [print(line) for _, line in zip(range(2), f)]
```

    {'query': "Drapeau’s cohorts, the cohort would be a “victim” of making the bomb. Further, firebombs are inherently dangerous. There is no peaceful purpose for making a bomb. Felony offenses that involve explosives qualify as “violent crimes” for purposes of enhancing the sentences of career offenders. See 18 U.S.C. § 924(e)(2)(B)(ii) (defining a “violent felony” as: “any crime punishable by imprisonment for a term exceeding one year ... that ... involves use of explosives”). Courts have found possession of a'bomb to be a crime of violence based on the lack of a nonviolent purpose for a bomb and the fact that, by its very nature, there is a substantial risk that the bomb would be used against the person or property of another. See United States v. Newman, 125 F.3d 863 (10th Cir.1997) (unpublished) (<HOLDING>); United States v. Dodge, 846 F.Supp. 181,", 'relevant_passages': ['holding that possession of a pipe bomb is a crime of violence for purposes of 18 usc  3142f1'], 'hard_negatives': ['holding that bank robbery by force and violence or intimidation under 18 usc  2113a is a crime of violence', 'holding that sexual assault of a child qualified as crime of violence under 18 usc  16', 'holding for the purposes of 18 usc  924e that being a felon in possession of a firearm is not a violent felony as defined in 18 usc  924e2b', 'holding that a court must only look to the statutory definition not the underlying circumstances of the crime to determine whether a given offense is by its nature a crime of violence for purposes of 18 usc  16']}
    {'query': 'Colameta used customer information that he took from Protégé. Additionally, Colameta admits to having taken at least two Protégé proposals with him to Monument. This type of information may constitute trade secrets. See G.L.c. 266, §30 (defining “trade secret” as used in G.L.c. 93, §42, as including “anything tangible or intangible or electronically kept or stored, which constitutes, represents, evidences or records a secret scientific, technical, merchandising, production or management information, design, process, procedure, formula, invention or improvement”); Warner-Lambert Co., 427 Mass. at 49 (“ [Confidential and proprietary business information may be entitled to protection, even if such information cannot claim trade secret protection”); see, e.g., Augat, Inc., 409 Mass. at 173 (<HOLDING>). “Matters of public knowledge or of general', 'relevant_passages': ['holding that included among trade secrets employee may not appropriate from employer is certain information such as lists of customers'], 'hard_negatives': ['recognizing that even if a plaintiff claims certain information constitutes trade secrets its claim may not depend on that determination', 'holding that supplier lists can be trade secrets under indianas uniform trade secrets act which uses the same definition of a trade secret as montana', 'recognizing that customer lists may be protectable trade secrets', 'recognizing a legitimate need to protect an employee from disclosing an employers trade secrets or other confidential information to a competitor']}


We kick off a fine-tuning job by navigating to the fine-tuning tab of the Dashboard. Under "Rerank", click on "Create a Rerank model".

<img src="https://files.readme.io/48dad78-cohere_dashboard.png">

Next, upload the .jsonl files you just created as the training and validation sets by clicking on the "TRAINING SET" and "VALIDATION SET" buttons. When ready, click on "Review data" to proceed to the next step.

<img src="https://files.readme.io/4522c16-rerank-review-data.png">

Then, you'll see a preview of how the model will ingest your data. If anything is wrong with the data, the page will also provide suggested changes to fix the training file. Otherwise, if everything looks good, you can proceed to the next step.

<img src="https://files.readme.io/3becc26-rerank-create-finetune.png">

Finally, you'll provide a nickname for your model. We used `casehold-rerank-ft` as the nickname for our model. This page also allows you to provide custom values for the hyperparameters used during training, but we'll keep them at the default values for now.

<img src="https://files.readme.io/ea79369-casehold-rerank-ft.png">

Once you have filled in a name, click on "Start training" to kick off the fine-tuning process. This will navigate you to a page where you can monitor the status of the model. A model that has finished fine-tuning will show the status as `READY`.

<img src="https://files.readme.io/eb7d390-rerank_ready.png">

## Step 4: Evaluate the Fine-Tuned Model

Once the model has completed the fine-tuning process, it’s time to evaluate its performance.

Navigate to the API tab of the fine-tuned model. There, you'll see the model ID that you should use when calling `co.rerank()`.

<img src="https://files.readme.io/2d7ffbc-rerank-call-model.png">

In the following code, we calculate the test accuracy of the fine-tuned model. We use the same `get_prediction()` function as before, but now just need to pass in the fine-tuned model ID.


```python
# Calculate fine-tuned model's test accuracy
df_test['ft_prediction'] = df_test.apply(get_prediction, model='9f22e08a-f1ab-4cee-9524-607dcb08c954-ft', axis=1)
print("Fine-tune accuracy:", sum(df_test["ft_prediction"] == df_test["label"])/len(df_test))
```

    Fine-tune accuracy: 0.8


Remember the pre-trained model had an accuracy of 60%, and so a test accuracy of 80% is a strong level of improvment. Note that for simplicity, this notebook uses a very small dataset, with only ten examples in the test set. But if you can use the same process detailed here to fine-tune Rerank for a much larger dataset.

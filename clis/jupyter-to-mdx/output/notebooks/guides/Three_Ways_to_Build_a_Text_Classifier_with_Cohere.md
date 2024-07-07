# Three Ways to Build a Text Classifier with Cohere.ipynb

With LLMs, instead of having to prepare thousands of training data points, you can get up and running with just a handful of examples, called *few-shot* classification. Having said that, you probably want to have a certain level of control over how you train a classifier, and especially, how to get the best performance out of a model. For example, if you do happen to have a large dataset at your disposal, you will want to make full use of it when training a classifier. With the Cohere API, we want to give this flexibility to developers.

***Read the accompanying [blog post here.](https://txt.cohere.ai/classify-three-options/)***

![[Blog] Three Ways to Build a Text Classifier with the Cohere API](https://github.com/cohere-ai/notebooks/raw/main/notebooks/images/classify-three-options/classify-options-feat.png)


```python
# TODO: upgrade to "cohere>5"! pip install "cohere<5" > /dev/null
```


```python
# Import the required modules
import cohere
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.metrics import f1_score
```


```python
# Set up the Cohere client
api_key = 'apikey' # Paste your API key here. Remember to not share it publicly 
co = cohere.Client(api_key)
```

# Prepare the Dataset

We'll use a subset of the [Airline Travel Information System (ATIS)](https://www.kaggle.com/datasets/hassanamin/atis-airlinetravelinformationsystem?select=atis_intents_train.csv) intent classification dataset. [[Source](https://aclanthology.org/H90-1021/)]


```python
# Load the dataset to a dataframe
df = pd.read_csv('https://raw.githubusercontent.com/cohere-ai/notebooks/main/notebooks/data/atis_subset.csv',names=['query','intent'])
df.head()
```





  <div id="df-1bbf40a0-666e-4c4d-9969-39f995fae4c6">
    <div class="colab-df-container">
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
      <button class="colab-df-convert" onclick="convertToInteractive('df-1bbf40a0-666e-4c4d-9969-39f995fae4c6')"
              title="Convert this dataframe to an interactive table."
              style="display:none;">

  <svg xmlns="http://www.w3.org/2000/svg" height="24px"viewBox="0 0 24 24"
       width="24px">
    <path d="M0 0h24v24H0V0z" fill="none"/>
    <path d="M18.56 5.44l.94 2.06.94-2.06 2.06-.94-2.06-.94-.94-2.06-.94 2.06-2.06.94zm-11 1L8.5 8.5l.94-2.06 2.06-.94-2.06-.94L8.5 2.5l-.94 2.06-2.06.94zm10 10l.94 2.06.94-2.06 2.06-.94-2.06-.94-.94-2.06-.94 2.06-2.06.94z"/><path d="M17.41 7.96l-1.37-1.37c-.4-.4-.92-.59-1.43-.59-.52 0-1.04.2-1.43.59L10.3 9.45l-7.72 7.72c-.78.78-.78 2.05 0 2.83L4 21.41c.39.39.9.59 1.41.59.51 0 1.02-.2 1.41-.59l7.78-7.78 2.81-2.81c.8-.78.8-2.07 0-2.86zM5.41 20L4 18.59l7.72-7.72 1.47 1.35L5.41 20z"/>
  </svg>
      </button>

  <style>
    .colab-df-container {
      display:flex;
      flex-wrap:wrap;
      gap: 12px;
    }

    .colab-df-convert {
      background-color: #E8F0FE;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: none;
      fill: #1967D2;
      height: 32px;
      padding: 0 0 0 0;
      width: 32px;
    }

    .colab-df-convert:hover {
      background-color: #E2EBFA;
      box-shadow: 0px 1px 2px rgba(60, 64, 67, 0.3), 0px 1px 3px 1px rgba(60, 64, 67, 0.15);
      fill: #174EA6;
    }

    [theme=dark] .colab-df-convert {
      background-color: #3B4455;
      fill: #D2E3FC;
    }

    [theme=dark] .colab-df-convert:hover {
      background-color: #434B5C;
      box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.15);
      filter: drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.3));
      fill: #FFFFFF;
    }
  </style>

      <script>
        const buttonEl =
          document.querySelector('#df-1bbf40a0-666e-4c4d-9969-39f995fae4c6 button.colab-df-convert');
        buttonEl.style.display =
          google.colab.kernel.accessAllowed ? 'block' : 'none';

        async function convertToInteractive(key) {
          const element = document.querySelector('#df-1bbf40a0-666e-4c4d-9969-39f995fae4c6');
          const dataTable =
            await google.colab.kernel.invokeFunction('convertToInteractive',
                                                     [key], {});
          if (!dataTable) return;

          const docLinkHtml = 'Like what you see? Visit the ' +
            '<a target="_blank" href=https://colab.research.google.com/notebooks/data_table.ipynb>data table notebook</a>'
            + ' to learn more about interactive tables.';
          element.innerHTML = '';
          dataTable['output_type'] = 'display_data';
          await google.colab.output.renderOutput(dataTable, element);
          const docLink = document.createElement('div');
          docLink.innerHTML = docLinkHtml;
          element.appendChild(docLink);
        }
      </script>
    </div>
  </div>





```python
# Split the dataset into training and test portions
# Training = For use in Sections 2 and 3
# Test = For evaluating the classifier performance
X, y = df["query"], df["intent"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=200, random_state=21)
```


```python
# View the list of all available categories
intents = y_train.unique().tolist()
print(intents)
```

    ['atis_flight', 'atis_airfare', 'atis_ground_service', 'atis_flight_time', 'atis_airline', 'atis_quantity', 'atis_abbreviation', 'atis_aircraft']


# 1 - Few-shot classification with the Classify endpoint

Few-shot here means we just need to supply a few examples per class and have a decent classifier working. With Cohere’s Classify endpoint, the ‘training’ dataset is referred to as *examples*. The minimum number of examples per class is two, where each example consists of a text (in our case, the `query`), and a label (in our case, the `label`). More examples are better though, and in our case, we'll use six examples per class.

## Prepare the examples


```python
# Set the number of examples per category
EX_PER_CAT = 6

# Create list of examples containing texts and labels - sample from the dataset
ex_texts, ex_labels = [], []
for intent in intents:
  y_temp = y_train[y_train == intent]
  sample_indexes = y_temp.sample(n=EX_PER_CAT, random_state=42).index
  ex_texts += X_train[sample_indexes].tolist()
  ex_labels += y_train[sample_indexes].tolist()

print(f'Number of examples per class: {EX_PER_CAT}')
print(f'Number of classes: {len(intents)}')
print(f'Total number of examples: {len(ex_texts)}')
```

    Number of examples per class: 6
    Number of classes: 8
    Total number of examples: 48


## Get classifications via the Classify endpoint


```python
# Collate the examples via the Example module
from cohere.responses.classify import Example

examples = list()
for txt, lbl in zip(ex_texts,ex_labels):
  examples.append(Example(txt,lbl))
```


```python
# Generate classification predictions on the test dataset

# Classification function
def classify_text(texts, examples):
    classifications = co.classify(
        inputs=texts,
        examples=examples
    )
    return [c.predictions[0] for c in classifications]

# Create batches of texts and classify them
BATCH_SIZE = 90 # The API accepts a maximum of 96 inputs
y_pred = []
for i in range(0, len(X_test), BATCH_SIZE):
    batch_texts = X_test[i:i+BATCH_SIZE].tolist()
    y_pred.extend(classify_text(batch_texts, examples))

```


```python
# Compute metrics on the test dataset
accuracy = accuracy_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred, average='weighted')

print(f'Accuracy: {100*accuracy:.2f}')
print(f'F1-score: {100*f1:.2f}')
```

    Accuracy: 83.00
    F1-score: 84.66


# 2 - Build your own classifier with the Embed endpoint

In this section, we’ll look at how we can use the Embed endpoint to build a classifier. We are going to build a classification model using these embeddings as inputs. For this, we’ll use the Support Vector Machine (SVM) algorithm.

## Generate embeddings for the input text


```python
# Get embeddings
def embed_text(text):
  output = co.embed(
                model='embed-english-v3.0',
                input_type="classification",
                texts=text)
  return output.embeddings

# Embed and prepare the inputs
X_train_emb = np.array(embed_text(X_train.tolist()))
X_test_emb = np.array(embed_text(X_test.tolist()))
```

## Get classifications via the SVM algorithm


```python
# Import modules
from sklearn.svm import SVC
from sklearn import preprocessing

# Prepare the labels
le = preprocessing.LabelEncoder()
le.fit(y_train)
y_train_le = le.transform(y_train)
y_test_le = le.transform(y_test)

# Initialize the model
svm_classifier = SVC(class_weight='balanced')

# Fit the training dataset to the model
svm_classifier.fit(X_train_emb, y_train_le)
```




    SVC(class_weight='balanced')




```python
# Generate classification predictions on the test dataset
y_pred_le = svm_classifier.predict(X_test_emb)
```


```python
# Compute metrics on the test dataset
accuracy = accuracy_score(y_test_le, y_pred_le)
f1 = f1_score(y_test_le, y_pred_le, average='weighted')

print(f'Accuracy: {100*accuracy:.2f}')
print(f'F1-score: {100*f1:.2f}')
```

    Accuracy: 91.50
    F1-score: 91.01


# 3 - Finetuning a model

In this section, we build a custom model that’s finetuned to excel at a specific task, and potentially outperforming the previous two approaches we have seen.

## Prepare dataset


```python
# Download the training dataset for finetuning
df_train = pd.concat([X_train, y_train],axis=1)
df_train.to_csv("atis_finetune.csv", index=False)
```

## Create a finetuned model

Creating the finetune is done is the Playground. Refer to [this guide](https://docs.cohere.ai/finetuning-representation-models) for the finetuning steps.

## Get classifications via the Classify endpoint


```python
# Generate classification predictions on the test dataset using the finetuned model

# Classification function
def classify_text_finetune(texts, examples):
    classifications = co.classify(
        model='eeba7d8c-61bd-42cd-a6b5-e31db27403cc-ft', 
        inputs=texts,
        examples=examples
    )
    return [c.predictions[0] for c in classifications]

# Create batches of texts and classify them
BATCH_SIZE = 90 # The API accepts a maximum of 96 inputs
y_pred = []
for i in range(0, len(X_test), BATCH_SIZE):
    batch_texts = X_test[i:i+BATCH_SIZE].tolist()
    y_pred.extend(classify_text_finetune(batch_texts, examples))
```


```python
# Compute metrics on the test dataset
accuracy = accuracy_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred, average='weighted')

print(f'Accuracy: {100*accuracy:.2f}')
print(f'F1-score: {100*f1:.2f}')
```

    Accuracy: 94.50
    F1-score: 94.53


We have now seen how the different options compare performance-wise. And crucially, what’s important to note is the level of control that you have when working with the Classify endpoint.

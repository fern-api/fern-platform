<a target="_blank" href="https://colab.research.google.com/github/cohere-ai/notebooks/blob/main/notebooks/llmu/Classify_Endpoint.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

# The Classify Endpoint

In the text classification space, a trend is emerging where developers and teams are leveraging large language models (LLMs) when building an AI-based classifier system. This is opposed to building a system from scratch on their own, which first, requires the team to have the know-how in machine learning and engineering, and second, requires a huge amount of labeled training data to build a working solution.

With LLMs, instead of having to prepare thousands of training data points, you can get up and running with just a handful of examples per class, called few-shot classification.

In this notebook, you'll learn how to build a classifier with Cohere's Classify endpoint through few-shot learning. This notebook accompanies the [Classify endpoint lesson](https://docs.cohere.com/docs/classify-endpoint/) of LLM University.

## Setup

We'll start by installing the tools we'll need and then importing them.


```python
! pip install cohere -q
```


```python
import cohere
from cohere import ClassifyExample
```

Fill in your Cohere API key in the next cell. To do this, begin by [signing up to Cohere](https://os.cohere.ai/) (for free!) if you haven't yet. Then get your API key [here](https://dashboard.cohere.com/api-keys).


```python
# Paste your API key here. Remember to not share publicly
co = cohere.Client("COHERE_API_KEY") 
```

## Prepare Examples and Input

A typical machine learning model requires many training examples to perform text classification, but with the Classify endpoint, you can get started with as few as 5 examples per class.


```python
# Create the training examples for the classifier
examples = [ClassifyExample(text="I’m so proud of you", label="positive"), 
            ClassifyExample(text="What a great time to be alive", label="positive"), 
            ClassifyExample(text="That’s awesome work", label="positive"), 
            ClassifyExample(text="The service was amazing", label="positive"), 
            ClassifyExample(text="I love my family", label="positive"), 
            ClassifyExample(text="They don't care about me", label="negative"), 
            ClassifyExample(text="I hate this place", label="negative"), 
            ClassifyExample(text="The most ridiculous thing I've ever heard", label="negative"), 
            ClassifyExample(text="I am really frustrated", label="negative"), 
            ClassifyExample(text="This is so unfair", label="negative"),
            ClassifyExample(text="This made me think", label="neutral"), 
            ClassifyExample(text="The good old days", label="neutral"), 
            ClassifyExample(text="What's the difference", label="neutral"), 
            ClassifyExample(text="You can't ignore this", label="neutral"), 
            ClassifyExample(text="That's how I see it", label="neutral")]
```


```python
# Enter the inputs to be classified
inputs = ["Hello, world! What a beautiful day",
          "It was a great time with great people",
          "Great place to work",
          "That was a wonderful evening",
          "Maybe this is why",
          "Let's start again",
          "That's how I see it",
          "These are all facts",
          "This is the worst thing",
          "I cannot stand this any longer",
          "This is really annoying",
          "I am just plain fed up"]
```

## Generate Predictions


```python
def classify_text(inputs, examples):
    """
    Classifies a list of input texts given the examples
    Arguments:
        model (str): identifier of the model
        inputs (list[str]): a list of input texts to be classified
        examples (list[Example]): a list of example texts and class labels
    Returns:
        classifications (list): each result contains the text, labels, and conf values
    """
    # Classify text by calling the Classify endpoint
    response = co.classify(
        model='embed-english-v2.0',
        inputs=inputs,
        examples=examples)

    classifications = response.classifications

    return classifications

# Classify the inputs
predictions = classify_text(inputs, examples)
```


```python
# Display the classification outcomes
classes = ["positive", "negative", "neutral"]
for inp,pred in zip(inputs, predictions):
    class_pred = pred.prediction
    class_idx = classes.index(class_pred)
    class_conf = pred.confidence

    print(f"Input: {inp}")
    print(f"Prediction: {class_pred}")
    print(f"Confidence: {class_conf:.2f}")
    print("-"*10)
```

    Input: Hello, world! What a beautiful day
    Prediction: positive
    Confidence: 0.84
    ----------
    Input: It was a great time with great people
    Prediction: positive
    Confidence: 0.99
    ----------
    Input: Great place to work
    Prediction: positive
    Confidence: 0.91
    ----------
    Input: That was a wonderful evening
    Prediction: positive
    Confidence: 0.96
    ----------
    Input: Maybe this is why
    Prediction: neutral
    Confidence: 0.70
    ----------
    Input: Let's start again
    Prediction: neutral
    Confidence: 0.83
    ----------
    Input: That's how I see it
    Prediction: neutral
    Confidence: 1.00
    ----------
    Input: These are all facts
    Prediction: neutral
    Confidence: 0.78
    ----------
    Input: This is the worst thing
    Prediction: negative
    Confidence: 0.93
    ----------
    Input: I cannot stand this any longer
    Prediction: negative
    Confidence: 0.93
    ----------
    Input: This is really annoying
    Prediction: negative
    Confidence: 0.99
    ----------
    Input: I am just plain fed up
    Prediction: negative
    Confidence: 1.00
    ----------


# Using Generation Models for Summarization
This notebook demonstrates a simple way of using Cohere's generation models to summarize text.
<img src="https://github.com/cohere-ai/notebooks/raw/main/notebooks/images/summarization.png"
    style="width:100%; max-width:600px" alt="provided with the right prompt, a language model can generate multiple candidate summaries" />

We will use a simple prompt that includes two examples and a task description:

`"<input phrase>". In summary: "<summary>"`.


```python
# Let's first install Cohere's python SDK
# TODO: upgrade to "cohere>5"!pip install "cohere<5"
```


```python
import cohere
import time
import pandas as pd
# Paste your API key here. Remember to not share it publicly 
api_key = ''
co = cohere.Client(api_key)
```


Our prompt is geared for paraphrasing to simplify an input sentence. It contains two examples. The sentence we want it to summarize is:

**Killer whales have a diverse diet, although individual populations often specialize in particular types of prey.**


```python
prompt = '''"The killer whale or orca (Orcinus orca) is a toothed whale belonging to the oceanic dolphin family, of which it is the largest member"
In summary: "The killer whale or orca is the largest type of dolphin"
---
"It is recognizable by its black-and-white patterned body" 
In summary:"Its body has a black and white pattern"
---
"Killer whales have a diverse diet, although individual populations often specialize in particular types of prey" 
In summary:"'''
print(prompt)
```

    "The killer whale or orca (Orcinus orca) is a toothed whale belonging to the oceanic dolphin family, of which it is the largest member"
    In summary: "The killer whale or orca is the largest type of dolphin"
    ---
    "It is recognizable by its black-and-white patterned body" 
    In summary:"Its body has a black and white pattern"
    ---
    "Killer whales have a diverse diet, although individual populations often specialize in particular types of prey" 
    In summary:"


We get several completions from the model via the API


```python
n_generations = 5

prediction = co.generate(
    model='large',
    prompt=prompt,
    return_likelihoods = 'GENERATION',
    stop_sequences=['"'],
    max_tokens=50,
    temperature=0.7,
    num_generations=n_generations,
    k=0,
    p=0.75)

```


```python
# Get list of generations
gens = []
likelihoods = []
for gen in prediction.generations:
    gens.append(gen.text)
    
    sum_likelihood = 0
    for t in gen.token_likelihoods:
        sum_likelihood += t.likelihood
    # Get sum of likelihoods
    likelihoods.append(sum_likelihood)

```


```python
pd.options.display.max_colwidth = 200
# Create a dataframe for the generated sentences and their likelihood scores
df = pd.DataFrame({'generation':gens, 'likelihood': likelihoods})
# Drop duplicates
df = df.drop_duplicates(subset=['generation'])
# Sort by highest sum likelihood
df = df.sort_values('likelihood', ascending=False, ignore_index=True)
print('Candidate summaries for the sentence: \n"Killer whales have a diverse diet, although individual populations often specialize in particular types of prey."')
df
```

    Candidate summaries for the sentence: 
    "Killer whales have a diverse diet, although individual populations often specialize in particular types of prey."





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
      <th>generation</th>
      <th>likelihood</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>Killer whales have a diverse diet"</td>
      <td>-3.208850</td>
    </tr>
    <tr>
      <th>1</th>
      <td>Its diet is diverse"</td>
      <td>-3.487236</td>
    </tr>
    <tr>
      <th>2</th>
      <td>Their diet is diverse"</td>
      <td>-3.761171</td>
    </tr>
    <tr>
      <th>3</th>
      <td>Different populations have different diets"</td>
      <td>-6.415764</td>
    </tr>
    <tr>
      <th>4</th>
      <td>Their diet consists of a variety of marine life"</td>
      <td>-11.764865</td>
    </tr>
  </tbody>
</table>
</div>



In a lot of cases, better generations can be reached by creating multiple generations then ranking and filtering them. In this case we're ranking the generations by their average likelihoods. 

## Hyperparameters
It's worth spending some time learning the various hyperparameters of the generation endpoint. For example, [temperature](https://docs.cohere.ai/temperature-wiki) tunes the degree of randomness in the generations. Other parameters include [top-k and top-p](https://docs.cohere.ai/token-picking) as well as `frequency_penalty` and `presence_penalty` which can reduce the amount of repetition in the output of the model. See the [API reference of the generate endpoint](https://docs.cohere.ai/generate-reference) for more details on all the parameters.


```python

```

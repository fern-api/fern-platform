<a target="_blank" href="https://colab.research.google.com/github/cohere-ai/notebooks/blob/main/notebooks/What_is_Semantic_Search.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

# What is Semantic Search?

In this notebook, you'll build a semantic search model on a small dataset using Cohere's Embed endpoint.

_Read the accompanying blog post [here](https://docs.cohere.com/docs/what-is-semantic-search)._

## Setup

We'll start by installing the tools we'll need and then importing them.


```python
# Install Cohere for embeddings, Umap to reduce embeddings to 2 dimensions, 
# Altair for visualization, Annoy for approximate nearest neighbor search
!pip install cohere umap-learn altair annoy datasets tqdm -q
```


```python
import cohere
import numpy as np
import re
import pandas as pd
from tqdm import tqdm
from datasets import load_dataset
import umap
import altair as alt
from sklearn.metrics.pairwise import cosine_similarity
from annoy import AnnoyIndex
import warnings
warnings.filterwarnings('ignore')
pd.set_option('display.max_colwidth', None)
```

Fill in your Cohere API key in the next cell. To do this, begin by [signing up to Cohere](https://os.cohere.ai/) (for free!) if you haven't yet. Then get your API key [here](https://dashboard.cohere.com/api-keys).


```python
# Paste your API key here. Remember to not share publicly
co = cohere.Client("COHERE_API_KEY") 
```

## The dataset


```python
qa_df = pd.DataFrame({'text':
  [
   'Where is the world cup?',
   'The world cup is in Qatar',
   'What color is the sky?',
   'The sky is blue',
   'Where does the bear live?',
   'The bear lives in the the woods',
   'What is an apple?',
   'An apple is a fruit',
  ]})

qa_df
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
      <th>text</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>Where is the world cup?</td>
    </tr>
    <tr>
      <th>1</th>
      <td>The world cup is in Qatar</td>
    </tr>
    <tr>
      <th>2</th>
      <td>What color is the sky?</td>
    </tr>
    <tr>
      <th>3</th>
      <td>The sky is blue</td>
    </tr>
    <tr>
      <th>4</th>
      <td>Where does the bear live?</td>
    </tr>
    <tr>
      <th>5</th>
      <td>The bear lives in the the woods</td>
    </tr>
    <tr>
      <th>6</th>
      <td>What is an apple?</td>
    </tr>
    <tr>
      <th>7</th>
      <td>An apple is a fruit</td>
    </tr>
  </tbody>
</table>
</div>



## Creating the embedding


```python
qa = co.embed(texts=list(qa_df['text']), model='embed-english-v3.0', input_type="search_document").embeddings
```

## Plotting the embedding in 2D


```python
# UMAP reduces the dimensions from 1024 to 2 dimensions that we can plot
reducer = umap.UMAP(n_neighbors=2) 
umap_embeds = reducer.fit_transform(qa)
# Prepare the data to plot and interactive visualization
# using Altair
#df_explore = pd.DataFrame(data={'text': qa['text']})
#print(df_explore)

#df_explore = pd.DataFrame(data={'text': qa_df[0]})
df_explore = qa_df
df_explore['x'] = umap_embeds[:,0]
df_explore['y'] = umap_embeds[:,1]

# Plot
chart = alt.Chart(df_explore).mark_circle(size=60).encode(
    x=#'x',
    alt.X('x',
        scale=alt.Scale(zero=False)
    ),
    y=
    alt.Y('y',
        scale=alt.Scale(zero=False)
    ),
    tooltip=['text']
).properties(
    width=700,
    height=400
)
chart.interactive()
```





<style>
  #altair-viz-7343611b789e45e09c3550159e795364.vega-embed {
    width: 100%;
    display: flex;
  }

  #altair-viz-7343611b789e45e09c3550159e795364.vega-embed details,
  #altair-viz-7343611b789e45e09c3550159e795364.vega-embed details summary {
    position: relative;
  }
</style>
<div id="altair-viz-7343611b789e45e09c3550159e795364"></div>
<script type="text/javascript">
  var VEGA_DEBUG = (typeof VEGA_DEBUG == "undefined") ? {} : VEGA_DEBUG;
  (function(spec, embedOpt){
    let outputDiv = document.currentScript.previousElementSibling;
    if (outputDiv.id !== "altair-viz-7343611b789e45e09c3550159e795364") {
      outputDiv = document.getElementById("altair-viz-7343611b789e45e09c3550159e795364");
    }
    const paths = {
      "vega": "https://cdn.jsdelivr.net/npm/vega@5?noext",
      "vega-lib": "https://cdn.jsdelivr.net/npm/vega-lib?noext",
      "vega-lite": "https://cdn.jsdelivr.net/npm/vega-lite@5.16.3?noext",
      "vega-embed": "https://cdn.jsdelivr.net/npm/vega-embed@6?noext",
    };

    function maybeLoadScript(lib, version) {
      var key = `${lib.replace("-", "")}_version`;
      return (VEGA_DEBUG[key] == version) ?
        Promise.resolve(paths[lib]) :
        new Promise(function(resolve, reject) {
          var s = document.createElement('script');
          document.getElementsByTagName("head")[0].appendChild(s);
          s.async = true;
          s.onload = () => {
            VEGA_DEBUG[key] = version;
            return resolve(paths[lib]);
          };
          s.onerror = () => reject(`Error loading script: ${paths[lib]}`);
          s.src = paths[lib];
        });
    }

    function showError(err) {
      outputDiv.innerHTML = `<div class="error" style="color:red;">${err}</div>`;
      throw err;
    }

    function displayChart(vegaEmbed) {
      vegaEmbed(outputDiv, spec, embedOpt)
        .catch(err => showError(`Javascript Error: ${err.message}<br>This usually means there's a typo in your chart specification. See the javascript console for the full traceback.`));
    }

    if(typeof define === "function" && define.amd) {
      requirejs.config({paths});
      require(["vega-embed"], displayChart, err => showError(`Error loading script: ${err.message}`));
    } else {
      maybeLoadScript("vega", "5")
        .then(() => maybeLoadScript("vega-lite", "5.16.3"))
        .then(() => maybeLoadScript("vega-embed", "6"))
        .catch(showError)
        .then(() => displayChart(vegaEmbed));
    }
  })({"config": {"view": {"continuousWidth": 300, "continuousHeight": 300}}, "data": {"name": "data-f119c070bfa68ebaa49be118cb553935"}, "mark": {"type": "circle", "size": 60}, "encoding": {"tooltip": [{"field": "text", "type": "nominal"}], "x": {"field": "x", "scale": {"zero": false}, "type": "quantitative"}, "y": {"field": "y", "scale": {"zero": false}, "type": "quantitative"}}, "height": 400, "params": [{"name": "param_1", "select": {"type": "interval", "encodings": ["x", "y"]}, "bind": "scales"}], "width": 700, "$schema": "https://vega.github.io/schema/vega-lite/v5.16.3.json", "datasets": {"data-f119c070bfa68ebaa49be118cb553935": [{"text": "Where is the world cup?", "x": 0.10916253179311752, "y": 6.968442440032959}, {"text": "The world cup is in Qatar", "x": 0.3937394917011261, "y": 6.683285713195801}, {"text": "What color is the sky?", "x": -11.251619338989258, "y": -4.348402500152588}, {"text": "The sky is blue", "x": -11.563275337219238, "y": -4.660341262817383}, {"text": "Where does the bear live?", "x": -19.38410186767578, "y": -3.845724105834961}, {"text": "The bear lives in the the woods", "x": -19.695642471313477, "y": -4.1576619148254395}, {"text": "What is an apple?", "x": 8.69540023803711, "y": 7.115650177001953}, {"text": "An apple is a fruit", "x": 8.387487411499023, "y": 7.424482822418213}]}}, {"mode": "vega-lite"});
</script>



## Plotting the cosine similarities


```python
import seaborn as sb

def plot_similarities(data, embedding):
  similarities = []

  for i in range(len(data)):
    similarities.append([])
    for j in range(len(data)):
      #print(qa_df['text'][i], ',', qa_df['text'][j], '->', cosine_similarity(np.array([qa[i]]), np.array([qa[j]])))
      similarities[-1].append(cosine_similarity(np.array([embedding[i]]), np.array([embedding[j]])))
    #print()

  similarities = np.array(similarities).squeeze()
  #print(similarities)
  sb.heatmap(similarities)

plot_similarities(qa_df, qa)
```


    
![png](/Users/catherinedeskur/Documents/Fern/fern-platform/clis/jupyter-to-mdx/output/notebooks/llmu/What_is_Semantic_Search_14_0.png)
    


## A more complicated example


```python
qa_df_confusing = pd.DataFrame({'text':
  [
   'Where is the world cup?',
   'What color is the sky?',
   'Where does the bear live?',
   'What is an apple?',
   'The world cup is in Qatar',
   'The world cup is in the moon',
   'The previous world cup was in Russia',
   'The sky is green',
   'The sky is blue',
   'The bear lives in the the woods',
   'The bear lives in his apartment',
   'An apple is a fruit',
   'Apple is a company'
  ]})

qa_df_confusing
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
      <th>text</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>Where is the world cup?</td>
    </tr>
    <tr>
      <th>1</th>
      <td>What color is the sky?</td>
    </tr>
    <tr>
      <th>2</th>
      <td>Where does the bear live?</td>
    </tr>
    <tr>
      <th>3</th>
      <td>What is an apple?</td>
    </tr>
    <tr>
      <th>4</th>
      <td>The world cup is in Qatar</td>
    </tr>
    <tr>
      <th>5</th>
      <td>The world cup is in the moon</td>
    </tr>
    <tr>
      <th>6</th>
      <td>The previous world cup was in Russia</td>
    </tr>
    <tr>
      <th>7</th>
      <td>The sky is green</td>
    </tr>
    <tr>
      <th>8</th>
      <td>The sky is blue</td>
    </tr>
    <tr>
      <th>9</th>
      <td>The bear lives in the the woods</td>
    </tr>
    <tr>
      <th>10</th>
      <td>The bear lives in his apartment</td>
    </tr>
    <tr>
      <th>11</th>
      <td>An apple is a fruit</td>
    </tr>
    <tr>
      <th>12</th>
      <td>Apple is a company</td>
    </tr>
  </tbody>
</table>
</div>




```python
qa_confusing = co.embed(texts=list(qa_df_confusing['text']), model='embed-english-v3.0', input_type="search_document").embeddings
```


```python
 # UMAP reduces the dimensions from 1024 to 2 dimensions that we can plot
reducer = umap.UMAP(n_neighbors=2)
umap_embeds = reducer.fit_transform(qa_confusing)
# Prepare the data to plot and interactive visualization
# using Altair
#df_explore = pd.DataFrame(data={'text': qa['text']})
#print(df_explore)

#df_explore = pd.DataFrame(data={'text': qa_df[0]})
df_explore = qa_df_confusing
df_explore['x'] = umap_embeds[:,0]
df_explore['y'] = umap_embeds[:,1]

# Plot
chart = alt.Chart(df_explore).mark_circle(size=60).encode(
    x=#'x',
    alt.X('x',
        scale=alt.Scale(zero=False)
    ),
    y=
    alt.Y('y',
        scale=alt.Scale(zero=False)
    ),
    tooltip=['text']
).properties(
    width=700,
    height=400
)
chart.interactive()
```





<style>
  #altair-viz-ba1228ba79d04a62857a1ca02b142b4b.vega-embed {
    width: 100%;
    display: flex;
  }

  #altair-viz-ba1228ba79d04a62857a1ca02b142b4b.vega-embed details,
  #altair-viz-ba1228ba79d04a62857a1ca02b142b4b.vega-embed details summary {
    position: relative;
  }
</style>
<div id="altair-viz-ba1228ba79d04a62857a1ca02b142b4b"></div>
<script type="text/javascript">
  var VEGA_DEBUG = (typeof VEGA_DEBUG == "undefined") ? {} : VEGA_DEBUG;
  (function(spec, embedOpt){
    let outputDiv = document.currentScript.previousElementSibling;
    if (outputDiv.id !== "altair-viz-ba1228ba79d04a62857a1ca02b142b4b") {
      outputDiv = document.getElementById("altair-viz-ba1228ba79d04a62857a1ca02b142b4b");
    }
    const paths = {
      "vega": "https://cdn.jsdelivr.net/npm/vega@5?noext",
      "vega-lib": "https://cdn.jsdelivr.net/npm/vega-lib?noext",
      "vega-lite": "https://cdn.jsdelivr.net/npm/vega-lite@5.16.3?noext",
      "vega-embed": "https://cdn.jsdelivr.net/npm/vega-embed@6?noext",
    };

    function maybeLoadScript(lib, version) {
      var key = `${lib.replace("-", "")}_version`;
      return (VEGA_DEBUG[key] == version) ?
        Promise.resolve(paths[lib]) :
        new Promise(function(resolve, reject) {
          var s = document.createElement('script');
          document.getElementsByTagName("head")[0].appendChild(s);
          s.async = true;
          s.onload = () => {
            VEGA_DEBUG[key] = version;
            return resolve(paths[lib]);
          };
          s.onerror = () => reject(`Error loading script: ${paths[lib]}`);
          s.src = paths[lib];
        });
    }

    function showError(err) {
      outputDiv.innerHTML = `<div class="error" style="color:red;">${err}</div>`;
      throw err;
    }

    function displayChart(vegaEmbed) {
      vegaEmbed(outputDiv, spec, embedOpt)
        .catch(err => showError(`Javascript Error: ${err.message}<br>This usually means there's a typo in your chart specification. See the javascript console for the full traceback.`));
    }

    if(typeof define === "function" && define.amd) {
      requirejs.config({paths});
      require(["vega-embed"], displayChart, err => showError(`Error loading script: ${err.message}`));
    } else {
      maybeLoadScript("vega", "5")
        .then(() => maybeLoadScript("vega-lite", "5.16.3"))
        .then(() => maybeLoadScript("vega-embed", "6"))
        .catch(showError)
        .then(() => displayChart(vegaEmbed));
    }
  })({"config": {"view": {"continuousWidth": 300, "continuousHeight": 300}}, "data": {"name": "data-fce2fed37a86786bf5346e278fce173e"}, "mark": {"type": "circle", "size": 60}, "encoding": {"tooltip": [{"field": "text", "type": "nominal"}], "x": {"field": "x", "scale": {"zero": false}, "type": "quantitative"}, "y": {"field": "y", "scale": {"zero": false}, "type": "quantitative"}}, "height": 400, "params": [{"name": "param_2", "select": {"type": "interval", "encodings": ["x", "y"]}, "bind": "scales"}], "width": 700, "$schema": "https://vega.github.io/schema/vega-lite/v5.16.3.json", "datasets": {"data-fce2fed37a86786bf5346e278fce173e": [{"text": "Where is the world cup?", "x": 4.214752674102783, "y": 8.807564735412598}, {"text": "What color is the sky?", "x": 10.512534141540527, "y": -6.417536735534668}, {"text": "Where does the bear live?", "x": 9.741052627563477, "y": -11.914958000183105}, {"text": "What is an apple?", "x": -4.330538272857666, "y": -0.12386079877614975}, {"text": "The world cup is in Qatar", "x": 3.8861024379730225, "y": 8.441215515136719}, {"text": "The world cup is in the moon", "x": 3.567026376724243, "y": 8.09428882598877}, {"text": "The previous world cup was in Russia", "x": 4.485987186431885, "y": 9.123473167419434}, {"text": "The sky is green", "x": 11.131611824035645, "y": -6.771017551422119}, {"text": "The sky is blue", "x": 10.736543655395508, "y": -6.6995015144348145}, {"text": "The bear lives in the the woods", "x": 9.384008407592773, "y": -12.271141052246094}, {"text": "The bear lives in his apartment", "x": 10.034639358520508, "y": -11.620488166809082}, {"text": "An apple is a fruit", "x": -4.647192001342773, "y": -0.4346667230129242}, {"text": "Apple is a company", "x": -4.855321407318115, "y": -0.6417043805122375}]}}, {"mode": "vega-lite"});
</script>




```python
plot_similarities(qa_df_confusing, qa_confusing)
```


    
![png](/Users/catherinedeskur/Documents/Fern/fern-platform/clis/jupyter-to-mdx/output/notebooks/llmu/What_is_Semantic_Search_19_0.png)
    


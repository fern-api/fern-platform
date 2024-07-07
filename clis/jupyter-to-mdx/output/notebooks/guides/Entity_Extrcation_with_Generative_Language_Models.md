# Entity Extraction with Generative Models

This notebook demonstrates how to use Cohere's generative models to extract the name of a film from the title of an article. This demonstrates Named Entity Recognition (NER) of entities which are harder to isolate using other NLP methods (and where pre-training provides the model with some context on these entities). This also demonstrates the broader usecase of sturctured generation based on providing multiple examples in the prompt.



![Extracting Entities from text](https://github.com/cohere-ai/notebooks/raw/main/notebooks/images/keyword-extraction-gpt-models.png)


We'll use post titles from the r/Movies subreddit. And for each title, we'll extract which movie the post is about. If the model is unable to detect the name of a movie being mentioned, it will return "none".

## Setup
Let's start by installing the packages we need.


```python
# TODO: upgrade to "cohere>5"!pip install "cohere<5" requests tqdm
```

We'll then import these packages and declare the function that retrieves post titles from reddit.


```python
import cohere
import pandas as pd
import requests
import datetime
from tqdm import tqdm
pd.set_option('display.max_colwidth', None)

def get_post_titles(**kwargs):
    """ Gets data from the pushshift api. Read more: https://github.com/pushshift/api """
    base_url = f"https://api.pushshift.io/reddit/search/submission/"
    payload = kwargs
    request = requests.get(base_url, params=payload)
    return [a['title'] for a in request.json()['data']]

```

You'll need your API key for this next cell. [Sign up to Cohere](https://os.cohere.ai/) and get one if you haven't yet.


```python
# Paste your API key here. Remember to not share publicly
api_key = ''

# Create and retrieve a Cohere API key from os.cohere.ai
co = cohere.Client(api_key)
```

## Preparing examples for the prompt

In our prompt, we'll present the model with examples for the type of output we're after. We basically get a set of subreddit article titles, and label them ourselves. The label here is the name of the movie mentioned in the title (and "none" if no movie is mentioned).


![Labeled dataset of text and extracted text](https://github.com/cohere-ai/notebooks/raw/main/notebooks/images/keyword-extraction-dataset.png)




```python

movie_examples = [
("Deadpool 2", "Deadpool 2 | Official HD Deadpool's \"Wet on Wet\" Teaser | 2018"),
("none", "Jordan Peele Just Became the First Black Writer-Director With a $100M Movie Debut"),
("Joker", "Joker Officially Rated “R”"),
("Free Guy", "Ryan Reynolds’ 'Free Guy' Receives July 3, 2020 Release Date - About a bank teller stuck in his routine that discovers he’s an NPC character in brutal open world game."),
("none", "James Cameron congratulates Kevin Feige and Marvel!"),
("Guardians of the Galaxy", "The Cast of Guardians of the Galaxy release statement on James Gunn"),
]

```



## Creating the extraction prompt

We'll create a prompt that demonstrates the task to the model. The prompt contains the examples above, and then presents the input text and asks the model to extract the movie name.


![Extraction prompt containing the examples and the input text](https://github.com/cohere-ai/notebooks/raw/main/notebooks/images/extraction-prompt-example.png)



```python
#@title Create the prompt (Run this cell to execute required code) {display-mode: "form"}

class cohereExtractor():
    def __init__(self, examples, example_labels, labels, task_desciption, example_prompt):
        self.examples = examples
        self.example_labels = example_labels
        self.labels = labels
        self.task_desciption = task_desciption
        self.example_prompt = example_prompt

    def make_prompt(self, example):
        examples = self.examples + [example]
        labels = self.example_labels + [""]
        return (self.task_desciption +
                "\n---\n".join( [examples[i] + "\n" +
                                self.example_prompt + 
                                 labels[i] for i in range(len(examples))]))

    def extract(self, example):
      extraction = co.generate(
          model='large',
          prompt=self.make_prompt(example),
          max_tokens=10,
          temperature=0.1,
          stop_sequences=["\n"])
      return(extraction.generations[0].text[:-1])


cohereMovieExtractor = cohereExtractor([e[1] for e in movie_examples], 
                                       [e[0] for e in movie_examples], [],
                                       "", 
                                       "extract the movie title from the post:")

# Uncomment to inspect the full prompt:
# print(cohereMovieExtractor.make_prompt('<input text here>'))
```


```python
# This is what the prompt looks like:
print(cohereMovieExtractor.make_prompt('<input text here>'))
```

    Deadpool 2 | Official HD Deadpool's "Wet on Wet" Teaser | 2018
    extract the movie title from the post:Deadpool 2
    ---
    Jordan Peele Just Became the First Black Writer-Director With a $100M Movie Debut
    extract the movie title from the post:none
    ---
    Joker Officially Rated “R”
    extract the movie title from the post:Joker
    ---
    Ryan Reynolds’ 'Free Guy' Receives July 3, 2020 Release Date - About a bank teller stuck in his routine that discovers he’s an NPC character in brutal open world game.
    extract the movie title from the post:Free Guy
    ---
    James Cameron congratulates Kevin Feige and Marvel!
    extract the movie title from the post:none
    ---
    The Cast of Guardians of the Galaxy release statement on James Gunn
    extract the movie title from the post:Guardians of the Galaxy
    ---
    <input text here>
    extract the movie title from the post:


## Getting the data
Let's now make the API call to get the top posts for 2021 from r/movies.


```python
num_posts = 10

movies_list = get_post_titles(size=num_posts, 
      after=str(int(datetime.datetime(2021,1,1,0,0).timestamp())), 
      before=str(int(datetime.datetime(2022,1,1,0,0).timestamp())), 
      subreddit="movies", 
      sort_type="score", 
      sort="desc")

# Show the list
movies_list
```




    ['Hayao Miyazaki Got So Bored with Retirement He Started Directing Again ‘in Order to Live’',
     "First poster for Pixar's Luca",
     'New images from Space Jam: A New Legacy',
     'Official Poster for "Sonic the Hedgehog 2"',
     'Ng Man Tat, legendary HK actor and frequent collborator of Stephen Chow (Shaolin Soccer, God of Gambler) died at 70',
     'Zack Snyder’s Justice League has officially been Rated R for for violence and some language',
     'HBOMax and Disney+ NEED to improve their apps if they want to compete with Netflix.',
     'I want a sequel to Rat Race where John Cleese’s character dies and invites everyone from the first film to his funeral, BUT, he’s secretly set up a Rat Maze to trap them all in. A sort of post-mortem revenge on them for donating all his wealth to charity.',
     "'Trainspotting' at 25: How an Indie Film About Heroin Became a Feel-Good Classic",
     '‘Avatar: The Last Airbender’ Franchise To Expand With Launch Of Nickelodeon’s Avatar Studios, Animated Theatrical Film To Start Production Later This Year']



## Running the model
And now we loop over the posts and process each one of them with our extractor.


```python
results = []
for text in tqdm(movies_list):
    try:
        extracted_text = cohereMovieExtractor.extract(text)
        results.append(extracted_text)
    except Exception as e:
        print('ERROR: ', e)
```

    100%|██████████| 10/10 [00:10<00:00,  1.09s/it]


Let's look at the results:


```python
pd.DataFrame(data={'text': movies_list, 'extracted_text': results})
```





  <div id="df-68ec219d-46ba-48cf-9aa6-1a9a7cea3f94">
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
      <th>text</th>
      <th>extracted_text</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>Hayao Miyazaki Got So Bored with Retirement He Started Directing Again ‘in Order to Live’</td>
      <td>none</td>
    </tr>
    <tr>
      <th>1</th>
      <td>First poster for Pixar's Luca</td>
      <td>Pixar's Luca</td>
    </tr>
    <tr>
      <th>2</th>
      <td>New images from Space Jam: A New Legacy</td>
      <td>Space Jam: A New Legacy</td>
    </tr>
    <tr>
      <th>3</th>
      <td>Official Poster for "Sonic the Hedgehog 2"</td>
      <td>Sonic the Hedgehog 2</td>
    </tr>
    <tr>
      <th>4</th>
      <td>Ng Man Tat, legendary HK actor and frequent collborator of Stephen Chow (Shaolin Soccer, God of Gambler) died at 70</td>
      <td>none</td>
    </tr>
    <tr>
      <th>5</th>
      <td>Zack Snyder’s Justice League has officially been Rated R for for violence and some language</td>
      <td>Justice League</td>
    </tr>
    <tr>
      <th>6</th>
      <td>HBOMax and Disney+ NEED to improve their apps if they want to compete with Netflix.</td>
      <td>none</td>
    </tr>
    <tr>
      <th>7</th>
      <td>I want a sequel to Rat Race where John Cleese’s character dies and invites everyone from the first film to his funeral, BUT, he’s secretly set up a Rat Maze to trap them all in. A sort of post-mortem revenge on them for donating all his wealth to charity.</td>
      <td>Rat Race</td>
    </tr>
    <tr>
      <th>8</th>
      <td>'Trainspotting' at 25: How an Indie Film About Heroin Became a Feel-Good Classic</td>
      <td>Trainspotting</td>
    </tr>
    <tr>
      <th>9</th>
      <td>‘Avatar: The Last Airbender’ Franchise To Expand With Launch Of Nickelodeon’s Avatar Studios, Animated Theatrical Film To Start Production Later This Year</td>
      <td>Avatar: The Last Airbender</td>
    </tr>
  </tbody>
</table>
</div>
      <button class="colab-df-convert" onclick="convertToInteractive('df-68ec219d-46ba-48cf-9aa6-1a9a7cea3f94')"
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
          document.querySelector('#df-68ec219d-46ba-48cf-9aa6-1a9a7cea3f94 button.colab-df-convert');
        buttonEl.style.display =
          google.colab.kernel.accessAllowed ? 'block' : 'none';

        async function convertToInteractive(key) {
          const element = document.querySelector('#df-68ec219d-46ba-48cf-9aa6-1a9a7cea3f94');
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




Looking at these results, the model got 9/10 correctly. It didn't pick up on Shaolin Soccer and God of Gambler in example \#4. It also called the second example "Pixar's Luca" instead of "Luca". But maybe we'll let this one slide.

When experimenting with extrction prompts, we'll often find edge-cases along the way. What if a post has two movies mentioned, for example? The more we run into such examples, the more examples we can add to the prompt that address these cases.

## How well does this work?
We can better measure the performance of this extraction method using a larger labeled dataset. So let's load a test set of 100 examples:


```python
test_df = pd.read_csv('https://raw.githubusercontent.com/cohere-ai/notebooks/main/notebooks/data/movie_extraction_test_set_100.csv',index_col=0)
test_df
```





  <div id="df-cfe64136-6bab-4155-a6fb-8b603a48b2f4">
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
      <th>text</th>
      <th>label</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>Disney's streaming service loses some movies due to old licensing deals</td>
      <td>none</td>
    </tr>
    <tr>
      <th>1</th>
      <td>Hi, I’m Sam Raimi, producer of THE GRUDGE which hits theaters tonight. Ask Me Anything!</td>
      <td>The Grudge</td>
    </tr>
    <tr>
      <th>2</th>
      <td>'Parasite' Named Best Picture by Australia's AACTA Awards</td>
      <td>Parasite</td>
    </tr>
    <tr>
      <th>3</th>
      <td>Danny Trejo To Star In Vampire Spaghetti Western ‘Death Rider in the House of Vampires’</td>
      <td>Death Rider in the House of Vampires</td>
    </tr>
    <tr>
      <th>4</th>
      <td>I really wish the 'realistic' CGI animal trend would end.</td>
      <td>none</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>95</th>
      <td>Hair Love | Oscar Winning Short Film (Full)</td>
      <td>Hair Love</td>
    </tr>
    <tr>
      <th>96</th>
      <td>First image of Jason Alexander in Christian film industry satire 'Faith Based'</td>
      <td>Faith Based</td>
    </tr>
    <tr>
      <th>97</th>
      <td>'Borderlands' Movie in the Works From Eli Roth, Lionsgate</td>
      <td>Borderlands</td>
    </tr>
    <tr>
      <th>98</th>
      <td>Taika Waititi putting his Oscar "away" after winning best adapted screenplay for JOJO RABBIT</td>
      <td>Jojo Rabbit</td>
    </tr>
    <tr>
      <th>99</th>
      <td>Oscar-Winning 'Parasite' Lands One-Week IMAX Release Starting February 21 in 200+ Theaters</td>
      <td>Parasite</td>
    </tr>
  </tbody>
</table>
<p>100 rows × 2 columns</p>
</div>
      <button class="colab-df-convert" onclick="convertToInteractive('df-cfe64136-6bab-4155-a6fb-8b603a48b2f4')"
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
          document.querySelector('#df-cfe64136-6bab-4155-a6fb-8b603a48b2f4 button.colab-df-convert');
        buttonEl.style.display =
          google.colab.kernel.accessAllowed ? 'block' : 'none';

        async function convertToInteractive(key) {
          const element = document.querySelector('#df-cfe64136-6bab-4155-a6fb-8b603a48b2f4');
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




Let's run the extractor on these post titles (calling the API in parallel for quicker results):


```python
from concurrent.futures import ThreadPoolExecutor

extracted = []
# Run the model to extract the entities
with ThreadPoolExecutor(max_workers=8) as executor:
    for i in executor.map(cohereMovieExtractor.extract, test_df['text']):
        extracted.append(str(i).strip())
# Save results
test_df['extracted_text'] = extracted
```

Let's look at some results:


```python
test_df.head()
```





  <div id="df-8b31b9f1-8ec2-4bb7-b461-daa11f976405">
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
      <th>text</th>
      <th>label</th>
      <th>extracted_text</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>Disney's streaming service loses some movies due to old licensing deals</td>
      <td>none</td>
      <td>none</td>
    </tr>
    <tr>
      <th>1</th>
      <td>Hi, I’m Sam Raimi, producer of THE GRUDGE which hits theaters tonight. Ask Me Anything!</td>
      <td>The Grudge</td>
      <td>The Grudge</td>
    </tr>
    <tr>
      <th>2</th>
      <td>'Parasite' Named Best Picture by Australia's AACTA Awards</td>
      <td>Parasite</td>
      <td>Parasite</td>
    </tr>
    <tr>
      <th>3</th>
      <td>Danny Trejo To Star In Vampire Spaghetti Western ‘Death Rider in the House of Vampires’</td>
      <td>Death Rider in the House of Vampires</td>
      <td>Death Rider</td>
    </tr>
    <tr>
      <th>4</th>
      <td>I really wish the 'realistic' CGI animal trend would end.</td>
      <td>none</td>
      <td>none</td>
    </tr>
  </tbody>
</table>
</div>
      <button class="colab-df-convert" onclick="convertToInteractive('df-8b31b9f1-8ec2-4bb7-b461-daa11f976405')"
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
          document.querySelector('#df-8b31b9f1-8ec2-4bb7-b461-daa11f976405 button.colab-df-convert');
        buttonEl.style.display =
          google.colab.kernel.accessAllowed ? 'block' : 'none';

        async function convertToInteractive(key) {
          const element = document.querySelector('#df-8b31b9f1-8ec2-4bb7-b461-daa11f976405');
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




Let's calculate the accuracy by comparing to the labeled examples


```python
# Compare the label to the extracted text
test_df['correct'] = (test_df['label'].str.lower() == test_df['extracted_text'].str.lower()).astype(int)

# Print the accuracy
print(f'Classification accuracy {test_df["correct"].mean() *100}%')
```

    Classification accuracy 89.0%


So it seems this prompt works well on this small test set. It's not guaranteed it will do as well on other sets, however. The prompt can be improved by trying on more data, discovering edge cases, and adding more examples to the prompt.

We can look at the examples it got wrong:


```python
test_df[test_df['correct']==0]
```





  <div id="df-5367268b-259d-4325-993f-773116de9ad4">
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
      <th>text</th>
      <th>label</th>
      <th>extracted_text</th>
      <th>correct</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>3</th>
      <td>Danny Trejo To Star In Vampire Spaghetti Western ‘Death Rider in the House of Vampires’</td>
      <td>Death Rider in the House of Vampires</td>
      <td>Death Rider</td>
      <td>0</td>
    </tr>
    <tr>
      <th>6</th>
      <td>De Niro recreating a scene from Goodfellas to test Irishman deaging (3:30 in)</td>
      <td>Goodfellas</td>
      <td>none</td>
      <td>0</td>
    </tr>
    <tr>
      <th>12</th>
      <td>Is there anyway way I could get a copy of 1917 for my dying father in law?</td>
      <td>1917</td>
      <td>none</td>
      <td>0</td>
    </tr>
    <tr>
      <th>30</th>
      <td>How Uncut Gems Won Over the Diamond District</td>
      <td>Uncut Gems</td>
      <td>none</td>
      <td>0</td>
    </tr>
    <tr>
      <th>31</th>
      <td>Michael J. Fox and Christopher Lloyd posing for the Back to the Future II poster in 1989 that would later be illustrated by Drew Struzan</td>
      <td>Back to the Future II</td>
      <td>Back to the Future</td>
      <td>0</td>
    </tr>
    <tr>
      <th>39</th>
      <td>2019 in film - with 'Movies' by Weyes Blood</td>
      <td>none</td>
      <td>Movies</td>
      <td>0</td>
    </tr>
    <tr>
      <th>57</th>
      <td>The Mad Max franchise is my all time favorite movie series. I finally watched Waterworld tonight. Oh man why didnt I see this sooner?</td>
      <td>Mad Max</td>
      <td>Waterworld</td>
      <td>0</td>
    </tr>
    <tr>
      <th>69</th>
      <td>How A New Hope created Pixar Animation Studios</td>
      <td>Star Wars</td>
      <td>none</td>
      <td>0</td>
    </tr>
    <tr>
      <th>75</th>
      <td>A scene from the movie 1917 was recreated from the stroyboards.</td>
      <td>1917</td>
      <td>none</td>
      <td>0</td>
    </tr>
    <tr>
      <th>82</th>
      <td>New Wonder Woman image</td>
      <td>Wonder Woman</td>
      <td>none</td>
      <td>0</td>
    </tr>
    <tr>
      <th>88</th>
      <td>Thoughts on the Irishman ...</td>
      <td>The Irishman</td>
      <td>none</td>
      <td>0</td>
    </tr>
  </tbody>
</table>
</div>
      <button class="colab-df-convert" onclick="convertToInteractive('df-5367268b-259d-4325-993f-773116de9ad4')"
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
          document.querySelector('#df-5367268b-259d-4325-993f-773116de9ad4 button.colab-df-convert');
        buttonEl.style.display =
          google.colab.kernel.accessAllowed ? 'block' : 'none';

        async function convertToInteractive(key) {
          const element = document.querySelector('#df-5367268b-259d-4325-993f-773116de9ad4');
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




It indeed failed to pick up a few examples. Sometimes this uncovers edge cases and understandable mistakes (e.g. two films are mentioned in the text). 


We can look at the classification report for a more detailed look at what's included in the test set, and what the model got right and wrong:


```python
from sklearn.metrics import classification_report
import warnings
warnings.filterwarnings('ignore')

print(classification_report(test_df['label'].str.lower(), test_df['extracted_text'].str.lower()))
```

                                          precision    recall  f1-score   support
    
                                    1917       0.00      0.00      0.00         2
                   2001: a space odyssey       1.00      1.00      1.00         1
                                ad astra       1.00      1.00      1.00         1
         alice doesn't live here anymore       1.00      1.00      1.00         1
                           austin powers       1.00      1.00      1.00         1
                      back to the future       0.00      0.00      0.00         0
                   back to the future ii       0.00      0.00      0.00         1
                            blood simple       1.00      1.00      1.00         1
                       bohemian rhapsody       1.00      1.00      1.00         1
                             borderlands       1.00      1.00      1.00         1
                         brief encounter       1.00      1.00      1.00         1
                                    cats       1.00      1.00      1.00         1
                                   congo       1.00      1.00      1.00         1
                             death rider       0.00      0.00      0.00         0
    death rider in the house of vampires       0.00      0.00      0.00         1
                     dolemite is my name       1.00      1.00      1.00         1
                          dracula untold       1.00      1.00      1.00         1
                                  dreams       1.00      1.00      1.00         1
                                    dune       1.00      1.00      1.00         1
                        edge of tomorrow       1.00      1.00      1.00         1
                                 el topo       1.00      1.00      1.00         1
                            end of watch       1.00      1.00      1.00         1
                             faith based       1.00      1.00      1.00         1
                                fun home       1.00      1.00      1.00         1
                              goodfellas       0.00      0.00      0.00         1
                       gretel and hansel       1.00      1.00      1.00         1
                               hair love       1.00      1.00      1.00         1
                             hard boiled       1.00      1.00      1.00         1
                            interstellar       1.00      1.00      1.00         1
                               john wick       1.00      1.00      1.00         1
                             jojo rabbit       1.00      1.00      1.00         2
                               king kong       1.00      1.00      1.00         1
                              knives out       1.00      1.00      1.00         1
                            little women       1.00      1.00      1.00         1
                                 mad max       0.00      0.00      0.00         1
                          marriage story       1.00      1.00      1.00         1
                                  movies       0.00      0.00      0.00         0
                              ni no kuni       1.00      1.00      1.00         1
                                    none       0.81      0.97      0.88        30
           once upon a time in hollywood       1.00      1.00      1.00         2
                                parasite       1.00      1.00      1.00         5
                             ratatouille       1.00      1.00      1.00         1
                                ricochet       1.00      1.00      1.00         1
                                 robocop       1.00      1.00      1.00         1
                                   rocky       1.00      1.00      1.00         1
                            rocky balboa       1.00      1.00      1.00         1
                                     run       1.00      1.00      1.00         1
                           shin godzilla       1.00      1.00      1.00         1
                               star wars       0.00      0.00      0.00         1
                                 swallow       1.00      1.00      1.00         1
                            the big year       1.00      1.00      1.00         1
                         the flintstones       1.00      1.00      1.00         1
                               the grude       1.00      1.00      1.00         1
                              the grudge       1.00      1.00      1.00         3
                            the ice road       1.00      1.00      1.00         1
                            the irishman       0.00      0.00      0.00         1
                          the lighthouse       1.00      1.00      1.00         1
                           the two popes       1.00      1.00      1.00         1
                                    togo       1.00      1.00      1.00         1
                                 tumbbad       1.00      1.00      1.00         1
                              uncut gems       0.00      0.00      0.00         1
                         unknown soldier       1.00      1.00      1.00         1
                              waterworld       0.00      0.00      0.00         0
                                  willow       1.00      1.00      1.00         1
                            wonder woman       0.00      0.00      0.00         1
                       wonder woman 1984       1.00      1.00      1.00         1
    
                                accuracy                           0.89       100
                               macro avg       0.80      0.80      0.80       100
                            weighted avg       0.84      0.89      0.86       100
    


This type of extraction is interesting because it doesn't just blindly look at the text. The model has picked up on movie information during its pretraining process and that helps it understand the task from only a few examples.

You can think about extending this to other subreddits, to extract other kinds of entities and information. [Let us know in the forum](https://community.cohere.ai/) what you experiment with and what kinds of results you see!

Happy building!

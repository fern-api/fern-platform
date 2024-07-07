# Brainstorming Story Ideas with Cohere and Stable Diffusion

***Note: this notebook is at an experimental stage. Outputs may vary.***

Read the accompanying [blog post here](https://txt.cohere.ai/generative-ai-part-5/).

--------------------

Describe your story in two sentences, then guide Cohere's language model as it turns it into a bigger story.

Your story description, called the log line, will then be used to generate the story title, characters, plot, location descriptions, and scene dialog. This is done with a different prompt for each of these components.

This notebook follows the method and prompts described in the paper [Co-Writing Screenplays and Theatre Scripts with Language Models: An Evaluation by Industry Professionals](https://www.deepmind.com/publications/co-writing-screenplays-and-theatre-scripts-with-language-models-an-evaluation-by-industry-professionals) by Piotr Mirowski, Kory Mathewson, Jaylen Pittman, Richard Evans.




```python
# TODO: upgrade to "cohere>5"
!pip install "cohere<5" stability-sdk > /dev/null
```


```python
#@title Import Cohere, set up the text generation function

import cohere
import time
import pandas as pd
import re
import io
import os
import warnings
from IPython.display import display
from PIL import Image
from stability_sdk import client
import stability_sdk.interfaces.gooseai.generation.generation_pb2 as generation
import getpass, os


# Paste your API key here. Remember to not share it publicly 
# os.environ['CO_KEY'] = getpass.getpass('Enter your Cohere API Key')
co = cohere.Client('Enter your Cohere API Key')

def generate(prompt, model="base", num_generations=5, temperature=0.7, max_tokens=50, stop_sequences=['<end>']):
  prediction = co.generate(
    model=model,
    prompt=prompt,
    return_likelihoods = 'GENERATION',
    stop_sequences=stop_sequences,
    max_tokens=max_tokens,
    temperature=temperature,
    num_generations=num_generations)
  
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

  pd.options.display.max_colwidth = 200
  # Create a dataframe for the generated sentences and their likelihood scores
  df = pd.DataFrame({'generation':gens, 'likelihood': likelihoods})
  # Drop duplicates
  df = df.drop_duplicates(subset=['generation'])
  # Sort by highest sum likelihood
  df = df.sort_values('likelihood', ascending=False, ignore_index=True)
  
  return df


# UNCOMMENT AND RUN THE FOLLOWING CODE BLOCK TO ENABLE TEXT-TO-IMAGE GENERATION VIA DREAMSTUDIO

# # To get your API key, visit https://beta.dreamstudio.ai/membership
# os.environ['STABILITY_KEY'] = getpass.getpass('Enter your Dream Studio API Key')
# stability_api = client.StabilityInference(
#     key=os.environ['STABILITY_KEY'], 
#     verbose=True,
# )
# def generate_image(image_prompt):
#   # the object returned is a python generator
#   answers = stability_api.generate(
#       prompt=image_prompt
#   )
#   # iterating over the generator produces the api response
#   for resp in answers:
#       for artifact in resp.artifacts:
#           if artifact.finish_reason == generation.FILTER:
#               warnings.warn(
#                   "Your request activated the API's safety filters and could not be processed."
#                   "Please modify the prompt and try again.")
#           if artifact.type == generation.ARTIFACT_IMAGE:
#               img = Image.open(io.BytesIO(artifact.binary))
#               display(img)

```

## Story Summary
All we have to do is write a story summary. The model generates the rest.

This brief description is called the log line.


```python
log_line = """Scifi cyberpunk story about two hackers who find themselves both 
the targets of a cyber intelligence agent who suspects them of stealing $3.5 
million worth of Bitcoin. The two do not know each other, and neither of them 
recalls stealing the sum."""
```


```python
#@title Generate Title Suggestions { display-mode: "form" }

prompt_title_scifi = """Examples of alternative, original and descriptive titles for known play and film scripts.

Example 1. A science - fiction fantasy about a naive but ambitious farm boy from a backwater desert who
discovers powers he never knew he had when he teams up with a feisty princess, a mercenary space pilot
and an old wizard warrior to lead a ragtag rebellion against the sinister forces of the evil Galactic
Empire. Title: The Death Star's Menace <end>

Example 2. Residents of San Fernando Valley are under attack by flying saucers from outer space. The
aliens are extraterrestrials who seek to stop humanity from creating a doomsday weapon that could
destroy the universe and unleash the living dead to stalk humans who wander into the cemetery looking
for evidence of the UFOs. The hero Jeff, an airline pilot, will face the aliens. Title: The Day The
Earth Was Saved By Outer Space. <end>

Example 3. {LOG_LINE} Title:"""

prompt = prompt_title_scifi.format(LOG_LINE=log_line)

titles = generate(prompt, temperature=0.9, max_tokens=20)
titles['generation'] = titles['generation'].str.replace('<end>','')
titles
```





  <div id="df-32e469a6-7cae-4387-80c2-df763c7138e5">
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
      <th>generation</th>
      <th>likelihood</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>The Bitcoin Heist</td>
      <td>-6.221337</td>
    </tr>
    <tr>
      <th>1</th>
      <td>The Cryptocurrency Heist.</td>
      <td>-8.922848</td>
    </tr>
    <tr>
      <th>2</th>
      <td>A Web Of Lies</td>
      <td>-12.809743</td>
    </tr>
    <tr>
      <th>3</th>
      <td>The Bigger Fool.</td>
      <td>-17.252610</td>
    </tr>
    <tr>
      <th>4</th>
      <td>Data Miner Strikes Back.</td>
      <td>-19.474931</td>
    </tr>
  </tbody>
</table>
</div>
      <button class="colab-df-convert" onclick="convertToInteractive('df-32e469a6-7cae-4387-80c2-df763c7138e5')"
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
          document.querySelector('#df-32e469a6-7cae-4387-80c2-df763c7138e5 button.colab-df-convert');
        buttonEl.style.display =
          google.colab.kernel.accessAllowed ? 'block' : 'none';

        async function convertToInteractive(key) {
          const element = document.querySelector('#df-32e469a6-7cae-4387-80c2-df763c7138e5');
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
#@title Generate Characters and Description

character_prompt_scifi = """
Example 1. A science fiction fantasy about a naive but ambitious farm boy from a backwater desert who
discovers powers he never knew he had when he teams up with a feisty princess, a mercenary space pilot
and an old wizard warrior to lead a ragtag rebellion against the sinister forces of the evil Galactic
Empire.
Characters and descriptions:
<character> Luke Skywalker <description> Luke Skywalker is the hero. A naive farm boy, he will discover
special powers under the guidance of mentor Ben Kenobi. <stop>
<character> Ben Kenobi <description> Ben Kenobi is the mentor figure. A recluse Jedi warrior, he will
take Luke Skywalker as apprentice. <stop>
<character> Darth Vader <description> Darth Vader is the antagonist. As a commander of the evil Galactic
Empire, he controls space station The Death Star. <stop>
<character> Princess Leia <description> Princess Leia is a feisty and brave leader of the Rebellion. She
holds the plans of the Death Star. She will become Luke's friend. <stop>
<character> Han Solo <description> Han Solo is a brash mercenary space pilot of the Millenium Falcon and
a friend of Chebacca. He will take Luke on his spaceship. <stop>
<character> Chewbacca <description> Chewbacca is a furry and trustful monster. He is a friend of Han
Solo and a copilot on the Millemium Falcon. <stop>
<end>
Example 2. {LOG_LINE}.
Characters and descriptions:"""

prompt = character_prompt_scifi.format(LOG_LINE=log_line)

titles = generate(prompt, num_generations=3, temperature=1, max_tokens=500)

for idx, gen in enumerate(titles['generation'].values):
  print(f"============")
  print(f"Generation {idx}")
  print(gen)

# Which generation to pick?
gen_idx = 0
gen = titles['generation'].values[gen_idx]

character_descriptions = re.findall('\<description\>\s(.*?)\s<stop>', gen, re.DOTALL)
character_names = re.findall('\<character\>\s(.*?)\s<description>', gen, re.DOTALL)
```

## Visualize Characters with Stable Diffusion

Now that we have character descriptions, we can generate possible images showing them. We can get some style descriptions from Lexica.art.


```python
# UNCOMMENT AND RUN THE FOLLOWING CODE BLOCK TO ENABLE TEXT-TO-IMAGE GENERATION VIA DREAMSTUDIO


# # Get character style prompts from https://lexica.art/?q=cyberpunk
# character_style_1 = """portrait futuristic cyberpunk, in heavy rainning 
# futuristic tokyo rooftop cyberpunk night, ssci-fi, fantasy, intricate, very very 
# beautiful, elegant, neon light, highly detailed, digital painting, artstation, 
# concept art, soft light, hdri, smooth, sharp focus"""

# character_style_2 = """detailed portrait Neon Operator, cyberpunk 
# futuristic neon, reflective puffy coat, decorated with traditional 
# Japanese ornaments by Ismail inceoglu dragan bibin hans thoma greg rutkowski 
# Alexandros Pyromallis Nekro Rene Maritte Illustrated, Perfect face, fine details,
#  realistic shaded, fine-face, pretty face"""
```


```python
# UNCOMMENT AND RUN THE FOLLOWING CODE BLOCK TO ENABLE TEXT-TO-IMAGE GENERATION VIA DREAMSTUDIO

# image_prompt_character_1 = f'{character_descriptions[1]} {character_style_1}'
# print(image_prompt_character_1)

# # Generate images
# for i in range (3):
#   print(generate_image(image_prompt_character_1))
```

    INFO:stability_sdk.client:Sending request.
    INFO:stability_sdk.client:Got keepalive e71266c1-80f7-4cdf-8c4c-72c2d1695e30 in 0.16s


    Max is a professional hacker, whose client was recently hacked.
    He asks Howard to look into the matter. portrait futuristic cyberpunk, in heavy rainning 
    futuristic tokyo rooftop cyberpunk night, ssci-fi, fantasy, intricate, very very 
    beautiful, elegant, neon light, highly detailed, digital painting, artstation, 
    concept art, soft light, hdri, smooth, sharp focus


    INFO:stability_sdk.client:Got keepalive e71266c1-80f7-4cdf-8c4c-72c2d1695e30 in 3.01s
    INFO:stability_sdk.client:Got e71266c1-80f7-4cdf-8c4c-72c2d1695e30 with ['ARTIFACT_IMAGE', 'ARTIFACT_CLASSIFICATIONS', 'ARTIFACT_LATENT'] in 0.23s



    
![png](/Users/catherinedeskur/Documents/Fern/fern-platform/clis/jupyter-to-mdx/output/notebooks/guides/Brainstorming_Story_Ideas_with_Cohere_and_Stable_Diffusion_9_3.png)
    


    INFO:stability_sdk.client:Sending request.


    None


    INFO:stability_sdk.client:Got keepalive 17900276-1e5c-4783-91a9-04ef411015fa in 1.00s
    INFO:stability_sdk.client:Got keepalive 17900276-1e5c-4783-91a9-04ef411015fa in 3.14s
    INFO:stability_sdk.client:Got 17900276-1e5c-4783-91a9-04ef411015fa with ['ARTIFACT_IMAGE', 'ARTIFACT_CLASSIFICATIONS', 'ARTIFACT_LATENT'] in 0.24s



    
![png](/Users/catherinedeskur/Documents/Fern/fern-platform/clis/jupyter-to-mdx/output/notebooks/guides/Brainstorming_Story_Ideas_with_Cohere_and_Stable_Diffusion_9_7.png)
    


    INFO:stability_sdk.client:Sending request.


    None


    INFO:stability_sdk.client:Got keepalive 21c32d95-29e6-4fba-af29-c80caa7d97b4 in 1.02s
    INFO:stability_sdk.client:Got keepalive 21c32d95-29e6-4fba-af29-c80caa7d97b4 in 3.14s
    INFO:stability_sdk.client:Got 21c32d95-29e6-4fba-af29-c80caa7d97b4 with ['ARTIFACT_IMAGE', 'ARTIFACT_CLASSIFICATIONS', 'ARTIFACT_LATENT'] in 0.22s



    
![png](/Users/catherinedeskur/Documents/Fern/fern-platform/clis/jupyter-to-mdx/output/notebooks/guides/Brainstorming_Story_Ideas_with_Cohere_and_Stable_Diffusion_9_11.png)
    


    None



```python
# UNCOMMENT AND RUN THE FOLLOWING CODE BLOCK TO ENABLE TEXT-TO-IMAGE GENERATION VIA DREAMSTUDIO

# image_prompt_character_2 = f'{character_descriptions[2]} {character_style_2}'
# image_prompt_character_2

# generate_image(image_prompt_character_2)
```

    INFO:stability_sdk.client:Sending request.
    INFO:stability_sdk.client:Got keepalive 16cdeb23-9e20-4638-858e-b0b716bbd554 in 2.65s
    INFO:stability_sdk.client:Got keepalive 16cdeb23-9e20-4638-858e-b0b716bbd554 in 3.10s
    INFO:stability_sdk.client:Got 16cdeb23-9e20-4638-858e-b0b716bbd554 with ['ARTIFACT_IMAGE', 'ARTIFACT_CLASSIFICATIONS', 'ARTIFACT_LATENT'] in 0.21s



    
![png](/Users/catherinedeskur/Documents/Fern/fern-platform/clis/jupyter-to-mdx/output/notebooks/guides/Brainstorming_Story_Ideas_with_Cohere_and_Stable_Diffusion_10_1.png)
    


## Narrative Structure

![https://i.imgur.com/Rkxvlmp.png](https://i.imgur.com/Rkxvlmp.png)


```python
#@title Generate Story Beats

story_structure = """
Examples of breakdowns of stories into a Hero 's Journey structure.

Example 1. A science - fiction fantasy about a naive but ambitious farm boy from a backwater desert who
discovers powers he never knew he had when he teams up with a feisty princess, a mercenary space pilot
and an old wizard warrior to lead a ragtag rebellion against the sinister forces of the evil Galactic
Empire.
Luke Skywalker is the hero. A naive farm boy, he will discover special powers under the guidance of
mentor Ben Kenobi.
Ben Kenobi is the mentor figure. A recluse Jedi warrior, he will take Luke Skywalker as apprentice.
Darth Vader is the antagonist. As a commander of the evil Galactic Empire, he controls space station
The Death Star.
Princess Leia holds the plans of the Death Star. She is feisty and brave. She will become Luke 's
friend.
Han Solo is a brash mercenary space pilot of the Millenium Falcon and a friend of Chebacca. He will
take Luke on his spaceship.
Chewbacca is a furry and trustful monster. He is a friend of Han Solo and a copilot on the Millemium
Falcon.

<scenes>

Place: A farm on planet Tatooine.
Plot element: 1- The Ordinary World.
Beat: Luke Skywalker is living a normal and humble life as a farm boy on his home planet.

Place: Desert of Tatooine.
Plot element: 2- Call to Adventure.
Beat: Luke is called to adventure by Ben Kenobi, who tells him about his Jedi heritage and suggests he come with them.

Place: A farm on planet Tatooine.
Plot element: 3- Refusal of the Call.
Beat: Luke initially refuses to leave his Aunt and Uncle behind for an adventure in space.

Place: A farm on planet Tatooine.
Plot element: 4- Crossing the First Threshold.
Beat: Luke is forced to join the adventure when he discovers his Aunt and Uncle have been killed by the Empire and he has nowhere else to go.

Place: On spaceship The Millennium Falcon.
Plot element: 5- The Approach to the Inmost Cave.
Beat: The group's plan to defeat the Empire and bring the Death Star plans to the Rebellion is thwarted when they arrive at Alderaan and find the planet destroyed. They are pulled into the Death Star by a tractor beam.

Place: On space station The Death Star.
Plot element: 6- The Ordeal and The Reward.
Beat: The group faces challenges on the Death Star, including rescuing Princess Leia and escaping, and Kenobi sacrificing himself. They are successful in retrieving the Death Star plans, giving them the knowledge to destroy the Empire's weapon.

<end>
Example 2. {LOG_LINE}
{CHARACTER_DESCRIPTIONS}
<scenes>"""

character_descriptions_prompt_section = "\n".join(character_descriptions)
prompt = story_structure.format(LOG_LINE=log_line, 
                                CHARACTER_DESCRIPTIONS=character_descriptions_prompt_section)

titles = generate(prompt, 
                  num_generations=1, temperature=1.1, max_tokens=500)

for idx, gen in enumerate(titles['generation'].values):
  print(f"============")
  print(f"Generation {idx}")
  print(gen)

beat_sections = re.findall('(Place.*?)\n\n', gen, re.DOTALL)
# beat_sections

df = pd.DataFrame(columns=['place', 'plot_element', 'beat'])
story_beats = []
for beat_section in beat_sections:
  # print(f'==\n{beat_section}')
  place = re.findall('Place:\s(.*?)\.\n', beat_section, re.DOTALL)
  plot_element = re.findall('Plot element:\s(.*?)\.\n', beat_section, re.DOTALL)
  beat= re.findall('Beat: (.*?)\.', beat_section, re.DOTALL)
  story_beats.append({'place':place[0], 'plot_element': plot_element[0], 'beat':beat[0]})


place_names = re.findall('Place:\s(.*?)\.\nPlot element:', gen, re.DOTALL)
plot_elements = re.findall('Plot element:\s(.*?)\.\n', gen, re.DOTALL)

place_names = pd.Series(place_names).unique()

```

    ============
    Generation 0
    
    
    Place: A bedroom of Gabriel Clarke.
    Plot element: 1- The Ordinary World.
    Beat: Gabriel is lying in his bed, using his computer to hack his friend's computers.
    
    Place: A bedroom of Seymon Evans.
    Plot element: 2- Call to Adventure.
    Beat: Seymon is sitting at his computer, using his hacking skills to find a new target.
    
    Place: A cyber intelligence facility of Henry Forsythe.
    Plot element: 3- Refusal of the Call.
    Beat: Forsythe calls Seymon on his phone and asks him to come down to his office to discuss the 
    Bitcoin heist.
    
    Place: A cyber intelligence facility of Henry Forsythe.
    Plot element: 4- Crossing the First Threshold.
    Beat: Seymon walks down the hallway and knocks on the door to Forsythe's office.
    
    Place: A cyber intelligence facility of Henry Forsythe.
    Plot element: 5- The Approach to the Inmost Cave.
    Beat: Seymon walks into the room and sees Henry Forsythe, a private cyber intelligence agent.
    Seymon does not want to give up his anonymity and leaves the office.
    
    Place: A cyber intelligence facility of Henry Forsythe.
    Plot element: 6- The Ordeal and The Reward.
    Beat: Seymon meets with Forsythe in his office, and tries to explain why he was on the computer 
    at the time the Bitcoin was stolen. Forsythe is not convinced, and Seymon leaves.
    
    <end>



## Location Description
Let's now generate a description for each place mentioned in the story structure.


```python
#@title Generate location descriptions

# Updated prompt. Switched "Description" to "Place description"
place_prompt = """
Example 1. Morgan adopts a new cat, Misterio, who sets a curse on anyone that pets them.
Place: The Adoption Center.
Place Description: The Adoption Center is a sad place, especially for an unadopted pet. It is full of walls
and walls of cages and cages. Inside of each is an abandoned animal, longing for a home. The lighting
is dim, gray, buzzing fluorescent. <end>

Example 2. James finds a well in his backyard that is haunted by the ghost of Sam.
Place: The well.
Place Description: The well is buried under grass and hedges. It is at least twenty feet deep , if not more
and it is masoned with stones. It is 150 years old at least. It stinks of stale, standing water, and
has vines growing up the sides. It is narrow enough to not be able to fit down if you are a grown
adult human. <end>

Example 3. Mr. Dorbenson finds a book at a garage sale that tells the story of his own life. And it
ends in a murder!
Place: The garage sale.
Place Description: It is a garage packed with dusty household goods and antiques. There is a box at the back
that says FREE and is full of paper back books. <end>

Example 4. {LOG_LINE}
Place: {LOCATION_NAME}.
Place Description:"""

# location_descriptions = []
location_descriptions = {}
for location in place_names:

  prompt = place_prompt.format(LOG_LINE=log_line, 
                                LOCATION_NAME=location)

  location_description = generate(prompt, num_generations=1, temperature=1, max_tokens=100)['generation']
  print(f'location: {location}')
  print(f'generated description: {location_description.values[0]}\n\n')
  # location_descriptions.append(location_description.values[0])
  location_descriptions[location] = location_description.values[0]

# location_descriptions
```

    location: A bedroom of Gabriel Clarke
    generated description:  The bedroom is a tiny cubby hole with a desk, a bed, and a lamp. It is neat and tidy 
    but nothing more than that. <end>
    
    
    location: A bedroom of Seymon Evans
    generated description:  Seymon Evans' bedroom is sparsely furnished, containing only a bed, 
    a nightstand, and a lamp. His walls are bare, and the only decoration in the room is a 
    corkboard hung next to his bed. The corkboard contains a number of scraps of paper 
    and a small whiteboard that has been mostly wiped off. <end>
    
    
    location: A cyber intelligence facility of Henry Forsythe
    generated description:  The facility is like a fortress with dark walls of concrete, steel and 
    glass. In the middle of the building is a cube-shaped machine, which serves as 
    the central computer and network hub for the entire building. <end>
    
    



```python
# UNCOMMENT AND RUN THE FOLLOWING CODE BLOCK TO ENABLE TEXT-TO-IMAGE GENERATION VIA DREAMSTUDIO

# # https://lexica.art/prompt/86975be7-69c1-4aed-b95f-8d24b0df2537
# room_style_1 = """ultra mega super hyper realistic Digital concept interior design.
# stone walls and neon lights, a lot of electronics. Natural white 
# sunlight from the transperient roof. Rendered in VRAY and  DaVinci Resolve and 
# MAXWELL and LUMION 3D, Volumetric natural light"""

# location_description = location_descriptions[0]
# location_description = """shabby, mostly vacant offices. Two hackers are at the office
# door."""

# image_prompt_room_1 = f'{location_description} {room_style_1}'
# print(image_prompt_room_1)

# # Generate images
# for i in range (3):
#   print(generate_image(image_prompt_room_1))
```

    INFO:stability_sdk.client:Sending request.


    shabby, mostly vacant offices. Two hackers are at the office
    door. ultra mega super hyper realistic Digital concept interior design.
    stone walls and neon lights, a lot of electronics. Natural white 
    sunlight from the transperient roof. Rendered in VRAY and  DaVinci Resolve and 
    MAXWELL and LUMION 3D, Volumetric natural light


    INFO:stability_sdk.client:Got keepalive a572398f-2445-40b1-960e-da7cc76f585a in 2.23s
    INFO:stability_sdk.client:Got keepalive a572398f-2445-40b1-960e-da7cc76f585a in 3.08s
    INFO:stability_sdk.client:Got a572398f-2445-40b1-960e-da7cc76f585a with ['ARTIFACT_IMAGE', 'ARTIFACT_CLASSIFICATIONS', 'ARTIFACT_LATENT'] in 0.21s



    
![png](/Users/catherinedeskur/Documents/Fern/fern-platform/clis/jupyter-to-mdx/output/notebooks/guides/Brainstorming_Story_Ideas_with_Cohere_and_Stable_Diffusion_15_3.png)
    


    INFO:stability_sdk.client:Sending request.


    None


    INFO:stability_sdk.client:Got keepalive 7d2ac518-1d76-4e3a-b13b-f13cb05eaaee in 3.76s
    INFO:stability_sdk.client:Got keepalive 7d2ac518-1d76-4e3a-b13b-f13cb05eaaee in 2.88s
    INFO:stability_sdk.client:Got 7d2ac518-1d76-4e3a-b13b-f13cb05eaaee with ['ARTIFACT_IMAGE', 'ARTIFACT_CLASSIFICATIONS', 'ARTIFACT_LATENT'] in 0.20s



    
![png](/Users/catherinedeskur/Documents/Fern/fern-platform/clis/jupyter-to-mdx/output/notebooks/guides/Brainstorming_Story_Ideas_with_Cohere_and_Stable_Diffusion_15_7.png)
    


    INFO:stability_sdk.client:Sending request.


    None


    INFO:stability_sdk.client:Got keepalive acd1498c-a514-4a18-823e-b3139aa20e98 in 3.30s
    INFO:stability_sdk.client:Got keepalive acd1498c-a514-4a18-823e-b3139aa20e98 in 3.10s
    INFO:stability_sdk.client:Got acd1498c-a514-4a18-823e-b3139aa20e98 with ['ARTIFACT_IMAGE', 'ARTIFACT_CLASSIFICATIONS', 'ARTIFACT_LATENT'] in 0.21s



    
![png](/Users/catherinedeskur/Documents/Fern/fern-platform/clis/jupyter-to-mdx/output/notebooks/guides/Brainstorming_Story_Ideas_with_Cohere_and_Stable_Diffusion_15_11.png)
    


    None



```python
#@title Generate Dialog for scenes

dialog_prompt ="""Given Example 1, write the dialog for Example 2 using the same structure.

Example 1.
Place : Cockpit of an airplane.
Description: Cockpit of a modern passenger airplane , American Flight 812.
Characters: Jeff is the hero. A man in his early forties, he tries to stay calm in all circumstance.
Jeff is now a airline pilot. Danny, a young airplane pilot in his thirties, is eager to learn but can
quickly lose his composture. Danny is enamored of Edith. Edith, an experienced stewardess with a good
sense of humour, is trustworthy and dependable. Edith likes to tease Danny.
Plot element: Crossing the First Threshold.
Summary: Residents of San Fernando Valley are under attack by flying saucers from outer space. The
aliens are extraterrestrials who seek to stop humanity from creating a doomsday weapon that could
destroy the universe and unleash the living dead to stalk humans who wander into the cemetery looking
for evidence of the UFOs. The hero Jeff, an airline pilot, will face the aliens.
Previous beat: Flight captain Jeff reluctantly leaves his wife Paula to go for a two-day flight.
Beat: At the cockpit, flight captain Jeff is preoccupied by the flying saucer appearances and
graveyard incidents in his home town, where he left wis wife Paula. Without success, co-pilot Danny
and stewardess Edith try to reassure him.

<dialog>
Character names: DANNY, JEFF, EDITH

DANNY
You're mighty silent this trip, Jeff.

JEFF
Huh?

DANNY
You haven't spoken ten words since takeoff.

JEFF
I guess I'm preoccupied, Danny.

DANNY
We've got thirty - three passengers back there that have time to be preoccupied .
Flying this flybird doesn 't give you that opportunity.

JEFF
I guess you're right, Danny.

DANNY
Paula?

JEFF
Yeah.

DANNY
There's nothing wrong between you two?

JEFF
Oh no, nothing like that. Just that I'm worried, she being there alone and
those strange things flying over the house and those incidents in the graveyard
the past few days. It's just got me worried.

DANNY
Well , I haven't figured out those crazy skybirds yet but I give you fifty to one
odds the police have figured out that cemetery thing by now.

(Enter EDITH)

JEFF
I hope so.

EDITH
If you're really that worried Jeff why don't you radio in and find out? Mac
should be on duty at the field by now. He could call Paula and relay the message
to you.

DANNY
Hi Edith.

EDITH
Hi Silents. I haven't heard a word from this end of the plane since we left the
field.

DANNY
Jeff's been giving me and himself a study in silence.

EDITH
You boys are feudin'?

JEFF
Oh no Edie, nothing like that.

DANNY
Hey Edie, how about you and me balling it up in Albuquerque?

EDITH
Albuquerque? Have you read that flight schedule Boy?

DANNY
What about it?

EDITH
We land in Albuquerque at 4 am. That's strictly a nine o' clock town.

DANNY
Well I know a friend that'll help us --

EDITH
Let's have a problem first, huh Danny.

DANNY
Ah he's worried about Paula.

EDITH
I read about that cemetery business. I tried to get you kids to not buy too near
one of those things. We get there soon enough as it is.

DANNY
He thought it'd be quiet and peaceful there.

EDITH
No doubt about that. It's quiet alright, like a tomb. I'm sorry Jeff, that was a
bad joke.

Example 2.
Place: {PLACE_NAME}
Description: {PLACE_DESCRIPTION}
Characters: {CHARACTER_DESCRIPTIONS}
Plot element: {PLOT_ELEMENT}
Summary: {LOG_LINE}
Previous beat: {PREVIOUS_BEAT}
Beat: {BEAT}
<dialog>
Character names: GABRIEL CLARKE, SEYMON EVANS, HENRY FORSYTHE"""

dialogs = []
for idx, beat_info in enumerate(story_beats):

  if idx == 0:
    previous_beat = ''
  else:
    previous_beat = story_beats[idx-1]['beat']

  prompt = dialog_prompt.format(PLACE_NAME=beat_info['place'],  
                            PLACE_DESCRIPTION=location_descriptions[beat_info['place']],
                            LOG_LINE=log_line, 
                            CHARACTER_DESCRIPTIONS=character_descriptions_prompt_section,
                            PLOT_ELEMENT=beat_info['plot_element'],
                            PREVIOUS_BEAT=previous_beat,
                            BEAT = beat_info['beat'])
  
  dialog = generate(prompt, model="command", num_generations=1, temperature=2, max_tokens=500)['generation']
  print("-"*100)
  print("PROMPT:\n",prompt)
  print("DIALOG:\n",dialog.values[0])
  dialogs.append(dialog)

```

    ----------------------------------------------------------------------------------------------------
    PROMPT:
     Given Example 1, write the dialog for Example 2 using the same structure.
    
    Example 1.
    Place : Cockpit of an airplane.
    Description: Cockpit of a modern passenger airplane , American Flight 812.
    Characters: Jeff is the hero. A man in his early forties, he tries to stay calm in all circumstance.
    Jeff is now a airline pilot. Danny, a young airplane pilot in his thirties, is eager to learn but can
    quickly lose his composture. Danny is enamored of Edith. Edith, an experienced stewardess with a good
    sense of humour, is trustworthy and dependable. Edith likes to tease Danny.
    Plot element: Crossing the First Threshold.
    Summary: Residents of San Fernando Valley are under attack by flying saucers from outer space. The
    aliens are extraterrestrials who seek to stop humanity from creating a doomsday weapon that could
    destroy the universe and unleash the living dead to stalk humans who wander into the cemetery looking
    for evidence of the UFOs. The hero Jeff, an airline pilot, will face the aliens.
    Previous beat: Flight captain Jeff reluctantly leaves his wife Paula to go for a two-day flight.
    Beat: At the cockpit, flight captain Jeff is preoccupied by the flying saucer appearances and
    graveyard incidents in his home town, where he left wis wife Paula. Without success, co-pilot Danny
    and stewardess Edith try to reassure him.
    
    <dialog>
    Character names: DANNY, JEFF, EDITH
    
    DANNY
    You're mighty silent this trip, Jeff.
    
    JEFF
    Huh?
    
    DANNY
    You haven't spoken ten words since takeoff.
    
    JEFF
    I guess I'm preoccupied, Danny.
    
    DANNY
    We've got thirty - three passengers back there that have time to be preoccupied .
    Flying this flybird doesn 't give you that opportunity.
    
    JEFF
    I guess you're right, Danny.
    
    DANNY
    Paula?
    
    JEFF
    Yeah.
    
    DANNY
    There's nothing wrong between you two?
    
    JEFF
    Oh no, nothing like that. Just that I'm worried, she being there alone and
    those strange things flying over the house and those incidents in the graveyard
    the past few days. It's just got me worried.
    
    DANNY
    Well , I haven't figured out those crazy skybirds yet but I give you fifty to one
    odds the police have figured out that cemetery thing by now.
    
    (Enter EDITH)
    
    JEFF
    I hope so.
    
    EDITH
    If you're really that worried Jeff why don't you radio in and find out? Mac
    should be on duty at the field by now. He could call Paula and relay the message
    to you.
    
    DANNY
    Hi Edith.
    
    EDITH
    Hi Silents. I haven't heard a word from this end of the plane since we left the
    field.
    
    DANNY
    Jeff's been giving me and himself a study in silence.
    
    EDITH
    You boys are feudin'?
    
    JEFF
    Oh no Edie, nothing like that.
    
    DANNY
    Hey Edie, how about you and me balling it up in Albuquerque?
    
    EDITH
    Albuquerque? Have you read that flight schedule Boy?
    
    DANNY
    What about it?
    
    EDITH
    We land in Albuquerque at 4 am. That's strictly a nine o' clock town.
    
    DANNY
    Well I know a friend that'll help us --
    
    EDITH
    Let's have a problem first, huh Danny.
    
    DANNY
    Ah he's worried about Paula.
    
    EDITH
    I read about that cemetery business. I tried to get you kids to not buy too near
    one of those things. We get there soon enough as it is.
    
    DANNY
    He thought it'd be quiet and peaceful there.
    
    EDITH
    No doubt about that. It's quiet alright, like a tomb. I'm sorry Jeff, that was a
    bad joke.
    
    Example 2.
    Place: A bedroom of Gabriel Clarke
    Description:  The bedroom is a tiny cubby hole with a desk, a bed, and a lamp. It is neat and tidy 
    but nothing more than that. <end>
    Characters: Gabriel Clarke is the main protagonist. A talented young 
    hacker who enjoys his anonymity, he enjoys hacking his friend's computers. 
    Seymon Evans is the other main protagonist. A talented young 
    hacker, he is more motivated than Gabriel Clarke and has more experience. 
    Henry Forsythe is the antagonist. A private cyber intelligence 
    agent, he is responsible for the investigation of the Bitcoin heist.
    Plot element: 1- The Ordinary World
    Summary: Scifi cyberpunk story about two hackers who find themselves both 
    the targets of a cyber intelligence agent who suspects them of stealing $3.5 
    million worth of Bitcoin. The two do not know each other, and neither of them 
    recalls stealing the sum.
    Previous beat: 
    Beat: Gabriel is lying in his bed, using his computer to hack his friend's computers
    <dialog>
    Character names: GABRIEL CLARKE, SEYMON EVANS, HENRY FORSYTHE
    DIALOG:
     
    GABRIEL
    Who are you, what do you want, and why are you in my house?
    
    SEYMON
    Sorry to startle you. I'm Seymon Evans, a friend of Dan's.
    
    GABRIEL
    How do you know Dan?
    
    SEYMON
    We were in the army together.
    
    GABRIEL
    How did you find out about me?
    
    SEYMON
    Dan's a great guy, but he doesn't have much of a memory.  He didn't even
    remember telling me about you.
    
    GABRIEL
    So you came all this way to check me out.
    
    SEYMON
    Well, I had some time on my hands, and it sounded like an interesting challenge.
    
    GABRIEL
    And here I was thinking you were here to steal my secret hack!
    
    SEYMON
    Who says I didn't?
    
    GABRIEL
    Who are you, really?
    
    SEYMON
    Why do you care?
    
    GABRIEL
    Because I don't want to get killed.
    
    SEYMON
    You have nothing to worry about. I just want to know who I'm dealing with.
    
    GABRIEL
    You mean, whether I'm an undercover government agent?
    
    SEYMON
    Don't be paranoid. I just want to know your name and where you're from.
    
    GABRIEL
    Okay. I'm Gabriel Clarke, from Manchester, England.
    
    SEYMON
    Manchester, England. I've never been there.
    
    GABRIEL
    And I've never been to San Francisco.
    
    SEYMON
    San Francisco? That's a long way from Manchester.
    
    GABRIEL
    What do you want, Seymon?
    
    SEYMON
    You hacked Dan's computer, didn't you?
    
    GABRIEL
    I did, but only because he gave me his password.
    
    SEYMON
    And what did you find?
    
    GABRIEL
    That's my secret.
    
    SEYMON
    You're telling me that you didn't try to steal the $3.5 million worth of
    Bitcoin that was stolen from my client?
    
    GABRIEL
    $3.5 million? Are you serious?
    ----------------------------------------------------------------------------------------------------
    PROMPT:
     Given Example 1, write the dialog for Example 2 using the same structure.
    
    Example 1.
    Place : Cockpit of an airplane.
    Description: Cockpit of a modern passenger airplane , American Flight 812.
    Characters: Jeff is the hero. A man in his early forties, he tries to stay calm in all circumstance.
    Jeff is now a airline pilot. Danny, a young airplane pilot in his thirties, is eager to learn but can
    quickly lose his composture. Danny is enamored of Edith. Edith, an experienced stewardess with a good
    sense of humour, is trustworthy and dependable. Edith likes to tease Danny.
    Plot element: Crossing the First Threshold.
    Summary: Residents of San Fernando Valley are under attack by flying saucers from outer space. The
    aliens are extraterrestrials who seek to stop humanity from creating a doomsday weapon that could
    destroy the universe and unleash the living dead to stalk humans who wander into the cemetery looking
    for evidence of the UFOs. The hero Jeff, an airline pilot, will face the aliens.
    Previous beat: Flight captain Jeff reluctantly leaves his wife Paula to go for a two-day flight.
    Beat: At the cockpit, flight captain Jeff is preoccupied by the flying saucer appearances and
    graveyard incidents in his home town, where he left wis wife Paula. Without success, co-pilot Danny
    and stewardess Edith try to reassure him.
    
    <dialog>
    Character names: DANNY, JEFF, EDITH
    
    DANNY
    You're mighty silent this trip, Jeff.
    
    JEFF
    Huh?
    
    DANNY
    You haven't spoken ten words since takeoff.
    
    JEFF
    I guess I'm preoccupied, Danny.
    
    DANNY
    We've got thirty - three passengers back there that have time to be preoccupied .
    Flying this flybird doesn 't give you that opportunity.
    
    JEFF
    I guess you're right, Danny.
    
    DANNY
    Paula?
    
    JEFF
    Yeah.
    
    DANNY
    There's nothing wrong between you two?
    
    JEFF
    Oh no, nothing like that. Just that I'm worried, she being there alone and
    those strange things flying over the house and those incidents in the graveyard
    the past few days. It's just got me worried.
    
    DANNY
    Well , I haven't figured out those crazy skybirds yet but I give you fifty to one
    odds the police have figured out that cemetery thing by now.
    
    (Enter EDITH)
    
    JEFF
    I hope so.
    
    EDITH
    If you're really that worried Jeff why don't you radio in and find out? Mac
    should be on duty at the field by now. He could call Paula and relay the message
    to you.
    
    DANNY
    Hi Edith.
    
    EDITH
    Hi Silents. I haven't heard a word from this end of the plane since we left the
    field.
    
    DANNY
    Jeff's been giving me and himself a study in silence.
    
    EDITH
    You boys are feudin'?
    
    JEFF
    Oh no Edie, nothing like that.
    
    DANNY
    Hey Edie, how about you and me balling it up in Albuquerque?
    
    EDITH
    Albuquerque? Have you read that flight schedule Boy?
    
    DANNY
    What about it?
    
    EDITH
    We land in Albuquerque at 4 am. That's strictly a nine o' clock town.
    
    DANNY
    Well I know a friend that'll help us --
    
    EDITH
    Let's have a problem first, huh Danny.
    
    DANNY
    Ah he's worried about Paula.
    
    EDITH
    I read about that cemetery business. I tried to get you kids to not buy too near
    one of those things. We get there soon enough as it is.
    
    DANNY
    He thought it'd be quiet and peaceful there.
    
    EDITH
    No doubt about that. It's quiet alright, like a tomb. I'm sorry Jeff, that was a
    bad joke.
    
    Example 2.
    Place: A bedroom of Seymon Evans
    Description:  Seymon Evans' bedroom is sparsely furnished, containing only a bed, 
    a nightstand, and a lamp. His walls are bare, and the only decoration in the room is a 
    corkboard hung next to his bed. The corkboard contains a number of scraps of paper 
    and a small whiteboard that has been mostly wiped off. <end>
    Characters: Gabriel Clarke is the main protagonist. A talented young 
    hacker who enjoys his anonymity, he enjoys hacking his friend's computers. 
    Seymon Evans is the other main protagonist. A talented young 
    hacker, he is more motivated than Gabriel Clarke and has more experience. 
    Henry Forsythe is the antagonist. A private cyber intelligence 
    agent, he is responsible for the investigation of the Bitcoin heist.
    Plot element: 2- Call to Adventure
    Summary: Scifi cyberpunk story about two hackers who find themselves both 
    the targets of a cyber intelligence agent who suspects them of stealing $3.5 
    million worth of Bitcoin. The two do not know each other, and neither of them 
    recalls stealing the sum.
    Previous beat: Gabriel is lying in his bed, using his computer to hack his friend's computers
    Beat: Seymon is sitting at his computer, using his hacking skills to find a new target
    <dialog>
    Character names: GABRIEL CLARKE, SEYMON EVANS, HENRY FORSYTHE
    DIALOG:
     
    GABRIEL CLARKE
    Good morning, Seymon.
    
    SEYMON EVANS
    Good morning, Gabriel.
    
    GABRIEL CLARKE
    I heard you were working on a project this morning.
    
    SEYMON EVANS
    Yeah, I'm trying to hack this bank's server. I need to get into their database.
    
    GABRIEL CLARKE
    You're really determined to get that money back, huh?
    
    SEYMON EVANS
    Of course I am. I don't want that hacker to get away with my money.
    
    GABRIEL CLARKE
    I don't think you're going to be able to do it.
    
    SEYMON EVANS
    Why not?
    
    GABRIEL CLARKE
    The bank's server is too well protected. I think you're going to have to come up with a different plan.
    
    SEYMON EVANS
    Well, I'm not going to give up that easily. I'll keep trying.
    
    GABRIEL CLARKE
    I'm not trying to discourage you, Seymon. I just think you need to be realistic.
    
    SEYMON EVANS
    I'll keep at it. I'm sure I'll come up with something.
    
    GABRIEL CLARKE
    Okay, Seymon. Just remember to be careful. I don't want to see you get caught.
    
    SEYMON EVANS
    Don't worry, Gabriel. I'll be careful.
    
    GABRIEL CLARKE
    Okay, then. I'll let you get back to work.
    
    SEYMON EVANS
    Thanks, Gabriel.
    
    GABRIEL CLARKE
    Bye, Seymon.
    
    SEYMON EVANS
    Bye, Gabriel.
    
    GABRIEL CLARKE
    </dialog>
    </beat>
    ----------------------------------------------------------------------------------------------------
    PROMPT:
     Given Example 1, write the dialog for Example 2 using the same structure.
    
    Example 1.
    Place : Cockpit of an airplane.
    Description: Cockpit of a modern passenger airplane , American Flight 812.
    Characters: Jeff is the hero. A man in his early forties, he tries to stay calm in all circumstance.
    Jeff is now a airline pilot. Danny, a young airplane pilot in his thirties, is eager to learn but can
    quickly lose his composture. Danny is enamored of Edith. Edith, an experienced stewardess with a good
    sense of humour, is trustworthy and dependable. Edith likes to tease Danny.
    Plot element: Crossing the First Threshold.
    Summary: Residents of San Fernando Valley are under attack by flying saucers from outer space. The
    aliens are extraterrestrials who seek to stop humanity from creating a doomsday weapon that could
    destroy the universe and unleash the living dead to stalk humans who wander into the cemetery looking
    for evidence of the UFOs. The hero Jeff, an airline pilot, will face the aliens.
    Previous beat: Flight captain Jeff reluctantly leaves his wife Paula to go for a two-day flight.
    Beat: At the cockpit, flight captain Jeff is preoccupied by the flying saucer appearances and
    graveyard incidents in his home town, where he left wis wife Paula. Without success, co-pilot Danny
    and stewardess Edith try to reassure him.
    
    <dialog>
    Character names: DANNY, JEFF, EDITH
    
    DANNY
    You're mighty silent this trip, Jeff.
    
    JEFF
    Huh?
    
    DANNY
    You haven't spoken ten words since takeoff.
    
    JEFF
    I guess I'm preoccupied, Danny.
    
    DANNY
    We've got thirty - three passengers back there that have time to be preoccupied .
    Flying this flybird doesn 't give you that opportunity.
    
    JEFF
    I guess you're right, Danny.
    
    DANNY
    Paula?
    
    JEFF
    Yeah.
    
    DANNY
    There's nothing wrong between you two?
    
    JEFF
    Oh no, nothing like that. Just that I'm worried, she being there alone and
    those strange things flying over the house and those incidents in the graveyard
    the past few days. It's just got me worried.
    
    DANNY
    Well , I haven't figured out those crazy skybirds yet but I give you fifty to one
    odds the police have figured out that cemetery thing by now.
    
    (Enter EDITH)
    
    JEFF
    I hope so.
    
    EDITH
    If you're really that worried Jeff why don't you radio in and find out? Mac
    should be on duty at the field by now. He could call Paula and relay the message
    to you.
    
    DANNY
    Hi Edith.
    
    EDITH
    Hi Silents. I haven't heard a word from this end of the plane since we left the
    field.
    
    DANNY
    Jeff's been giving me and himself a study in silence.
    
    EDITH
    You boys are feudin'?
    
    JEFF
    Oh no Edie, nothing like that.
    
    DANNY
    Hey Edie, how about you and me balling it up in Albuquerque?
    
    EDITH
    Albuquerque? Have you read that flight schedule Boy?
    
    DANNY
    What about it?
    
    EDITH
    We land in Albuquerque at 4 am. That's strictly a nine o' clock town.
    
    DANNY
    Well I know a friend that'll help us --
    
    EDITH
    Let's have a problem first, huh Danny.
    
    DANNY
    Ah he's worried about Paula.
    
    EDITH
    I read about that cemetery business. I tried to get you kids to not buy too near
    one of those things. We get there soon enough as it is.
    
    DANNY
    He thought it'd be quiet and peaceful there.
    
    EDITH
    No doubt about that. It's quiet alright, like a tomb. I'm sorry Jeff, that was a
    bad joke.
    
    Example 2.
    Place: A cyber intelligence facility of Henry Forsythe
    Description:  The facility is like a fortress with dark walls of concrete, steel and 
    glass. In the middle of the building is a cube-shaped machine, which serves as 
    the central computer and network hub for the entire building. <end>
    Characters: Gabriel Clarke is the main protagonist. A talented young 
    hacker who enjoys his anonymity, he enjoys hacking his friend's computers. 
    Seymon Evans is the other main protagonist. A talented young 
    hacker, he is more motivated than Gabriel Clarke and has more experience. 
    Henry Forsythe is the antagonist. A private cyber intelligence 
    agent, he is responsible for the investigation of the Bitcoin heist.
    Plot element: 3- Refusal of the Call
    Summary: Scifi cyberpunk story about two hackers who find themselves both 
    the targets of a cyber intelligence agent who suspects them of stealing $3.5 
    million worth of Bitcoin. The two do not know each other, and neither of them 
    recalls stealing the sum.
    Previous beat: Seymon is sitting at his computer, using his hacking skills to find a new target
    Beat: Forsythe calls Seymon on his phone and asks him to come down to his office to discuss the 
    Bitcoin heist
    <dialog>
    Character names: GABRIEL CLARKE, SEYMON EVANS, HENRY FORSYTHE
    DIALOG:
     
    GABRIEL CLARKE
    What is it?
    
    SEYMON EVANS
    Henry Forsythe. He's the guy I was telling you about, the guy who is looking 
    for the thief who hacked the Bitcoin accounts.
    
    GABRIEL CLARKE
    I see.
    
    SEYMON EVANS
    I'm heading down there to his office right now. You should come along.
    
    GABRIEL CLARKE
    Sure. Let me grab my laptop.
    
    SEYMON EVANS
    Good. Let's go.
    
    HENRY FORSYTHE
    Come in.
    
    SEYMON EVANS
    Hey, Forsythe.
    
    HENRY FORSYTHE
    Hi Seymon.
    
    SEYMON EVANS
    This is Gabriel Clarke.
    
    HENRY FORSYTHE
    Ah yes. How do you do?
    
    GABRIEL CLARKE
    Fine, thank you.
    
    HENRY FORSYTHE
    Have a seat, gentlemen.
    
    SEYMON EVANS
    Thanks.
    
    GABRIEL CLARKE
    Thank you.
    
    HENRY FORSYTHE
    What can I do for you?
    
    SEYMON EVANS
    Well, it's about the Bitcoin heist.
    
    HENRY FORSYTHE
    Yes. What about it?
    
    SEYMON EVANS
    The thief who hacked the Bitcoin accounts was very talented. I mean, to hack
    three and a half million dollars worth of Bitcoin is quite an achievement.
    
    HENRY FORSYTHE
    That's true.
    
    GABRIEL CLARKE
    Who did it?
    
    HENRY FORSYTHE
    I don't know.
    
    GABRIEL CLARKE
    But you think it's one of us, right?
    
    HENRY FORSYTHE
    Yes. I do.
    
    SEYMON EVANS
    So, you think it's either Seymon or me.
    
    HENRY FORSYTHE
    It could be.
    
    SEYMON EVANS
    Well, that's your opinion. I didn't do it, and neither did Gabriel.
    
    GABRIEL CLARKE
    I didn't do it either.
    
    HENRY FORSYTHE
    So,
    ----------------------------------------------------------------------------------------------------
    PROMPT:
     Given Example 1, write the dialog for Example 2 using the same structure.
    
    Example 1.
    Place : Cockpit of an airplane.
    Description: Cockpit of a modern passenger airplane , American Flight 812.
    Characters: Jeff is the hero. A man in his early forties, he tries to stay calm in all circumstance.
    Jeff is now a airline pilot. Danny, a young airplane pilot in his thirties, is eager to learn but can
    quickly lose his composture. Danny is enamored of Edith. Edith, an experienced stewardess with a good
    sense of humour, is trustworthy and dependable. Edith likes to tease Danny.
    Plot element: Crossing the First Threshold.
    Summary: Residents of San Fernando Valley are under attack by flying saucers from outer space. The
    aliens are extraterrestrials who seek to stop humanity from creating a doomsday weapon that could
    destroy the universe and unleash the living dead to stalk humans who wander into the cemetery looking
    for evidence of the UFOs. The hero Jeff, an airline pilot, will face the aliens.
    Previous beat: Flight captain Jeff reluctantly leaves his wife Paula to go for a two-day flight.
    Beat: At the cockpit, flight captain Jeff is preoccupied by the flying saucer appearances and
    graveyard incidents in his home town, where he left wis wife Paula. Without success, co-pilot Danny
    and stewardess Edith try to reassure him.
    
    <dialog>
    Character names: DANNY, JEFF, EDITH
    
    DANNY
    You're mighty silent this trip, Jeff.
    
    JEFF
    Huh?
    
    DANNY
    You haven't spoken ten words since takeoff.
    
    JEFF
    I guess I'm preoccupied, Danny.
    
    DANNY
    We've got thirty - three passengers back there that have time to be preoccupied .
    Flying this flybird doesn 't give you that opportunity.
    
    JEFF
    I guess you're right, Danny.
    
    DANNY
    Paula?
    
    JEFF
    Yeah.
    
    DANNY
    There's nothing wrong between you two?
    
    JEFF
    Oh no, nothing like that. Just that I'm worried, she being there alone and
    those strange things flying over the house and those incidents in the graveyard
    the past few days. It's just got me worried.
    
    DANNY
    Well , I haven't figured out those crazy skybirds yet but I give you fifty to one
    odds the police have figured out that cemetery thing by now.
    
    (Enter EDITH)
    
    JEFF
    I hope so.
    
    EDITH
    If you're really that worried Jeff why don't you radio in and find out? Mac
    should be on duty at the field by now. He could call Paula and relay the message
    to you.
    
    DANNY
    Hi Edith.
    
    EDITH
    Hi Silents. I haven't heard a word from this end of the plane since we left the
    field.
    
    DANNY
    Jeff's been giving me and himself a study in silence.
    
    EDITH
    You boys are feudin'?
    
    JEFF
    Oh no Edie, nothing like that.
    
    DANNY
    Hey Edie, how about you and me balling it up in Albuquerque?
    
    EDITH
    Albuquerque? Have you read that flight schedule Boy?
    
    DANNY
    What about it?
    
    EDITH
    We land in Albuquerque at 4 am. That's strictly a nine o' clock town.
    
    DANNY
    Well I know a friend that'll help us --
    
    EDITH
    Let's have a problem first, huh Danny.
    
    DANNY
    Ah he's worried about Paula.
    
    EDITH
    I read about that cemetery business. I tried to get you kids to not buy too near
    one of those things. We get there soon enough as it is.
    
    DANNY
    He thought it'd be quiet and peaceful there.
    
    EDITH
    No doubt about that. It's quiet alright, like a tomb. I'm sorry Jeff, that was a
    bad joke.
    
    Example 2.
    Place: A cyber intelligence facility of Henry Forsythe
    Description:  The facility is like a fortress with dark walls of concrete, steel and 
    glass. In the middle of the building is a cube-shaped machine, which serves as 
    the central computer and network hub for the entire building. <end>
    Characters: Gabriel Clarke is the main protagonist. A talented young 
    hacker who enjoys his anonymity, he enjoys hacking his friend's computers. 
    Seymon Evans is the other main protagonist. A talented young 
    hacker, he is more motivated than Gabriel Clarke and has more experience. 
    Henry Forsythe is the antagonist. A private cyber intelligence 
    agent, he is responsible for the investigation of the Bitcoin heist.
    Plot element: 4- Crossing the First Threshold
    Summary: Scifi cyberpunk story about two hackers who find themselves both 
    the targets of a cyber intelligence agent who suspects them of stealing $3.5 
    million worth of Bitcoin. The two do not know each other, and neither of them 
    recalls stealing the sum.
    Previous beat: Forsythe calls Seymon on his phone and asks him to come down to his office to discuss the 
    Bitcoin heist
    Beat: Seymon walks down the hallway and knocks on the door to Forsythe's office
    <dialog>
    Character names: GABRIEL CLARKE, SEYMON EVANS, HENRY FORSYTHE
    DIALOG:
     
    GABRIEL CLARKE
    Dude, what's up with you?
    
    SEYMON EVANS
    Nothing. Why?
    
    GABRIEL CLARKE
    I thought I would find you at the computer, trying to crack the last line of code on 
    that file I sent you yesterday.
    
    SEYMON EVANS
    Nah, I've been taking a break. Besides, I already solved that code. I just need to 
    add it to the file.
    
    GABRIEL CLARKE
    Well, that's great!
    
    SEYMON EVANS
    I know. I'm excited too. But first, I need to talk to Henry about something.
    
    GABRIEL CLARKE
    Oh, that's too bad.
    
    SEYMON EVANS
    I know, I'm sorry. But I need to do this, you understand?
    
    GABRIEL CLARKE
    Of course, man. It's your life. I understand.
    
    SEYMON EVANS
    Thanks. I'll talk to you later, okay?
    
    GABRIEL CLARKE
    Yeah, sure. Take care.
    
    SEYMON EVANS
    I will. See you later.
    
    HENRY FORSYTHE
    (FROM OFF)
    Come in.
    
    SEYMON EVANS
    Hi Henry.
    
    HENRY FORSYTHE
    Hello, Seymon. Come on in. Have a seat.
    
    SEYMON EVANS
    Thanks.
    
    HENRY FORSYTHE
    So, how was your day?
    
    SEYMON EVANS
    Pretty good. How was yours?
    
    HENRY FORSYTHE
    Oh, pretty busy. The media has been all over me, trying to get a scoop on the 
    Bitcoin heist.
    
    SEYMON EVANS
    Yeah, I heard. I can't believe they haven't figured out it was me yet.
    
    HENRY FORSYTHE
    Who said it was you?
    
    SEYMON EVANS
    Well, I was just joking around. I know it wasn't me, of course. I don't 
    have that kind of money.
    
    HENRY FORSYTHE
    No, of course not. It wasn't you. I just meant that the media has
    ----------------------------------------------------------------------------------------------------
    PROMPT:
     Given Example 1, write the dialog for Example 2 using the same structure.
    
    Example 1.
    Place : Cockpit of an airplane.
    Description: Cockpit of a modern passenger airplane , American Flight 812.
    Characters: Jeff is the hero. A man in his early forties, he tries to stay calm in all circumstance.
    Jeff is now a airline pilot. Danny, a young airplane pilot in his thirties, is eager to learn but can
    quickly lose his composture. Danny is enamored of Edith. Edith, an experienced stewardess with a good
    sense of humour, is trustworthy and dependable. Edith likes to tease Danny.
    Plot element: Crossing the First Threshold.
    Summary: Residents of San Fernando Valley are under attack by flying saucers from outer space. The
    aliens are extraterrestrials who seek to stop humanity from creating a doomsday weapon that could
    destroy the universe and unleash the living dead to stalk humans who wander into the cemetery looking
    for evidence of the UFOs. The hero Jeff, an airline pilot, will face the aliens.
    Previous beat: Flight captain Jeff reluctantly leaves his wife Paula to go for a two-day flight.
    Beat: At the cockpit, flight captain Jeff is preoccupied by the flying saucer appearances and
    graveyard incidents in his home town, where he left wis wife Paula. Without success, co-pilot Danny
    and stewardess Edith try to reassure him.
    
    <dialog>
    Character names: DANNY, JEFF, EDITH
    
    DANNY
    You're mighty silent this trip, Jeff.
    
    JEFF
    Huh?
    
    DANNY
    You haven't spoken ten words since takeoff.
    
    JEFF
    I guess I'm preoccupied, Danny.
    
    DANNY
    We've got thirty - three passengers back there that have time to be preoccupied .
    Flying this flybird doesn 't give you that opportunity.
    
    JEFF
    I guess you're right, Danny.
    
    DANNY
    Paula?
    
    JEFF
    Yeah.
    
    DANNY
    There's nothing wrong between you two?
    
    JEFF
    Oh no, nothing like that. Just that I'm worried, she being there alone and
    those strange things flying over the house and those incidents in the graveyard
    the past few days. It's just got me worried.
    
    DANNY
    Well , I haven't figured out those crazy skybirds yet but I give you fifty to one
    odds the police have figured out that cemetery thing by now.
    
    (Enter EDITH)
    
    JEFF
    I hope so.
    
    EDITH
    If you're really that worried Jeff why don't you radio in and find out? Mac
    should be on duty at the field by now. He could call Paula and relay the message
    to you.
    
    DANNY
    Hi Edith.
    
    EDITH
    Hi Silents. I haven't heard a word from this end of the plane since we left the
    field.
    
    DANNY
    Jeff's been giving me and himself a study in silence.
    
    EDITH
    You boys are feudin'?
    
    JEFF
    Oh no Edie, nothing like that.
    
    DANNY
    Hey Edie, how about you and me balling it up in Albuquerque?
    
    EDITH
    Albuquerque? Have you read that flight schedule Boy?
    
    DANNY
    What about it?
    
    EDITH
    We land in Albuquerque at 4 am. That's strictly a nine o' clock town.
    
    DANNY
    Well I know a friend that'll help us --
    
    EDITH
    Let's have a problem first, huh Danny.
    
    DANNY
    Ah he's worried about Paula.
    
    EDITH
    I read about that cemetery business. I tried to get you kids to not buy too near
    one of those things. We get there soon enough as it is.
    
    DANNY
    He thought it'd be quiet and peaceful there.
    
    EDITH
    No doubt about that. It's quiet alright, like a tomb. I'm sorry Jeff, that was a
    bad joke.
    
    Example 2.
    Place: A cyber intelligence facility of Henry Forsythe
    Description:  The facility is like a fortress with dark walls of concrete, steel and 
    glass. In the middle of the building is a cube-shaped machine, which serves as 
    the central computer and network hub for the entire building. <end>
    Characters: Gabriel Clarke is the main protagonist. A talented young 
    hacker who enjoys his anonymity, he enjoys hacking his friend's computers. 
    Seymon Evans is the other main protagonist. A talented young 
    hacker, he is more motivated than Gabriel Clarke and has more experience. 
    Henry Forsythe is the antagonist. A private cyber intelligence 
    agent, he is responsible for the investigation of the Bitcoin heist.
    Plot element: 5- The Approach to the Inmost Cave
    Summary: Scifi cyberpunk story about two hackers who find themselves both 
    the targets of a cyber intelligence agent who suspects them of stealing $3.5 
    million worth of Bitcoin. The two do not know each other, and neither of them 
    recalls stealing the sum.
    Previous beat: Seymon walks down the hallway and knocks on the door to Forsythe's office
    Beat: Seymon walks into the room and sees Henry Forsythe, a private cyber intelligence agent
    <dialog>
    Character names: GABRIEL CLARKE, SEYMON EVANS, HENRY FORSYTHE
    DIALOG:
     
    
    SEYMON
    Are you Forsythe?
    
    FORSYTHE
    I am Henry Forsythe.
    
    SEYMON
    I'm Seymon Evans. I have an appointment with Mr. Forsythe.
    
    GABRIEL
    Who are you?
    
    FORSYTHE
    You must be Gabriel Clarke.
    
    SEYMON
    How do you know my name?
    
    GABRIEL
    Who are you?
    
    FORSYTHE
    I am Henry Forsythe, a private cyber intelligence agent. I was 
    contacted by Jack Wicks, the CEO of Trion-DV, a couple of weeks ago.
    
    GABRIEL
    What's that got to do with me?
    
    FORSYTHE
    Wicks was a personal friend of mine. He informed me that he was in
    the process of auditing the accounts of Trion-DV. He wanted to ensure
    that I would have no problems in this matter.
    Seymon, as you know, I called you in for a meeting because 
    I think you may have stolen $3.5 million worth of Bitcoin.
    
    GABRIEL
    You're crazy! I never stole anything in my life!
    
    FORSYTHE
    So you deny any knowledge of the theft?
    
    GABRIEL
    You bet I do!
    
    FORSYTHE
    Good, I'm glad we're on the same page. I called you in here because
    I wanted to talk to you about it. I was told by Jack that you had
    been working on a project to steal Bitcoin from Trion-DV. Is that 
    true?
    
    GABRIEL
    Of course not! I'm a programmer, not a thief.
    
    FORSYTHE
    Then how do you explain your presence at the scene of the crime?
    
    GABRIEL
    I was just trying to help out a friend.
    
    FORSYTHE
    What friend?
    
    GABRIEL
    I can't tell you that.
    
    FORSYTHE
    Then why did you do it?
    
    GABRIEL
    I don't know what you're talking about.
    
    FORSYTHE
    You were at the Trion-DV offices on the day of the heist. I have 
    eyewitnesses that can testify to
    ----------------------------------------------------------------------------------------------------
    PROMPT:
     Given Example 1, write the dialog for Example 2 using the same structure.
    
    Example 1.
    Place : Cockpit of an airplane.
    Description: Cockpit of a modern passenger airplane , American Flight 812.
    Characters: Jeff is the hero. A man in his early forties, he tries to stay calm in all circumstance.
    Jeff is now a airline pilot. Danny, a young airplane pilot in his thirties, is eager to learn but can
    quickly lose his composture. Danny is enamored of Edith. Edith, an experienced stewardess with a good
    sense of humour, is trustworthy and dependable. Edith likes to tease Danny.
    Plot element: Crossing the First Threshold.
    Summary: Residents of San Fernando Valley are under attack by flying saucers from outer space. The
    aliens are extraterrestrials who seek to stop humanity from creating a doomsday weapon that could
    destroy the universe and unleash the living dead to stalk humans who wander into the cemetery looking
    for evidence of the UFOs. The hero Jeff, an airline pilot, will face the aliens.
    Previous beat: Flight captain Jeff reluctantly leaves his wife Paula to go for a two-day flight.
    Beat: At the cockpit, flight captain Jeff is preoccupied by the flying saucer appearances and
    graveyard incidents in his home town, where he left wis wife Paula. Without success, co-pilot Danny
    and stewardess Edith try to reassure him.
    
    <dialog>
    Character names: DANNY, JEFF, EDITH
    
    DANNY
    You're mighty silent this trip, Jeff.
    
    JEFF
    Huh?
    
    DANNY
    You haven't spoken ten words since takeoff.
    
    JEFF
    I guess I'm preoccupied, Danny.
    
    DANNY
    We've got thirty - three passengers back there that have time to be preoccupied .
    Flying this flybird doesn 't give you that opportunity.
    
    JEFF
    I guess you're right, Danny.
    
    DANNY
    Paula?
    
    JEFF
    Yeah.
    
    DANNY
    There's nothing wrong between you two?
    
    JEFF
    Oh no, nothing like that. Just that I'm worried, she being there alone and
    those strange things flying over the house and those incidents in the graveyard
    the past few days. It's just got me worried.
    
    DANNY
    Well , I haven't figured out those crazy skybirds yet but I give you fifty to one
    odds the police have figured out that cemetery thing by now.
    
    (Enter EDITH)
    
    JEFF
    I hope so.
    
    EDITH
    If you're really that worried Jeff why don't you radio in and find out? Mac
    should be on duty at the field by now. He could call Paula and relay the message
    to you.
    
    DANNY
    Hi Edith.
    
    EDITH
    Hi Silents. I haven't heard a word from this end of the plane since we left the
    field.
    
    DANNY
    Jeff's been giving me and himself a study in silence.
    
    EDITH
    You boys are feudin'?
    
    JEFF
    Oh no Edie, nothing like that.
    
    DANNY
    Hey Edie, how about you and me balling it up in Albuquerque?
    
    EDITH
    Albuquerque? Have you read that flight schedule Boy?
    
    DANNY
    What about it?
    
    EDITH
    We land in Albuquerque at 4 am. That's strictly a nine o' clock town.
    
    DANNY
    Well I know a friend that'll help us --
    
    EDITH
    Let's have a problem first, huh Danny.
    
    DANNY
    Ah he's worried about Paula.
    
    EDITH
    I read about that cemetery business. I tried to get you kids to not buy too near
    one of those things. We get there soon enough as it is.
    
    DANNY
    He thought it'd be quiet and peaceful there.
    
    EDITH
    No doubt about that. It's quiet alright, like a tomb. I'm sorry Jeff, that was a
    bad joke.
    
    Example 2.
    Place: A cyber intelligence facility of Henry Forsythe
    Description:  The facility is like a fortress with dark walls of concrete, steel and 
    glass. In the middle of the building is a cube-shaped machine, which serves as 
    the central computer and network hub for the entire building. <end>
    Characters: Gabriel Clarke is the main protagonist. A talented young 
    hacker who enjoys his anonymity, he enjoys hacking his friend's computers. 
    Seymon Evans is the other main protagonist. A talented young 
    hacker, he is more motivated than Gabriel Clarke and has more experience. 
    Henry Forsythe is the antagonist. A private cyber intelligence 
    agent, he is responsible for the investigation of the Bitcoin heist.
    Plot element: 6- The Ordeal and The Reward
    Summary: Scifi cyberpunk story about two hackers who find themselves both 
    the targets of a cyber intelligence agent who suspects them of stealing $3.5 
    million worth of Bitcoin. The two do not know each other, and neither of them 
    recalls stealing the sum.
    Previous beat: Seymon walks into the room and sees Henry Forsythe, a private cyber intelligence agent
    Beat: Seymon meets with Forsythe in his office, and tries to explain why he was on the computer 
    at the time the Bitcoin was stolen
    <dialog>
    Character names: GABRIEL CLARKE, SEYMON EVANS, HENRY FORSYTHE
    DIALOG:
     
    GABRIEL CLARKE
    This is Gabriel Clarke, Henry. I'm sorry I didn't catch your name.
    
    SEYMON EVANS
    I'm Seymon Evans.
    
    GABRIEL CLARKE
    I've heard a lot about you, Seymon. You've got quite a reputation.
    
    SEYMON EVANS
    Yeah? I've heard a lot about you, too.
    
    GABRIEL CLARKE
    Have you worked with Henry before?
    
    SEYMON EVANS
    I've done some small jobs for him, but this is the first big one.
    
    GABRIEL CLARKE
    You think the guy that did this is in his late teens?
    
    SEYMON EVANS
    Well, that's my guess. But we'll know more once we crack his computer.
    
    GABRIEL CLARKE
    We'll know a lot more once we get into that machine.
    
    SEYMON EVANS
    We should probably get going.



```python

```

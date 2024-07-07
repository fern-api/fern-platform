<a target="_blank" href="https://colab.research.google.com/github/cohere-ai/notebooks/blob/main/notebooks/llmu/Fine_Tuning_for_Chat.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

# Fine-Tuning for Chat

Our ready-to-use large language models, such as [Command](https://cohere.com/models/command), are very good at producing responses to natural language prompts. However, there are many cases in which getting the best model performance requires performing an additional round of training on custom user data. Creating a custom model using this process is called **fine-tuning**.

Fine-tuning is recommended when you want to teach the model a new task, or leverage your company's unique knowledge base. Fine-tuning models is also helpful for generating a specific writing style or format, or leveraging a new data type.

In this notebook, you will fine-tune a chatbot on custom conversational data to improve its performance at a specific task.

_Read the [accompanying blog post here](https://docs.cohere.com/docs/fine-tuning-for-chat)._

## Overview

We'll do the following steps:
- **Step 1: Prepare the Dataset** - Download the dataset, select a subset, and prepare it for the Chat endpoint.
- **Step 2: Fine-Tune the Model** - Kick off a fine-tuning job, and confirm when the model has completed training.
- **Step 3: Use/Evaluate the Fine-Tuned Model** - Evaluate the fine-tuned model's performance on the test dataset, and confirm it is a competent participant in multi-turn conversations.

## Setup

We'll start by installing the tools we'll need and then importing them.


```python
! pip install cohere jsonlines -q
```


```python
#@title Enable text wrapping in Google Colab

from IPython.display import HTML, display

def set_css():
  display(HTML('''
  <style>
    pre {
        white-space: pre-wrap;
    }
  </style>
  '''))
get_ipython().events.register('pre_run_cell', set_css)
```


```python
import os
import json
import jsonlines
import cohere
```

Fill in your Cohere API key in the next cell. To do this, begin by [signing up to Cohere](https://os.cohere.ai/) (for free!) if you haven't yet. Then get your API key [here](https://dashboard.cohere.com/api-keys).


```python
# Paste your API key here. Remember to not share publicly
co = cohere.Client("COHERE_API_KEY") 
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



## Step 1: Prepare and Validate the Dataset


### Download the dataset

We will work with the [CoEdIT dataset](https://huggingface.co/datasets/grammarly/coedit) of text editing examples (Raheja, et al). In each example, the user asks a writing assistant to rewrite text to suit a specific task (editing fluency, coherence, clarity, or style) and receives a response. 


```python
# Download the dataset
! wget "https://huggingface.co/datasets/grammarly/coedit/resolve/main/train.jsonl"
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    --2024-03-21 13:29:29--  https://huggingface.co/datasets/grammarly/coedit/resolve/main/train.jsonl
    Resolving huggingface.co (huggingface.co)... 3.161.4.106, 3.161.4.111, 3.161.4.115, ...
    Connecting to huggingface.co (huggingface.co)|3.161.4.106|:443... connected.
    HTTP request sent, awaiting response... 302 Found
    Location: https://cdn-lfs.huggingface.co/repos/30/91/3091c2c741f77a2f5aa8986b13e4fb2c3658ab3ebc30ecaa5f6890e60939bdf9/2913249158d6a178dc638e870212ff8a432d128eb6b4bdbe969ee805e6063ce3?response-content-disposition=attachment%3B+filename*%3DUTF-8%27%27train.jsonl%3B+filename%3D%22train.jsonl%22%3B&Expires=1711308569&Policy=eyJTdGF0ZW1lbnQiOlt7IkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcxMTMwODU2OX19LCJSZXNvdXJjZSI6Imh0dHBzOi8vY2RuLWxmcy5odWdnaW5nZmFjZS5jby9yZXBvcy8zMC85MS8zMDkxYzJjNzQxZjc3YTJmNWFhODk4NmIxM2U0ZmIyYzM2NThhYjNlYmMzMGVjYWE1ZjY4OTBlNjA5MzliZGY5LzI5MTMyNDkxNThkNmExNzhkYzYzOGU4NzAyMTJmZjhhNDMyZDEyOGViNmI0YmRiZTk2OWVlODA1ZTYwNjNjZTM%7EcmVzcG9uc2UtY29udGVudC1kaXNwb3NpdGlvbj0qIn1dfQ__&Signature=o4vxvJruLayMUe37m5puwa3ni4UqKKqAvWNjyd28fZsDX95Z1N8SwYh3CXUCe-T%7ElTsKpdvt7lHhoW7p2J8ZmhnTDQu-Sb8QPXpj4JE0oJgzJQrLdbbYpv%7ETKEgw5PfW%7ECYXeJ2Rz2YmgjFttH3jMc3bRC8J379fgfgGxU%7ER8fPHDb5oznqLKGwbLWkRjnRHQTMzU9lv9m78XHTW6glGN3X2LzXgH5F2n1KZtQ34x4C%7E2HxHRZx5aEhumgS893pwc8ayStKdfODPd-8yTQ6gRu%7Eud9u762SoV3HIVQ-zvYZD6SmZOaiCK-gaMciYzs01L%7EQAg7dp1AWk41h6swQh1g__&Key-Pair-Id=KVTP0A1DKRTAX [following]
    --2024-03-21 13:29:29--  https://cdn-lfs.huggingface.co/repos/30/91/3091c2c741f77a2f5aa8986b13e4fb2c3658ab3ebc30ecaa5f6890e60939bdf9/2913249158d6a178dc638e870212ff8a432d128eb6b4bdbe969ee805e6063ce3?response-content-disposition=attachment%3B+filename*%3DUTF-8%27%27train.jsonl%3B+filename%3D%22train.jsonl%22%3B&Expires=1711308569&Policy=eyJTdGF0ZW1lbnQiOlt7IkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcxMTMwODU2OX19LCJSZXNvdXJjZSI6Imh0dHBzOi8vY2RuLWxmcy5odWdnaW5nZmFjZS5jby9yZXBvcy8zMC85MS8zMDkxYzJjNzQxZjc3YTJmNWFhODk4NmIxM2U0ZmIyYzM2NThhYjNlYmMzMGVjYWE1ZjY4OTBlNjA5MzliZGY5LzI5MTMyNDkxNThkNmExNzhkYzYzOGU4NzAyMTJmZjhhNDMyZDEyOGViNmI0YmRiZTk2OWVlODA1ZTYwNjNjZTM%7EcmVzcG9uc2UtY29udGVudC1kaXNwb3NpdGlvbj0qIn1dfQ__&Signature=o4vxvJruLayMUe37m5puwa3ni4UqKKqAvWNjyd28fZsDX95Z1N8SwYh3CXUCe-T%7ElTsKpdvt7lHhoW7p2J8ZmhnTDQu-Sb8QPXpj4JE0oJgzJQrLdbbYpv%7ETKEgw5PfW%7ECYXeJ2Rz2YmgjFttH3jMc3bRC8J379fgfgGxU%7ER8fPHDb5oznqLKGwbLWkRjnRHQTMzU9lv9m78XHTW6glGN3X2LzXgH5F2n1KZtQ34x4C%7E2HxHRZx5aEhumgS893pwc8ayStKdfODPd-8yTQ6gRu%7Eud9u762SoV3HIVQ-zvYZD6SmZOaiCK-gaMciYzs01L%7EQAg7dp1AWk41h6swQh1g__&Key-Pair-Id=KVTP0A1DKRTAX
    Resolving cdn-lfs.huggingface.co (cdn-lfs.huggingface.co)... 18.160.109.120, 18.160.109.61, 18.160.109.59, ...
    Connecting to cdn-lfs.huggingface.co (cdn-lfs.huggingface.co)|18.160.109.120|:443... connected.
    HTTP request sent, awaiting response... 200 OK
    Length: 19695735 (19M) [binary/octet-stream]
    Saving to: ‘train.jsonl’
    
    train.jsonl         100%[===================>]  18.78M  46.9MB/s    in 0.4s    
    
    2024-03-21 13:29:30 (46.9 MB/s) - ‘train.jsonl’ saved [19695735/19695735]
    


### Get a subset of the dataset

Instead of using the full dataset, we will use a subset focused on making text coherent: 927 total conversations.


```python
# we will use subset of the dataset focused on making text more coherent
phrase = "coherent"

# instantiate python list where we will store correct subset of dataset
dataset_list = []

# create subset of dataset
with jsonlines.open('train.jsonl') as f:
    for line in f.iter():
        if phrase in line['src'].split(":")[0]:
            dataset_list.append(line)

# Split data into training and test
dataset_list_train = dataset_list[:800]
dataset_list_test = dataset_list[800:]

print("Total number of examples:", len(dataset_list))
print("Number of examples in training set:", len(dataset_list_train))
print("Number of examples in the test set:", len(dataset_list_test))
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    Total number of examples: 927
    Number of examples in training set: 800
    Number of examples in the test set: 127


### Preview the dataset

We will use the `src` and `tgt` fields from each example, which correspond to the user’s prompt and the writing assistant’s response, respectively.


```python
# print the first ten prompts and corresponding responses
for item in dataset_list_train[:10]:
    print(item["src"])
    print(item["tgt"])
    print("-"*50)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    Make the text coherent: The Bank's main strategy is to further expand its network and increase its lending activities with particular focus on the SME sector. The EBRD helps Bank, by developing and financing Bank's portfolio of and strengthening the bank's funding base.
    The Bank's main strategy is to further expand its network and increase its lending activities with particular focus on the SME sector. The EBRD helps Union Bank, by developing and financing its portfolio of and strengthening the bank's funding base.
    --------------------------------------------------
    Make the text coherent: It was not illegal under international law ; captured foreign sailors were released. Confederates went to prison camps.
    It was not illegal under international law ; captured foreign sailors were released, while Confederates went to prison camps.
    --------------------------------------------------
    Make the text coherent: The Union blockade was a powerful weapon that eventually ruined the Southern economy, at the cost of very few lives. The measure of the blockade's success was not the few ships that slipped through, but the thousands that never tried Union.
    The Union blockade was a powerful weapon that eventually ruined the Southern economy, at the cost of very few lives. The measure of the blockade's success was not the few ships that slipped through, but the thousands that never tried it.
    --------------------------------------------------
    Make the text more coherent: It lasted for 60 minutes. It featured the three men taking questions from a studio audience.
    Lasting for 60 minutes, it featured the three men taking questions from a studio audience.
    --------------------------------------------------
    Make the text more coherent: The Security Council could not decide on a Secretary-General. The Third World countries would not nominate any other candidates as long as Salim remained in the race.
    The Security Council could not decide on a Secretary-General, but the Third World countries would not nominate any other candidates as long as Salim remained in the race.
    --------------------------------------------------
    Make the text coherent: All of the 2011 inductees lost their lives in the 1961 crash of Sabena Flight 548, considered to be the most tragic event in figure skating history. inductees were honored posthumously in observance of the fiftieth anniversary of the tragedy.
    All of the 2011 inductees lost their lives in the 1961 crash of Sabena Flight 548, considered to be the most tragic event in figure skating history. They were honored posthumously in observance of the fiftieth anniversary of the tragedy.
    --------------------------------------------------
    Make the text more coherent: Foreign Service personnel stationed in nations with inadequate public infrastructure also face greater risk of injury or death due to fire, traffic accidents, and natural disasters. An FSO was one of the first identified victims of the 2010 Haiti earthquake.
    Foreign Service personnel stationed in nations with inadequate public infrastructure also face greater risk of injury or death due to fire, traffic accidents, and natural disasters. For instance, an FSO was one of the first identified victims of the 2010 Haiti earthquake.
    --------------------------------------------------
    Make the text more coherent: The Federalist Party made a relatively strong showing, winning seats in both chambers while supporting a competitive challenge to the incumbent Democratic-Republican President. The Democratic-Republican continued Democratic-Republican's control of the Presidency and both houses of Congress.
    The Federalist Party made a relatively strong showing, winning seats in both chambers while supporting a competitive challenge to the incumbent Democratic-Republican President. However, the Democratic-Republican Party continued its control of the Presidency and both houses of Congress.
    --------------------------------------------------
    Make the text coherent: Since the 1990s, Loughborough University operated a satellite higher education campus in Peterborough. This closed in 2003, leaving the city as one of the largest urban areas in the country without a dedicated provision of higher education.
    Since the 1990s, Loughborough University operated a satellite higher education campus in Peterborough. However, this closed in 2003, leaving the city as one of the largest urban areas in the country without a dedicated provision of higher education.
    --------------------------------------------------
    Make the text coherent: The cancer center is named after Monroe Dunaway Anderson, a banker and cotton trader from Jackson, Tennessee. Monroe Dunaway Anderson was a banker of a business partnership with Monroe Dunaway Anderson's brother-in-law Will Clayton.
    The cancer center is named after Monroe Dunaway Anderson, a banker and cotton trader from Jackson, Tennessee. He was a member of a business partnership with his brother-in-law Will Clayton.
    --------------------------------------------------


### Prepare the dataset for Cohere's Chat endpoint

To format the dataset for the Chat endpoint, we create a `.jsonl` where each JSON object is a conversation containing a series of messages.
- A `System` message in the beginning, acting as the preamble that guides the whole conversation
- Multiple pairs of `User` and `Chatbot` messages, representing the conversation that takes place between a human user and a chatbot


```python
# arranges the data to suit Cohere's format
def create_chat_ft_data(preamble, user_message, chatbot_message):
    formatted_data = {
        "messages": [
            {
                "role": "System",
                "content": preamble
            },
            {
                "role": "User",
                "content": user_message
            },
            {
                "role": "Chatbot",
                "content": chatbot_message
            }
        ]
    }

    return formatted_data

preamble = "You are a writing assistant that helps the user write coherent text."

# creates jsonl file from list of examples
def create_jsonl_from_list(file_name, dataset_segment, preamble):
    path = f'{file_name}.jsonl'
    if not os.path.isfile(path):
        with open(path, 'w+') as file:
            for item in dataset_segment:
                user_message = item["src"]
                chatbot_message = item["tgt"]
                formatted_data = create_chat_ft_data(preamble, user_message, chatbot_message)
                file.write(json.dumps(formatted_data) + '\n')
            file.close()

# Create training jsonl file
file_name = "coedit_coherence_train"
create_jsonl_from_list(file_name, dataset_list_train, preamble)

# List the first 3 items in the JSONL file
with jsonlines.open(f'{file_name}.jsonl') as f:
    [print(line) for _, line in zip(range(3), f)]
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    {'messages': [{'role': 'System', 'content': 'You are a writing assistant that helps the user write coherent text.'}, {'role': 'User', 'content': "Make the text coherent: The Bank's main strategy is to further expand its network and increase its lending activities with particular focus on the SME sector. The EBRD helps Bank, by developing and financing Bank's portfolio of and strengthening the bank's funding base."}, {'role': 'Chatbot', 'content': "The Bank's main strategy is to further expand its network and increase its lending activities with particular focus on the SME sector. The EBRD helps Union Bank, by developing and financing its portfolio of and strengthening the bank's funding base."}]}
    {'messages': [{'role': 'System', 'content': 'You are a writing assistant that helps the user write coherent text.'}, {'role': 'User', 'content': 'Make the text coherent: It was not illegal under international law ; captured foreign sailors were released. Confederates went to prison camps.'}, {'role': 'Chatbot', 'content': 'It was not illegal under international law ; captured foreign sailors were released, while Confederates went to prison camps.'}]}
    {'messages': [{'role': 'System', 'content': 'You are a writing assistant that helps the user write coherent text.'}, {'role': 'User', 'content': "Make the text coherent: The Union blockade was a powerful weapon that eventually ruined the Southern economy, at the cost of very few lives. The measure of the blockade's success was not the few ships that slipped through, but the thousands that never tried Union."}, {'role': 'Chatbot', 'content': "The Union blockade was a powerful weapon that eventually ruined the Southern economy, at the cost of very few lives. The measure of the blockade's success was not the few ships that slipped through, but the thousands that never tried it."}]}


## Step 2: Fine-Tune the Model

We kick off a fine-tuning job by navigating to the [fine-tuning tab of the Dashboard](https://dashboard.cohere.com/fine-tuning).  Under "Chat", click on "Create a Chat model".

<img src="https://files.readme.io/48dad78-cohere_dashboard.png">

Next, upload the `.jsonl` file you just created as the training set by clicking on the "TRAINING SET" button. When ready, click on "Review data" to proceed to the next step.

<img src="https://files.readme.io/82e3691-image_2.png">

Then, you'll see a preview of how the model will ingest your data. If anything is wrong with the data, the page will also provide suggested changes to fix the training file. Otherwise, if everything looks good, you can proceed to the next step.

<img src="https://files.readme.io/fbce852-image_3.png">

Finally, you'll see an estimated cost of fine-tuning, followed by a page where you'll provide a nickname to your model. We used `coedit-coherence-ft` as the nickname for our model. This page also allows you to provide custom values for the hyperparameters used during training, but we'll keep them at the default values for now. 

<img src="https://files.readme.io/801e93a-name_model.png">

Once you have filled in a name, click on "Start training" to kick off the fine-tuning process. This will navigate you to a page where you can monitor the status of the model. A model that has finished fine-tuning will show the status as `READY`.

<img src="https://files.readme.io/dd0d48b-ready_model.png">

## Step 3: Use/Evaluate the Fine-Tuned Model



Once the model has completed the fine-tuning process, it’s time to evaluate its performance. 


### With Test Data

When you're ready to use the fine-tuned model, navigate to the API tab. There, you'll see the model ID that you should use when calling `co.chat()`.

<img src="https://files.readme.io/82c726e-get_model_id.png">

In the following code, we supply the first three messages from the test dataset to both the pre-trained and fine-tuned models for comparison.


```python
for item in dataset_list_test[:3]:
    # User prompt
    user_message = item["src"]
    # Desired/target response from dataset
    tgt_message = item["tgt"]

    # Get default model response
    response_pretrained=co.chat(
        message=user_message,
        preamble=preamble,
        )

    # Get fine-tuned model response
    response_finetuned = co.chat(
        message=user_message,
        model='acb944bb-fb49-4c29-a15b-e6a245a7bdf9-ft',
        preamble=preamble,
        )

    print(f"User: {user_message}","\n-----")
    print(f"Desired response: {tgt_message}","\n-----")
    print(f"Default model's response: {response_pretrained.text}","\n-----")
    print(f"Fine-tuned model's response: {response_finetuned.text}")


    print("-"*100,"\n\n")
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    User: Make the text more coherent: We do know that at the end of the Muromachi period it stopped appearing in written records. That Muromachi burned down many times, the last we know of in 1405. 
    -----
    Desired response: We do know that at the end of the Muromachi period it stopped appearing in written records and that it burned down many times, the last we know of in 1405. 
    -----
    Default model's response: We have knowledge that towards the end of the Muromachi period, mentions of it in written records ceased. This period's namesake, Muromachi, faced numerous fires that ravaged the area. The last of these disasters occurred in 1405, after which the district's name disappeared from the historical record. 
    -----
    Fine-tuned model's response: We do know that at the end of the Muromachi period it stopped appearing in written records, although it burned down many times, the last we know of in 1405.
    ---------------------------------------------------------------------------------------------------- 
    
    
    User: Make the text coherent: Pimelodella kronei is a species of three-barbeled catfish endemic to Brazil. Discovered by the German naturalist Sigismund Ernst Richard Krone, Pimelodella kronei was the first troglobitic species described in Brazil, but several others have been described later. 
    -----
    Desired response: Pimelodella kronei is a species of three-barbeled catfish endemic to Brazil. Discovered by the German naturalist Sigismund Ernst Richard Krone, it was the first troglobitic fish described in Brazil, but several others have been described later. 
    -----
    Default model's response: Pimelodella kronei is a three-bearded catfish species native only to Brazil. This species was discovered by German naturalist Sigismund Ernst Richard Krone, making it the first troglobitic species discovered in Brazil. Since then, several other troglobitic species have been discovered in the country. 
    -----
    Fine-tuned model's response: Pimelodella kronei is a species of three-barbeled catfish endemic to Brazil. Discovered by the German naturalist Sigismund Ernst Richard Krone, it was the first troglobitic species described in Brazil, but several others have been described later.
    ---------------------------------------------------------------------------------------------------- 
    
    
    User: Make the text more coherent: The Radio City Music Hall was designed by architect Edward Durell Stone and interior designer Donald Deskey in the Art Deco style. architect used Indiana Limestone for the facade, as with all the other buildings in Rockefeller Center, but Edward Durell Stone also included some distinguishing features. 
    -----
    Desired response: The Radio City Music Hall was designed by architect Edward Durell Stone and interior designer Donald Deskey in the Art Deco style. Stone used Indiana Limestone for the facade, as with all the other buildings in Rockefeller Center, but he also included some distinguishing features. 
    -----
    Default model's response: The Radio City Music Hall, an iconic Art Deco masterpiece, was designed in collaboration by the architect Edward Durell Stone and interior designer Donald Deskey. While Stone clad the facade in Indiana Limestone, matching the other buildings in Rockefeller Center, he also incorporated unique features that set the Music Hall apart. 
    -----
    Fine-tuned model's response: The Radio City Music Hall, designed by architect Edward Durell Stone and interior designer Donald Deskey in the Art Deco style, was built in Indiana Limestone for the facade, as with all the other buildings in Rockefeller Center, but Stone also included some distinguishing features.
    ---------------------------------------------------------------------------------------------------- 
    
    


In this example, both models provide reasonable answers that are an improvement over the user’s original text. However, the fine-tuned model’s response better matches the style of the fine-tuning data, because it is more succinct. 

### In the Chat Context

We have demonstrated that the fine-tuned model can provide good answers to individual questions. But it is also a competent participant in longer, multi-turn conversations.


```python
# Create a conversation ID
import uuid
conversation_id = str(uuid.uuid4())

print('Starting the chat. Type "quit" to end.\n')

while True:

    # User message
    message = input("User: ")

    # Typing "quit" ends the conversation
    if message.lower() == 'quit':
        print("Ending chat.")
        break

    # Chatbot response
    stream = co.chat_stream(message=message,
                              model='acb944bb-fb49-4c29-a15b-e6a245a7bdf9-ft',
                              preamble=preamble,
                              conversation_id=conversation_id)

    print("Chatbot: ", end='')

    for event in stream:
        if event.event_type == "text-generation":
            print(event.text, end='')

    print(f"\n{'-'*50}\n")
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    Starting the chat. Type "quit" to end.
    
    User: Hello
    Chatbot: Hello! How can I help you today?
    --------------------------------------------------
    
    User: I'm fine. Can I ask you for help with some tasks?
    Chatbot: Of course! I'm here to help you with any tasks you need assistance with.
    --------------------------------------------------
    
    User: Make this more coherent: Manuel now has to decide-will he let his best friend be happy with her Prince Charming. Or will he fight for the love that has kept him alive for the last 16 years?
    Chatbot: Manuel now has to decide-will he let his best friend be happy with her Prince Charming, or will he fight for the love that has kept him alive for the last 16 years?
    --------------------------------------------------
    
    User: Help me with this one - She left Benaras. Conditions back home were bad.
    Chatbot: She left Benaras because conditions back home were bad.
    --------------------------------------------------
    
    User: What's a good time to visit London
    Chatbot: A good time to visit London is in the spring or fall, when the weather is mild and the city is not too crowded. However, if you want to experience the city in all its glory, you should visit in the summer or winter, when the weather is colder and the city is more empty.
    --------------------------------------------------
    
    User: Could you help with this please: Make the text coherent: Critically the album has not been as well received as other Browne recordings. It remains his only album to date to reach number 1 on the Billboard chart. 
    Chatbot: Critically the album has not been as well received as other Browne recordings, but it remains his only album to date to reach number 1 on the Billboard chart.
    --------------------------------------------------
    
    User: quit
    Ending chat.


Note the fine-tuned model is still able to respond to prompts like “Hello”, “I’m fine. Can I ask you for help with some tasks?”, and “What’s a good time to visit London” instead of strictly following the fine-tuning objective of editing text.

The model also did a good job with context switching; it can hold a conversation when the user switches from friendly greetings, to a request for writing help, to travel planning, and finally back to writing assistance. It can also infer when the user is asking for help with making a text coherent, even if it is not explicitly stated (e.g., “Help me with this one”) or if the request is buried slightly (e.g., with “Could you help me with this please”).

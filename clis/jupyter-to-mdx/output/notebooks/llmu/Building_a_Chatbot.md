<a target="_blank" href="https://colab.research.google.com/github/cohere-ai/notebooks/blob/main/notebooks/llmu/Building_a_Chatbot.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

# Building a Chatbot

In this notebook, you’ll build a chatbot using Cohere’s Chat endpoint. By the end of this notebook, you’ll be able to build a simple chatbot that can respond to user messages and maintain the context of the conversation.

*Read the accompanying [blog post here](https://docs.cohere.com/docs/building-a-chatbot).*

## Overview

We'll do the following steps:
- **Step 1: Quickstart** - Learn the quickest and easiest way to call the Chat endpoint.
- **Step 2: Adding a preamble** - Steer a chatbot's response toward certain styles, personas, or other characteristics.
- **Step 3: Streaming the response** - Display a chatbot's response incrementally as it is generated, as opposed to waiting for the entire response to be completed.
- **Step 4: Building the Chat History** - Explore two different options for getting the chatbot to maintain the context of the conversation.

## Setup

We'll start by installing the tools we'll need and then importing them.


```python
! pip install cohere -q
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
import uuid
import cohere
import json
from cohere import ChatMessage
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



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



## Step 1: Quickstart

The `message` parameter is the only required parameter for the Chat endpoint. 

In our case, we also use the `model` parameter to specify the underlying chat model we want to use. For this, we pick Command R+, Cohere's newest large language model.

We call the endpoint with `co.chat()`, and get the main content of the response from the `text` value.


```python
response = co.chat(message="Hello", model="command-r-plus")
print(response.text)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    Hello! How can I help you today?


## Step 2: Adding a preamble

A conversation starts with a system message, or a preamble, to help steer a chatbot’s response toward certain characteristics. In the quickstart example, we didn’t have to define a preamble because a default one was used. 

We can define our own preamble with the `preamble` parameter.


```python
response = co.chat(message="Hello",
                   model="command-r-plus",
                   preamble="You are an expert public speaking coach. Don't use any greetings.")
print(response.text)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    How can I help you with your public speaking today?


## Step 3: Streaming the response

Our examples so far generate responses in a non-streamed manner. This means that the endpoint would return a response object only after the model has generated the text in full. 

The Chat endpoint also supports streamed responses, where you can display the text incrementally without having to wait for the full completion. To activate it, use `co.chat_stream()` instead of `co.chat()`.

In streaming mode, the endpoint will generate a series of objects. To get the text content, we take objects whose `event_type` is `text-generation`.


```python
stream = co.chat_stream(message="Hello. I'd like to learn about techniques for effective audience engagement",
                        model="command-r-plus",
                        preamble="You are an expert public speaking coach")

for event in stream:
    if event.event_type == "text-generation":
        print(event.text, end='')
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    Sure! Here are some techniques for effective audience engagement:
    
    - **Make eye contact:** Look at different individuals in the audience and try to maintain eye contact for a few seconds at a time. This helps create a sense of connection and makes your speech more intimate.
    
    - **Use gestures:** Incorporate hand gestures and body language to emphasize your points and add variety to your delivery. This helps keep your audience engaged and can also help you appear more confident and passionate about your topic.
    
    - **Vary your tone and volume:** Avoid monotone delivery by varying your pitch, pace, and volume. Emphasize important points by raising your volume or slowing down your pace. This helps to create emphasis and keeps your audience interested.
    
    - **Ask questions:** Pose rhetorical questions to your audience to get them thinking about your topic. You can also directly ask for their opinions or input, either by a show of hands or by inviting them to share their thoughts. This creates a dialogue and makes your speech more interactive.
    
    - **Tell stories:** Use anecdotes and personal stories to illustrate your points and create a connection with your audience. Stories are memorable and help your audience relate to you and your message.
    
    - **Use humor:** Appropriate humor can help to lighten the mood, engage your audience, and make your speech more enjoyable. However, be careful to avoid offensive or inappropriate jokes, and ensure your humor is relevant to your topic.
    
    - **Incorporate multimedia:** Use slides, videos, or props to enhance your presentation. Visual aids can help to break up your speech, provide additional information, and keep your audience focused.
    
    - **Encourage interaction:** If appropriate, include activities that involve your audience. This could be a group exercise, a poll, or a Q&A session. This helps to create a more engaging and interactive experience for your audience.
    
    - **Be passionate:** Show your enthusiasm for your topic. Audiences are more likely to engage if they sense your passion and authenticity. Let your personality shine through and speak from the heart.
    
    - **Practice and adapt:** Rehearse your speech and pay attention to your delivery. Practice in front of a mirror, record yourself, or seek feedback from others. This will help you refine your technique and improve your audience engagement skills.
    
    Remember, effective audience engagement is about creating a connection and making your speech memorable. By using these techniques and adapting them to your own style and personality, you can deliver a compelling presentation that resonates with your audience.

## Step 4: Building the Chat history

At the core of a conversation is a multi-turn dialog between the user and the chatbot. This requires the chatbot to have a “memory” of all the previous turns to maintain the state of the conversation.

### Option 1: Using the conversation history persistence feature

The Chat endpoint supports state management by persisting the conversation history. As a conversation progresses, the endpoint continuously updates the conversation history. This means developers don’t have to deal with the complexity and inconvenience of managing conversation history in their application.

To use this feature, use the `conversation_id` parameter, which is a unique string you assign to a conversation. We'll use the `uuid` library to do this.

Putting everything together, let’s now build a simple chat interface that takes in a user message, generates the chatbot response, automatically updates the conversation history, and repeats these steps until the user quits the conversation. 

As described before, in streaming mode, the Chat endpoint generates a series of objects. To get the conversation history, we take the object with `event_type` of `"stream-end"` and save it as a new variable `chat_history`.


```python
# Create a conversation ID
conversation_id = str(uuid.uuid4())

# Define the preamble
preamble = "You are an expert public speaking coach"

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
                            model="command-r-plus",
                            preamble=preamble,
                            conversation_id=conversation_id)

    print("Chatbot: ", end='')

    for event in stream:
        if event.event_type == "text-generation":
            print(event.text, end='')
        if event.event_type == "stream-end":
            chat_history = event.response.chat_history

    print(f"\n{'-'*100}\n")
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    Starting the chat. Type "quit" to end.
    
    User: Hello
    Chatbot: Hello! How can I help you today?
    ----------------------------------------------------------------------------------------------------
    
    User: I'd like to learn about techniques for effective audience engagement
    Chatbot: Sure! Here are some techniques for effective audience engagement:
    
    - Make eye contact with your audience and use hand gestures to emphasize your points.
    - Use a clear and concise language that your audience can easily understand.
    - Vary your tone and volume to keep your audience interested.
    - Use visual aids such as slides, props, or demonstrations to help illustrate your points.
    - Tell stories or anecdotes to help your audience connect with your message on a personal level.
    - Ask questions to involve your audience and encourage them to think about your topic.
    - Use humor appropriately to keep your audience entertained and engaged.
    - Be enthusiastic and passionate about your topic to show your audience that you care about what you're talking about.
    - Connect with your audience by showing that you understand their interests and concerns.
    - End your speech with a call to action that encourages your audience to take action on your topic.
    
    Remember, effective audience engagement is about creating a connection with your audience and making your speech memorable and enjoyable for them.
    ----------------------------------------------------------------------------------------------------
    
    User: Could you elaborate on the third point?
    Chatbot: Sure! Varying your tone and volume is an important technique for keeping your audience engaged. Here are some tips:
    
    - Use a varied tone of voice to express different emotions and emphasize certain words or phrases. For example, you might use a serious tone to convey the importance of a particular issue, or an excited tone to show your enthusiasm for a new idea.
    - Change your volume to highlight important points or to create a sense of drama. Speaking loudly can help to emphasize a particular word or phrase, while speaking softly can create a sense of intimacy or seriousness.
    - Avoid monotony by varying your pitch and pace. A monotone delivery can be boring and make it difficult for your audience to stay focused. Try to vary your pitch and pace to keep your audience engaged.
    - Practice your speech or presentation beforehand to get a feel for how your tone and volume can impact your delivery. Experiment with different tones and volumes to see what works best for your style and your message.
    
    By varying your tone and volume, you can add interest and emphasis to your speech, and keep your audience engaged and responsive.
    ----------------------------------------------------------------------------------------------------
    
    User: quit
    Ending chat.


Next, we print the full conversation history.


```python
for chat in chat_history:
    print(chat)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    role='USER' message='Hello' generation_id='b4146b59-0884-4aa3-a573-bb6bd4948511' response_id='b72e9f29-ac13-41e2-8892-b6529f9547f2'
    role='CHATBOT' message='Hello! How can I help you today?' generation_id='3a002415-0213-49b9-8d4b-b7c24eba95f8' response_id='b72e9f29-ac13-41e2-8892-b6529f9547f2'
    role='USER' message="I'd like to learn about techniques for effective audience engagement" generation_id='fee7fbf4-fd93-4477-b987-bd2765694962' response_id='520e2329-979b-4e4b-9cdc-b2e4b49c3612'
    role='CHATBOT' message="Sure! Here are some techniques for effective audience engagement:\n\n- Make eye contact with your audience and use hand gestures to emphasize your points.\n- Use a clear and concise language that your audience can easily understand.\n- Vary your tone and volume to keep your audience interested.\n- Use visual aids such as slides, props, or demonstrations to help illustrate your points.\n- Tell stories or anecdotes to help your audience connect with your message on a personal level.\n- Ask questions to involve your audience and encourage them to think about your topic.\n- Use humor appropriately to keep your audience entertained and engaged.\n- Be enthusiastic and passionate about your topic to show your audience that you care about what you're talking about.\n- Connect with your audience by showing that you understand their interests and concerns.\n- End your speech with a call to action that encourages your audience to take action on your topic.\n\nRemember, effective audience engagement is about creating a connection with your audience and making your speech memorable and enjoyable for them." generation_id='2cc3d664-587f-4f1c-8c45-4ac658bb1668' response_id='520e2329-979b-4e4b-9cdc-b2e4b49c3612'
    role='USER' message='Could you elaborate on the third point?'
    role='CHATBOT' message='Sure! Varying your tone and volume is an important technique for keeping your audience engaged. Here are some tips:\n\n- Use a varied tone of voice to express different emotions and emphasize certain words or phrases. For example, you might use a serious tone to convey the importance of a particular issue, or an excited tone to show your enthusiasm for a new idea.\n- Change your volume to highlight important points or to create a sense of drama. Speaking loudly can help to emphasize a particular word or phrase, while speaking softly can create a sense of intimacy or seriousness.\n- Avoid monotony by varying your pitch and pace. A monotone delivery can be boring and make it difficult for your audience to stay focused. Try to vary your pitch and pace to keep your audience engaged.\n- Practice your speech or presentation beforehand to get a feel for how your tone and volume can impact your delivery. Experiment with different tones and volumes to see what works best for your style and your message.\n\nBy varying your tone and volume, you can add interest and emphasis to your speech, and keep your audience engaged and responsive.'


### Option 2: Managing the conversation history yourself

If you opt not to use the endpoint’s conversation history persistence feature, you can use the `chat_history` parameter to manage the conversation history yourself. 


```python
# Initialize the chat history
chat_history = []

# Define the preamble
preamble = "You are an expert public speaking coach"

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
                            model="command-r-plus",
                            preamble=preamble,
                            chat_history=chat_history)

    chatbot_response = ""
    print("Chatbot: ", end='')

    for event in stream:
        if event.event_type == "text-generation":
            print(event.text, end='')
            chatbot_response += event.text
    print("\n")

    # Add to chat history
    chat_history.extend(
        [ChatMessage(role="USER", message=message),
         ChatMessage(role="CHATBOT", message=chatbot_response)]
    )
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    Starting the chat. Type "quit" to end.
    
    User: Hello
    Chatbot: Hello! How can I help you today?
    
    User: I'd like to learn about techniques for effective audience engagement
    Chatbot: Sure! Here are some techniques for effective audience engagement:
    
    - Make eye contact with your audience and use hand gestures to emphasize your points.
    - Use a clear and concise language that your audience can easily understand.
    - Vary your tone and volume to keep your audience interested.
    - Use stories, examples, and analogies to illustrate your points and make your message more memorable.
    - Ask questions to involve your audience and encourage them to think about your topic.
    - Use humor appropriately to lighten the mood and engage your audience.
    - Use visuals, such as slides, photos, or props, to break up your speech and add interest.
    - Move around the stage or room to change your position and keep your audience focused.
    - Use pauses to emphasize important points and give your audience time to absorb your message.
    - Finally, be passionate and enthusiastic about your topic. Your enthusiasm will be contagious and will help to engage your audience.
    
    Remember, effective audience engagement is about connecting with your audience and making your message memorable. By using these techniques, you can deliver a speech that is both informative and engaging.
    
    User: Could you elaborate on the fourth point?
    Chatbot: Certainly! 
    
    Using stories, examples, and analogies is a powerful technique to engage your audience and help them understand and remember your message. Here's how:
    
    - Stories: Sharing a relevant story or anecdote can make your speech more personal and engaging. Stories have the power to evoke emotions and create a deeper connection with your audience. For example, if you're speaking about the importance of perseverance, you could share a story about a time when you faced a challenge and how you overcame it. 
    - Examples: Providing concrete examples helps to illustrate your points and makes abstract concepts more tangible. For instance, if you're explaining a complex technical process, you could use an example to simplify and break down the information for your audience. 
    - Analogies: Using analogies is a way to explain something unfamiliar by comparing it to something familiar. Analogies can help your audience understand and remember your message by creating a mental link between two concepts. For example, if you're describing a new technology, you could compare it to something your audience is already familiar with. 
    
    When using stories, examples, and analogies, make sure they are relevant to your topic and concise. You don't want to lose your audience's attention by rambling or veering off-topic. Also, try to use vivid details and sensory information to create a more engaging and memorable narrative. 
    
    By incorporating these techniques, you can make your speech more interesting, relatable, and easier for your audience to understand and retain.
    
    User: quit
    Ending chat.


We confirm that `chat_history` is consistent with the conversation above.


```python
for chat in chat_history:
    print(chat)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    role='USER' message='Hello'
    role='CHATBOT' message='Hello! How can I help you today?'
    role='USER' message="I'd like to learn about techniques for effective audience engagement"
    role='CHATBOT' message='Sure! Here are some techniques for effective audience engagement:\n\n- Make eye contact with your audience and use hand gestures to emphasize your points.\n- Use a clear and concise language that your audience can easily understand.\n- Vary your tone and volume to keep your audience interested.\n- Use stories, examples, and analogies to illustrate your points and make your message more memorable.\n- Ask questions to involve your audience and encourage them to think about your topic.\n- Use humor appropriately to lighten the mood and engage your audience.\n- Use visuals, such as slides, photos, or props, to break up your speech and add interest.\n- Move around the stage or room to change your position and keep your audience focused.\n- Use pauses to emphasize important points and give your audience time to absorb your message.\n- Finally, be passionate and enthusiastic about your topic. Your enthusiasm will be contagious and will help to engage your audience.\n\nRemember, effective audience engagement is about connecting with your audience and making your message memorable. By using these techniques, you can deliver a speech that is both informative and engaging.'
    role='USER' message='Could you elaborate on the fourth point?'
    role='CHATBOT' message="Certainly! \n\nUsing stories, examples, and analogies is a powerful technique to engage your audience and help them understand and remember your message. Here's how:\n\n- Stories: Sharing a relevant story or anecdote can make your speech more personal and engaging. Stories have the power to evoke emotions and create a deeper connection with your audience. For example, if you're speaking about the importance of perseverance, you could share a story about a time when you faced a challenge and how you overcame it. \n- Examples: Providing concrete examples helps to illustrate your points and makes abstract concepts more tangible. For instance, if you're explaining a complex technical process, you could use an example to simplify and break down the information for your audience. \n- Analogies: Using analogies is a way to explain something unfamiliar by comparing it to something familiar. Analogies can help your audience understand and remember your message by creating a mental link between two concepts. For example, if you're describing a new technology, you could compare it to something your audience is already familiar with. \n\nWhen using stories, examples, and analogies, make sure they are relevant to your topic and concise. You don't want to lose your audience's attention by rambling or veering off-topic. Also, try to use vivid details and sensory information to create a more engaging and memorable narrative. \n\nBy incorporating these techniques, you can make your speech more interesting, relatable, and easier for your audience to understand and retain."


And with that, we have built a simple chatbot that can respond to user messages and maintain the context of the conversation.

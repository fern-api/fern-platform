<a target="_blank" href="https://colab.research.google.com/github/cohere-ai/notebooks/blob/main/notebooks/llmu/Command_Model_Use_Case_Patterns.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

# Command Model Use Case Patterns

Large language models (LLMs) like the Command model are general-purpose and can be applied in infinite ways, but if one can’t recognize the patterns where they can be useful, it can feel overwhelming.

In this notebook, we’ll go through several broad use case categories for the Command model.

Read the accompanying [article here](https://txt.cohere.ai/command-usecase-patterns/).


```python
! pip install cohere -q
```

    [?25l     [90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m0.0/117.2 kB[0m [31m?[0m eta [36m-:--:--[0m[2K     [91m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m[90m╺[0m[90m━━━━━━━━[0m [32m92.2/117.2 kB[0m [31m2.6 MB/s[0m eta [36m0:00:01[0m[2K     [90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m117.2/117.2 kB[0m [31m2.0 MB/s[0m eta [36m0:00:00[0m
    [2K     [90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m75.6/75.6 kB[0m [31m5.6 MB/s[0m eta [36m0:00:00[0m
    [2K     [90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m77.8/77.8 kB[0m [31m5.6 MB/s[0m eta [36m0:00:00[0m
    [2K     [90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m58.3/58.3 kB[0m [31m4.4 MB/s[0m eta [36m0:00:00[0m
    [?25h

# Setup


```python
import cohere
co = cohere.Client("COHERE_API_KEY") # Get your API key: https://dashboard.cohere.com/api-keys
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>




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

# Function to generate text

Let’s define a text generation function that we'll use throughout this notebook.


```python
def generate_text(prompt, temp=0):
  response = co.chat_stream(
    message=prompt,
    model="command-r",
    temperature=temp,
    preamble="")

  for event in response:
      if event.event_type == "text-generation":
          print(event.text, end='')
```

# Define a text snippet for context

Our examples will revolve around a company’s activities for launching a new wireless headphone product, such as getting the word out, managing customer interactions, and so on. For this, let’s define a text snippet containing the product description. We’ll be utilizing this snippet in several examples throughout.


```python
product="""The CO-1T is a wireless headphone product that uses Bluetooth technology to connect to your devices. \
It has a long battery life and can be quickly charged using the included USB cable. The headphone is \
lightweight and comfortable, ideal for long periods of use. It has a built-in microphone for making calls, \
and a button to control the volume. The CO-1T is a great choice for anyone looking for a wireless headphone \
product with great battery life."""
print(product)

```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    The CO-1T is a wireless headphone product that uses Bluetooth technology to connect to your devices. It has a long battery life and can be quickly charged using the included USB cable. The headphone is lightweight and comfortable, ideal for long periods of use. It has a built-in microphone for making calls, and a button to control the volume. The CO-1T is a great choice for anyone looking for a wireless headphone product with great battery life.


# Writing

We’ll start with the most general type of use case, which is writing. Let’s say we’re building an application for users to enter some bullet points and get a complete email written. We can set up the prompt in the following way: create a variable for the user to input some text and merge that, together with the product description, into the main prompt.




```python
user_input ="""
- announce product launch
- create a call to action
- mention live chat for support
"""

prompt = f"""{product}
Create an email about the product above mentioning the following:
{user_input}
"""

generate_text(prompt, temp=0.5)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    We are thrilled to announce the launch of our newest wireless headphones, the CO-1T! These headphones are designed to offer a seamless and convenient listening experience with the use of Bluetooth technology, giving you the freedom to connect to your devices wirelessly.
    
    The CO-1T is crafted to be comfortable and lightweight, making it the perfect companion for your daily commutes or workouts. With a long-lasting battery life, you'll never have to worry about running out of charge during your day. Plus, a quick charge feature ensures you're always ready to go. Simply use the included USB cable for efficient charging.
    
    Control your volume and manage your calls effortlessly with the built-in microphone and easy-to-use button controls. Experience the convenience of wireless connectivity and immerse yourself in crystal-clear audio.
    
    We believe our product will provide an exceptional listening experience and enhance your daily routine. Try it out today and discover the convenience of wireless freedom!
    
    If you have any questions or need further assistance, our team is here to help. Feel free to reach out to us through our live chat feature on our website, and we'll be happy to assist you.
    
    Thank you, and we hope you enjoy the CO-1T wireless headphones!

# Question Answering (Closed)

This use case is about answering a question that a user asks, be it in a single-turn, question answering scenario or a multi-turn, chatbot setting.



Question answering can take place in either a closed or open setting. In a closed-book question answering setting, we rely on the model to answer questions based on the general knowledge from which it has been trained.


```python
user_input ="What features should I consider when choosing a wireless headphone"
prompt = user_input

generate_text(prompt, temp=0.5)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    There are several features to consider when choosing a wireless headphone that best suits your needs:
    
    1. Sound Quality: This is a primary factor for many people. Look for headphones with clear and balanced audio reproduction, good bass, and a wide frequency response. Some brands are known for their audio expertise and use high-quality drivers for superior sound.
    
    2. Noise Cancellation: Wireless headphones with active noise cancellation (ANC) technology are excellent for reducing ambient noise and enhancing focus on your music or calls. They use microphones to detect external sound and produce an opposite signal to cancel it out.
    
    3. Connectivity: Ensure the wireless headphones have Bluetooth compatibility with your devices, such as smartphones, tablets, or laptops. Some headphones also support multi-device pairing, allowing seamless connection switching.
    
    4. Battery Life: Longer battery life ensures you won't be frequently charged. Look for headphones that offer at least 15-20 hours of continuous playback on a single charge. Also, check the charging time and consider if the headphone supports fast charging.
    
    5. Comfort and Design: Consider the comfort of the ear pads and the overall design. Look for ergonomic designs, adjustable headbands, and lightweight construction for extended wear. Also, choose between in-ear, on-ear, or over-the-ear models based on your preference and portability.
    
    6. Controls and Microphone: Easy-to-use controls for playback, volume, and calls are essential. A good microphone quality is crucial for clear calls and voice commands. Some headphones have touch-sensitive controls on the earcups, while others have physical buttons.
    
    7. Voice Assistant Integration: If you're into voice commands, look for headphones with built-in support for virtual assistants like Siri or Google Assistant. This allows you to control various functions hands-free.
    
    8. Multi-Point Connection: This feature lets you connect your headphones simultaneously to multiple devices. This way, you can switch between your laptop and smartphone effortlessly.
    
    9. Water and Sweat Resistance: If you plan to use your headphones during workouts or in rainy weather, consider a model with an IPX rating for water resistance.
    
    10. Price and Warranty: Determine your budget and check the warranty period offered by the manufacturer for any potential issues.
    
    Remember to read reviews and guides from reputable sources and consider trying them out, if possible, to ensure a comfortable and enjoyable listening experience.

# Question Answering (Open)

In an open setting, we can get the model to refer to specific knowledge bases to help it do its job well. This way, we can design a system that can handle questions that require factual responses.


```python
user_input ="How do I control the sound levels"

prompt = f"""{product}
Answer this question based on the context provided above: {user_input}"""

generate_text(prompt, temp=0)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    You can control the volume using the button built into the headphones.

# Brainstorming

Another form of writing is brainstorming, where we want the model to generate a list of options based on a given prompt. This can be for writing outlines, generating ideas, providing critical analysis, and so on. This use case forces the model to go broad and cover different perspectives of a situation.


```python
user_input ="I can't get the Bluetooth connection working"
prompt = f"""{product}
A customer provided the following complaint about this product: {user_input}.
Provide a bulleted list of possible ways to troubleshoot so we can advise the customer accordingly.
"""

generate_text(prompt, temp=0.3)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    Here is a list of possible ways to troubleshoot the customer's problem with the Bluetooth connection for the CO-1T wireless headphones: 
    
    - Suggest forgetting the existing Bluetooth connection and reinstalling it from scratch
    - Recommend updating the software of the device they are trying to connect to
    - Inquiry about whether the customer's device is compatible with the headphone's Bluetooth profile
    - Suggest a factory reset of the headphones themselves, but warn that this option should only be used if other troubleshooting steps fail. 
    
    Let me know if you would like me to provide more options to troubleshoot potential problems with the CO-1T headphones.

# Transforming

The first thing that comes to mind when thinking about generative models is their ability to write a fresh piece of text, but one aspect that is rather understated is their ability to synthesize an existing piece of text.

One example is transforming a passage of text into a different form, making it reusable for different purposes.


```python
prompt =f"""Turn the following product description into a list of frequently asked questions (FAQ).

Product description: {product}
"""
generate_text(prompt, temp=0)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    Here is the product description turned into an FAQ format:
    
    FAQ:
    
    Q: How does the CO-1T connect to my devices?
    A: The CO-1T uses Bluetooth technology to connect wirelessly to your smartphones, laptops, or other compatible devices.
    
    Q: What is the battery life like?
    A: The CO-1T has an excellent battery life that will last you long periods of use. It also charges quickly using the included USB cable, so you won't have to wait long to get back to listening.
    
    Q: Is it comfortable to wear?
    A: Absolutely! The CO-1T headphones are lightweight and designed to be comfortable for extended periods. They are perfect for listening to music, taking calls, or using them for work.
    
    Q: Does it have a microphone and volume control?
    A: Yes, the headphone has a built-in microphone, making it easy to take calls on the go. There's also a button that allows you to adjust the volume according to your preference.
    
    Q: Why should I choose the CO-1T over other wireless headphones?
    A: Besides the excellent battery life and comfortable design, the CO-1T is a great choice for anyone looking for a reliable and convenient wireless headphone option at an affordable price. It's quick to charge, easy to use, and perfect for everyday use.

# Summarizing

One popular use case for synthesizing text is summarization. Here we take a long passage of text and summarize it to its essence. These can be articles, conversation transcripts, reports, meeting notes, and so on.




```python
user_input ="""Customer reviews of the CO-1T wireless headphones:

"The CO-1T is a great pair of headphones! The design is sleek and modern, and the headphones are \
very comfortable to wear. The sound quality is excellent, and I can hear every detail of my music. \
The built-in microphone means I can make calls without having to take my phone out of my pocket. I \
highly recommend the CO-1T to anyone looking for a great pair of wireless headphones!"

"I'm very disappointed with the CO-1T. The design is nice, but the battery life is terrible. I can \
only use them for a few hours before they need to be recharged. This is very inconvenient, and I'm \
not sure if I can recommend them to anyone."

"The CO-1T is a mixed bag. The speaker quality is great, but the built-in microphone's quality is \
poor. I can hear every detail of my music, but my voice sounds distorted when I make calls. The \
design is nice, and the headphones are comfortable to wear, but the battery life is only average. \
I'm not sure if I can recommend them to anyone."
"""
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>




```python
prompt = f"""Summarize the following.

{user_input}
"""

generate_text(prompt, temp=0)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    The CO-1T wireless headphones have a sleek, modern design and are comfortable to wear. They offer excellent sound quality, with clear and detailed audio. However, the reviews are mixed when it comes to the built-in microphone's quality, with some users reporting distortion. The battery life is a major downside, lasting only a few hours on a single charge. Overall, the CO-1T seems like a decent option for those prioritizing sound quality and comfort, but the mediocre battery life and inconsistent microphone quality might be dealbreakers for some.

# Rewriting

Rewriting text is another useful use case where you need to modify some aspects of the text while maintaining its overall meaning.


```python
user_input = "college students"

prompt = f"""Create a version of this product description that's tailored towards {user_input}.

{product}"""

generate_text(prompt, temp=0.5)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    The CO-1T headphones are the ultimate wireless companion for any college student. With Bluetooth capabilities, you can easily connect to your laptop, phone, or tablet without the hassle of tangling cords. Study for long hours without discomfort or interruption - the lightweight design ensures comfort and the long battery life keeps you connected throughout the day. Quick charge the batteries using the included USB cable when you're running short on time, and use the built-in microphone to stay connected with your friends and family. Control your audio easily with the volume button, and focus on what really matters - acing your courses!

# Extracting

In information extraction, we leverage the model’s ability to capture the context of a piece of text to extract the right information as specified by the prompt.


```python
user_input ="""I am writing to request a refund for a recent CO-1T purchase I made on your platform. \
Unfortunately, the produce has not met my expectations due to its poor battery life. \
Please arrange for the pick-up at this address: to 171 John Street, Toronto ON, M5T 1X2."""

prompt =f"""Extract the product, refund reason and pick-up address from this email:

{user_input}
"""

generate_text(prompt, temp=0)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    Product: CO-1T
    Refund Reason: Poor battery life
    Pick-up Address: 171 John Street, Toronto ON, M5T 1X2

# Classifying

One of the most widely deployed use cases in NLP is text classification. Here, the task is to classify a piece of text into one of a few predefined classes.

## Chat endpoint


```python
user_input ="The battery drains fast"

prompt =f"""The following is a user message to a customer support agent.
Classify the message into one of the following categories: Order, Support, or Refunds.

{user_input}
"""

generate_text(prompt, temp=0)
```

    Support.

## Classify endpoint (a more streamlined option)

Alternatively, the Classify endpoint provides a simple API for running text classification. The endpoint leverages Cohere’s embeddings models and makes it easy to add training examples and even create custom models that are specifically tailored to your task.


```python
from cohere import ClassifyExample

response = co.classify(
  inputs=[user_input],
  examples=[ClassifyExample(text="I can\'t connect to the bluetooth", label="Support"),
            ClassifyExample(text="Why is max volume so low", label="Support"),
            ClassifyExample(text="When will my order arrive", label="Order"),
            ClassifyExample(text="How much is the shipping cost", label="Order"),
            ClassifyExample(text="What is your refund policy", label="Refunds"),
            ClassifyExample(text="How do I return my product", label="Refunds")])
print(response.classifications[0].predictions[0])
```

    Support


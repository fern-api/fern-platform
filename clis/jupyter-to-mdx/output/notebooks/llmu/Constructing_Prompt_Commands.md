<a target="_blank" href="https://colab.research.google.com/github/cohere-ai/notebooks/blob/main/notebooks/llmu/Constructing_Prompt_Commands.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

# Constructing Prompts for the Command Model

Prompts can be as simple as a one-liner, or they can be as complex as multiple layers of specific information. The more specific your command is, the more likely you will get exactly what you need from the model.

We’ll look at some tips and ideas for constructing the commands in your prompt to help you get to your intended outcome.

Read the accompanying [article here](https://docs.cohere.com/docs/constructing-prompts).

# Setup


```python
! pip install cohere -q
```

# Setup


```python
import cohere
co = cohere.Client("COHERE_API_KEY") # Get your API key: https://dashboard.cohere.com/api-keys
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

# Instruction

At its core, prompting a Command model is about sending an instruction to a text generation model and getting a response back. Hence, the smallest unit of a perfectly complete prompt is a short line of instruction to the model.


```python
user_input = "a wireless headphone product named the CO-1T"
prompt = f"""Write a creative product description for {user_input}"""

generate_text(prompt, temp=0.5)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    Introducing the CO-1T: Your new favorite wireless headphones! With sleek style and incredible sound, these headphones are the perfect addition to your on-the-go lifestyle. Crafted with attention to detail, the CO-1T boasts a modern design, featuring a sleek black finish and comfortable, breathable ear pads. Experience the ultimate in convenience with easy Bluetooth connectivity, allowing you to seamlessly switch between your devices. Enjoy your favorite tunes, podcasts, and calls without the hassle of tangled wires, as the CO-1T delivers crystal-clear audio and deep bass for an immersive listening experience. The adjustable headband ensures a secure, comfortable fit, making it a loyal companion for your daily commute, workout sessions, or travel adventures. Don't let the compact size fool you – the CO-1T packs a powerful punch with its long-lasting battery life, ensuring hours of uninterrupted listening. Embrace the freedom of wireless technology and elevate your audio game with the CO-1T headphones – a true testament to style and substance.

# Specifics

A simple and short prompt can get you started, but in most cases, you’ll need to add specificity to your instructions.

### Single paragraph


```python
user_input_product = "a wireless headphone product named the CO-1T"
user_input_keywords = '"bluetooth", "wireless", "fast charging"'
user_input_customer = "a software developer who works in noisy offices"
user_input_describe = "benefits of this product"

prompt = f"""Write a creative product description for {user_input_product}
with the keywords {user_input_keywords} for {user_input_customer}, and describe {user_input_describe}."""

generate_text(prompt, temp=0.5)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    Introducing the CO-1T wireless headphones - the ultimate solution for software developers working in noisy offices. With its advanced Bluetooth connectivity, you can easily pair these headphones with your devices without the hassle of tangled wires. The fast charging technology ensures that you never run out of battery when you need your headphones the most. Get up to 4 hours of non-stop usage on a single 10-minute charge!
    
    The CO-1T headphones are designed to block out distracting noises, allowing you to focus on your work and tune out the chaos around you. Immerse yourself in your coding world with powerful and immersive audio. And when you're done for the day, fold them up and store them conveniently - they're lightweight and portable!
    
    No more distractions, only productivity. Upgrade your office experience with CO-1T wireless headphones and boost your development productivity.

### Structured

In the example above, we pack the additional details of the prompt in a single paragraph. Alternatively, we can also compose it to be more structured, like so:


```python
user_input_product = "a wireless headphone product named the CO-1T"
user_input_keywords = '"bluetooth", "wireless", "fast charging"'
user_input_customer = "a software developer who works in noisy offices"
user_input_describe = "benefits of this product"

prompt = f"""Write a creative product description for {user_input_product}.
Keywords: {user_input_keywords}
Audience: {user_input_customer}
Describe: {user_input_describe}"""

generate_text(prompt, temp=0.5)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    Introducing the CO-1T wireless headphones - the ultimate solution for immersive audio and uninterrupted focus, especially in noisy office environments. With Bluetooth connectivity, you can easily pair these headphones with your devices and enjoy the freedom of wireless listening. No more annoying tangles of wires interrupting your workflow!
    
    The CO-1T headphones are designed to deliver crystal-clear, high-quality audio, ensuring that you can focus on your work without any distractions from your surroundings. The active noise cancellation technology blocks out unwanted noise, allowing you to immerse yourself in your coding or projects. Whether it's a bustling open-plan office or a crowded coffee shop, these headphones create a peaceful sanctuary for your creative workflows.
    
    But that's not all - the CO-1T also features fast charging, giving you the convenience of quick power boosts. No need to wait for ages; a quick charge of 15 minutes will give you a full hour of usage time! Stay focused and productive throughout your day with reliable, efficient power.
    
    Crafted with comfort in mind, the CO-1T headphones feature ergonomic design elements and premium materials that make them lightweight and comfortable to wear over long periods. You'll barely notice you're wearing them! And with intuitive controls, you can easily manage your calls and music without touching your phone.
    
    For the hardworking software developer, the CO-1T wireless headphones are a game-changer. Upgrade your office experience and boost your productivity with this sleek and efficient audio companion. Say goodbye to distractions and hello to immersive focus!

# Context

While LLMs excel in text generation tasks, they struggle in context-aware scenarios. In real applications, being able to add context to a prompt is key because this is what enables personalized generative AI for a team or company. It makes many use cases possible, such as intelligent assistants, customer support, and productivity tools, that retrieve the right information from a wide range of sources and add it to the prompt.

### Without Context


```python
user_input ="What are the key features of the CO-1T wireless headphone"
prompt = user_input

generate_text(prompt, temp=0)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    The CO-1T wireless headphones are sleek, comfortable, and offer high-quality audio. Some of its prominent features are:
    
    1. Audio Quality: The CO-1T headphones are designed to deliver immersive sound with powerful bass, clear highs, and crystal-clear vocals for an overall enjoyable listening experience.
    
    2. Wireless Connectivity: They offer wireless connectivity via Bluetooth 5.0 technology, allowing for stable and quick pairing with devices such as smartphones, tablets, and laptops. You can easily connect to your devices without the hassle of tangled wires.
    
    3. Noise Cancellation: These headphones are equipped with active noise cancellation (ANC) technology, which helps in reducing ambient noise and allows you to focus on your music or calls. They also have a transparency mode that lets you hear your surroundings without removing the headphones.
    
    4. Comfort and Design: The CO-1T headphones are designed to be comfortable with soft ear cushions and an adjustable headband. They are lightweight, ensuring comfort during extended periods of use. The foldable design makes them portable and easy to carry on the go.
    
    5. Long Battery Life: The headphones have a long battery life, offering up to 20 hours of continuous playback time on a single charge. This means you can use them for multiple sessions without worrying about running out of power.
    
    6. Built-in Microphone and Controls: The CO-1T features a built-in microphone for hands-free calling and voice assistant access. It also has easy-to-use control buttons on the earcups for adjusting volume, controlling playback, and managing calls.
    
    7. Multi-Point Connection: These headphones can connect simultaneously to two devices, making it convenient to switch between, for example, your work computer and your personal phone.
    
    8. Compatibility: The CO-1T wireless headphones are compatible with most Bluetooth-enabled devices, including iOS and Android smartphones and tablets, as well as laptops and desktop computers.
    
    Overall, the CO-1T wireless headphones provide a combination of audio quality, comfort, and convenience for everyday use.

### With Context


```python
context = """Think back to the last time you were working without any distractions in the office. That's right...I bet it's been a while. \
With the newly improved CO-1T noise-cancelling Bluetooth headphones, you can work in peace all day. Designed in partnership with \
software developers who work around the mayhem of tech startups, these headphones are finally the break you've been waiting for. With \
fast charging capacity and wireless Bluetooth connectivity, the CO-1T is the easy breezy way to get through your day without being \
overwhelmed by the chaos of the world."""

user_input = "What are the key features of the CO-1T wireless headphone"

prompt = f"""{context}
Given the information above, answer this question: {user_input}"""

generate_text(prompt, temp=0.1)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    The CO-1T wireless headphones have fast charging and Bluetooth connectivity. They are also noise-cancelling, making them a great option for concentration in busy environments.

# Examples

All our prompts so far use what is called zero-shot prompting, which means that we are providing instruction without any example. But in many cases, it is extremely helpful to provide examples to the model to guide its response. This is called few-shot prompting.



### Without Examples (Zero-Shot)


```python
prompt="""Turn the following message to a virtual assistant into the correct action:
Send a message to Alison to ask if she can pick me up tonight to go to the concert together"""

generate_text(prompt, temp=0)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    Please message Alison to see if she's available to pick me up tonight for the concert.

### With Examples (Few-Shot)


```python
user_input = "Send a message to Alison to ask if she can pick me up tonight to go to the concert together"

prompt=f"""Turn the following message to a virtual assistant into the correct action:

Message: Ask my aunt if she can go to the JDRF Walk with me October 6th
Action: can you go to the jdrf walk with me october 6th

Message: Ask Eliza what should I bring to the wedding tomorrow
Action: what should I bring to the wedding tomorrow

Message: Send message to supervisor that I am sick and will not be in today
Action: I am sick and will not be in today

Message: {user_input}
Action: """

generate_text(prompt, temp=0)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    Can you pick me up tonight to go to the concert?

# Chain of Thought

One specific way to provide examples in a prompt is to show responses that include a reasoning step. This way, we are asking the model to “think” first rather than going straight to the response.

### Without Examples


```python
prompt=f"""Q: Roger has 5 tennis balls. He buys 2 more cans of tennis balls. Each can has 3 tennis balls. \
How many tennis balls does he have now?
A: The answer is 11.
---
Q: The cafeteria had 23 apples. If they used 20 to make lunch and bought 6 more, how many apples do they have?
A: The answer is 9.
---
Q: A box has 10 balls and a half of the balls are red balls. How many red balls are in the box if 4 red balls are added?
A:"""

generate_text(prompt, temp=0)
```

    The answer is 12. There are 5 balls that are red and 5 balls that are not red, and adding 4 red balls would make it 9 red and 6 not red.

### With Examples


```python
prompt=f"""Q: Roger has 5 tennis balls. He buys 2 more cans of tennis balls. Each can has 3 tennis balls. \
How many tennis balls does he have now?
A: Roger started with 5 balls. 2 cans of 3 tennis balls each is 6 tennis balls. 5 + 6 = 11. \
The answer is 11.
---
Q: The cafeteria had 23 apples. If they used 20 to make lunch and bought 6 more, how many apples do they have?
A: The cafeteria started with 23 apples. They used 20 to make lunch, so they have 23 - 20 = 3 apples. They bought 6 more apples, so they have 3 + 6 = 9 apples. \
The answer is 9.
---
Q: A box has 12 balls and a half of the balls are red balls. How many red balls are in the box if 4 red balls are added?
A:"""

generate_text(prompt, temp=0)
```

    There are 12 / 2 = 6 red balls in the box. When 4 more red balls are added, the number of red balls becomes 6 + 4 = 10. The answer is 10.

# Format

We can also get the model to generate responses in a certain format. Let’s look at a couple of them: markdown tables and JSON strings.

### Table Format


```python
prompt="""Turn the following information into a table with columns Invoice Number, Merchant Name, and Account Number.
Bank Invoice: INVOICE #0521 MERCHANT ALLBIRDS ACC XXX3846
Bank Invoice: INVOICE #6781 MERCHANT SHOPPERS ACC XXX9877
Bank Invoice: INVOICE #0777 MERCHANT CN TOWER ACC XXX3846
"""

generate_text(prompt, temp=0)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    | Invoice Number | Merchant Name | Account Number |
    |---|---|---|
    | #0521 | ALLBIRDS | XXX3846 |
    | #6781 | SHOPPERS | XXX9877 |
    | #0777 | CN TOWER | XXX3846 |

### JSON Format


```python
prompt="""Turn the following information into a JSON string with the following keys: Invoice Number, Merchant Name, and Account Number.
Bank Invoice: INVOICE #0521 MERCHANT ALLBIRDS ACC XXX3846
Bank Invoice: INVOICE #6781 MERCHANT SHOPPERS ACC XXX9877
Bank Invoice: INVOICE #0777 MERCHANT CN TOWER ACC XXX3846
"""

generate_text(prompt, temp=0)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    ```json
    [
        {
            "Invoice Number": "0521",
            "Merchant Name": "ALLBIRDS",
            "Account Number": "XXX3846"
        },
        {
            "Invoice Number": "6781",
            "Merchant Name": "SHOPPERS",
            "Account Number": "XXX9877"
        },
        {
            "Invoice Number": "0777",
            "Merchant Name": "CN TOWER",
            "Account Number": "XXX3846"
        }
    ]
    ```

# Steps

To steer the model toward generating higher-quality responses, it can be helpful to add instructions for the model to generate intermediate steps before generating the final output. The information generated during these steps helps enrich the model’s context before it generates the final response.

### Without Steps


```python
user_input = "education"

prompt = f"""Generate a startup idea for this industry: {user_input}"""

generate_text(prompt, temp=0.5)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    Here's a startup idea for the education industry: 
    
    "Edutainment Live": An interactive, online platform that offers live and engaging educational experiences hosted by celebrity teachers. 
    
    The platform connects renowned professors, teachers, and industry experts with students around the world, providing an exciting and personalized learning environment. These "edutainment" sessions are designed to feel like interactive concerts, blending education and entertainment seamlessly. Students can tune in live to ask questions, engage in discussions, and learn about various subjects. 
    
    The startup also offers on-demand content for those who miss the live sessions, as well as a library of educational resources and study materials. Users can subscribe to the platform on a monthly or yearly basis, gaining access to a full curriculum of entertaining and informative sessions across multiple disciplines. 
    
    In addition, the platform encourages social interaction and the creation of study groups, enabling students to connect and collaborate with peers, fostering a sense of community and enhancing the learning experience further. 
    
    Edutainment Live organizes sessions across various topics, including math, science, history, art, music, and more, ensuring a well-rounded curriculum. The sessions are tailored to different grade levels, accommodating students from primary school to university level, with customized content for each demographic. 
    
    To monetize, the startup can offer different subscription tiers with varying access levels, and also implement a revenue-sharing model where teachers can earn a portion of the proceeds from their popular sessions. Partnerships with educational institutions and governments for content distribution and sponsorship deals with relevant brands could further bolster the business. 
    
    This idea combines the engaging nature of live performances with the accessibility of online education, creating an "edutainment" experience that captivates and educates students, while also providing a unique and personalized learning platform for teachers to showcase their expertise.

### With Steps


```python
user_input = "education"

prompt = f"""Generate a startup idea for this industry: {user_input}
First, describe the problem to be solved.
Next, describe the target audience of this startup idea.
Next, describe the startup idea and how it solves the problem for the target audience.
Next, provide a name for the given startup.

Use the following format:
Industry: <the given industry>
The Problem: <the given problem>
Audience: <the given target audience>
Startup Idea: <the given idea>
Startup Name: <the given name>"""

generate_text(prompt, temp=0.9)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    Industry: Education
    The Problem: Traditional education methods often lack engagement and interactivity, leading to less effective learning, especially for students with diverse learning styles. This issue is further exacerbated in online or remote learning settings, where students may struggle with isolation and a lack of personal connection with their educators. 
    
    Audience: The target audience for this startup idea would be students of all ages and levels who seek a more interactive and engaging learning experience, especially those who learn best through social and collaborative methods. This could include remote learners, homeschooled students, or even students in traditional classroom settings who are looking for additional resources. 
    
    Startup Idea: Create an online/remote learning platform that focuses on social learning and collaboration. This platform would aim to increase engagement and enhance the overall learning experience by fostering a sense of community and connection. 
    
    It would provide interactive tools and features that encourage collaboration on projects, discussion-based learning, and peer-to-peer knowledge sharing. The platform could also include elements of gamification and personalized learning paths to make the experience more enjoyable and tailored to individual needs. Students would have access to a variety of courses and resources, and the platform would facilitate interactions between them, creating a vibrant learning community. 
    
    Startup Name: "LearnVerse"
    
    LearnVerse offers a unique and engaging learning environment, bringing together a community of students and creating a fun and interactive educational experience.

# Prefix

To ensure that the response follows a consistent format or style, sometimes we need to add a prefix or leading words to help guide the response.

### Without Prefix


```python
user_input_position = "modern centre forward"

prompt = f"""Describe the ideal {user_input_position}. In particular, describe the following characteristics: \
pace, skill, and awareness."""

generate_text(prompt, temp=0.3)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    The ideal modern centre forward would need to possess a plethora of attributes to excel in the position. They would require a unique blend of physical and mental attributes to succeed and dominate in the role. 
    
    Pace: 
    The modern centre forward would have incredible pace, both in a straight line and with their acceleration. The increase in pace across the sport has helped stretch games and create more chances, so a player in this role would need to be rapid to keep up with the play and exploit gaps in the opposition's defence. Exceptional pace also allows them to make runs in behind the defence, stretching the opposition and opening up space for teammates.
    
    Skill:
    Skill and trickery are also essential for the centre forward to possess. They would have the ability to control the ball in tight spaces, with players around them, and be adept at using both feet, opening up a variety of options when in possession. An array of skills would help them beat defenders and create chances from seemingly impossible situations. An eye for goal is a crucial skill, being able to finish with power or precision, depending on the opportunity presented. Further, an understanding of different finishes would see them excel, being able to chip keepers, slot the ball into the bottom corners or fire into the roof of the net as situations demand. 
    
    Awareness:
    A high football IQ is necessary for the centre forward to link play between the midfield and attack. They would provide an outlet for through balls and have the vision to pick out an overlapping runner. An awareness of their surroundings, including teammates' movements and the positions of defenders, would allow them to create space and opportunities, both for themselves and others. The centre forward would also have the ability to bring others into the game, with precise passing, and have the discipline to drop deep and contribute to buildup play. 
    
    The ideal centre forward would combine these attributes to be a constant threat up front, creating chances and opening up defences with their skill and pace, while also being a creative force aware of those around them. Their all-round game would be of the highest caliber, posing a constant danger to the opposition and contributing to a well-rounded attacking threat within the team.

### With Prefix


```python
user_input_position = "modern centre forward"

prompt = f"""Describe the ideal {user_input_position}. In particular, describe the following characteristics: \
pace, skill, and awareness.

Pace:"""

generate_text(prompt, temp=0.3)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    The ideal modern centre forward is gifted with electrifying pace, possessing the acceleration and agility to leave defenders in their wake. They can sprint past opponents with ease, creating space and opportunities with their sheer speed. This speed allows them to stretch the opposition's defense, opening up avenues for themselves and their teammates. Their ability to make lightning-quick runs in behind the defense makes them a constant threat, keeping the opposition on their toes.
    
    Skill:
    The centre forward has an impressive arsenal of technical skills. They are adept at manipulating the ball with sophisticated footwork, making them unpredictable in one-on-one situations. Skillful dribbling allows them to beat defenders close up, while also being able to create space for themselves when closely marked. An eye for goal is a must, coupled with precision finishing and a variety of shots to score goals consistently. The ability to link up with teammates is another crucial skill, playing quick one-twos and combining seamlessly with supporting players.
    
    Awareness:
    What sets the elite centre forwards apart is their exceptional awareness of their surroundings. They possess an uncanny ability to sense danger and anticipate opportunities. This awareness allows them to position themselves expertly, finding pockets of space within the opposition's defense. They time their runs to perfection, arriving at the right moments to receive through balls or pull off dangerous crosses. Additionally, they have a keen understanding of when to drop deep, link up play, and create numerical advantages in the midfield.
    
    This awareness also extends to reading the game, anticipating passes and predicting the trajectory of the play. This enables them to intercept passes, pounce on mistakes, and launch quick counterattacks. The centre forward's spatial awareness, combined with their technical prowess, makes them a constant menace to the opposing backline. They create a constant sense of unease, exploiting any openings with ruthless efficiency.
    
    In conclusion, the modern centre forward is a blend of speedster, technician, and tactical mindful player. Their pace opens up defenses, their skills electrify the attack, and their awareness ensures they are in the right place at the right time. This multifaceted approach makes them integral to any successful modern football team, capable of influencing the outcome of games with their dynamic presence up front.

### With Prefix (Zero Shot Chain of Thought)


```python
prompt=f"""Q: A juggler can juggle 16 balls. Half of the balls are golf balls,
and half of the golf balls are blue. How many blue golf balls are
there?
A: Let’s think step by step."""

generate_text(prompt, temp=0)
```



<style>
  pre {
      white-space: pre-wrap;
  }
</style>



    There are 16 / 2 = 8 balls that are golf balls. 
    There are 8 / 2 = 4 blue golf balls.
    Therefore, the answer is 4.


```python

```

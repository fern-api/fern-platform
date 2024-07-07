# Case Study: Agentic Chatbots for HR Applications

In this cookbook, we will demonstrate an implementation of an agentic chatbot that facilitates HR operations at a fictionalized version of Cohere. Through its tools, the chatbot is able to retrieve and act upon relevant information and fetch data from external data sources (such as a database or API).

## Getting Started

Let's start by setting up our imports and tool definitions. We provide our agent with mock data on Cohere employees, along with these tools:

- `python_tool`: allow the model to write and execute Python code
- `get_info_employee`: fetch information regarding a (mock) Cohere employee from a database
- `search_cohere_policies`: fetch relevant documents about Cohere's HR policies
- `get_employee_timezone`: fetch current UTC offset for a location
- `internet_search`: browse the internet to find relevant information for the query
- `get_template`: get the template for a specific kind of communication, such as offer to a candidate, refusal, etc.

To simplify the code below, we keep the definitions of these tools in the `tools.py` file. For this cookbook, you will also need two API keys: one from Cohere, and one from [Tavily](https://tavily.com/) to allow the model to search the internet. You can create a `.env` file in this directory to store these.


```python
# Uncomment if you need to install the following packages
#!pip install --quiet langchain langchain_cohere langchain_experimental --upgrade
```


```python
import os

from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_cohere.chat_models import ChatCohere
from langchain_cohere.react_multi_hop.agent import create_cohere_react_agent
from langchain.agents import AgentExecutor
from langchain_core.messages.ai import AIMessage
from langchain_core.messages.human import HumanMessage

from tools import python_tool, get_info_employee, search_cohere_policies, get_location_utc_offset, internet_search, get_template   

load_dotenv()
```




    True




```python
# API Keys
cohere_api_key = os.getenv("CO_API_KEY")
```


```python
# define the tools
TOOLS = [python_tool, get_info_employee, search_cohere_policies, get_location_utc_offset, internet_search, get_template]
```


```python
# define the premable with the relevant information about the tools and the task
PREAMBLE = """## Task And Context
You use your advanced complex reasoning capabilities to help people by answering their questions and other requests interactively. You will be asked a very wide array of requests on all kinds of topics. You should focus on serving the user's needs as best you can, which will be wide-ranging. 

You will be equipped with various tools to help you generate responses. You may need to use multiple tools in parallel or sequentially to complete your task. Think step-by-step.

## Style Guide
Unless the user asks for a different style of answer, you should answer in full sentences, using proper grammar and spelling.

## Additional Context
You are serving as an interface between a user and multiple data sources related to Human Resources at Cohere. You answer the user's question using the tools you have access to. 

The conversation will happen in a chat setting, so user queries may depend on previous context. Try to use previous context wherever possible, rather than recomputing answers.
"""

prompt = ChatPromptTemplate.from_template("{input}")
```


```python
# Define the agent
llm = ChatCohere(model="command-r-plus", temperature=0, cohere_api_key=cohere_api_key)

# instantiate agent and agent executor
agent = create_cohere_react_agent(
   llm=llm,
   tools=TOOLS,
   prompt=prompt,
)
agent_executor = AgentExecutor(agent=agent,
                               tools=TOOLS,
                               verbose=True,
                               return_intermediate_steps=True
                               )
```


```python
# initialize empty chat history
chat_history  = []

# functions to converse with the Agent
def update_chat_history(chat_history, query, answer):
    chat_history.append(HumanMessage(content=query))
    chat_history.append(AIMessage(content=answer['output']))
    return chat_history

def run_agent(query, chat_history, preamble=PREAMBLE):
    answer = agent_executor.invoke(
            {
                "input": query,
                "preamble": preamble,
                "chat_history": chat_history
            }
        )
    chat_history = update_chat_history(chat_history, query, answer)

    return answer, chat_history
```

## Basic Prompts

We are now ready to run some basic queries. These initial queries do not depend on prior chat history, but require the usage of several tools.


```python
q0 = "Generate an offer for the role of Machine Learning Engineer for the candidate Ines Villa, with starting date September 1st 2024, salary $100000 annually, and location in New York."

a0, chat_history = run_agent(q0, chat_history)
```

In the first example, the Agent uses the "get_template" tool to load the relevant template, and fills it with the relevant information provided by the user.


```python
q1 = "how many days off do Cohere employees have?"
a1, chat_history = run_agent(q1, chat_history)
```

    
    
    [1m> Entering new AgentExecutor chain...[0m
    [32;1m[1;3m
    I will search for the number of days off Cohere employees have.
    {'tool_name': 'search_cohere_policies', 'parameters': {'query': 'number of days off'}}
    [0m[38;5;200m[1;3mAt Cohere, every employee has 30 days off per year.[0m[32;1m[1;3mRelevant Documents: 0
    Cited Documents: 0
    Answer: Every Cohere employee has 30 days off per year.
    Grounded answer: Every Cohere employee has <co: 0>30 days off per year</co: 0>.[0m
    
    [1m> Finished chain.[0m


In the second example, the Agent uses "search_cohere_policies" to perform a RAG task, and answer the user's question based on the retrieved information.


```python
q2 = "how many days off did Aaron use?"
a2, chat_history = run_agent(q2, chat_history)
```

    
    
    [1m> Entering new AgentExecutor chain...[0m
    [32;1m[1;3m
    I will search for the number of days off Aaron has used.
    {'tool_name': 'get_info_employee', 'parameters': {'employee': 'Aaron'}}
    [0m[33;1m[1;3m{'name': 'Aaron', 'used_days_off': 12, 'location': 'London', 'role': 'ML eng'}[0m[32;1m[1;3mRelevant Documents: 0
    Cited Documents: 0
    Answer: Aaron has used 12 days off.
    Grounded answer: Aaron has used <co: 0>12 days off</co: 0>.[0m
    
    [1m> Finished chain.[0m


In the third example, the Agent uses the "get_info_employee" tool to retrieve information from a csv, and then generates the answers.

As we have seen, in the examples above the Agent receives the input query and selects the most appropriate tool ('get_template', 'search_cohere_policies' and 'get_info_employee') to generate the answer.

## History-dependent Queries

We will now see how the Agent can engage in a conversations, answering queries based on the prior chat history. However, the usage pattern is exactly the same as before!


```python
q3 = "how many days off does he have left?"

a3, chat_history = run_agent(q3, chat_history)
```

    
    
    [1m> Entering new AgentExecutor chain...[0m
    [32;1m[1;3m
    I will use the 'get_info_employee' tool to find out how many days off Aaron has used, and then calculate how many days off he has left.
    {'tool_name': 'get_info_employee', 'parameters': {'employee': 'Aaron'}}
    [0m[33;1m[1;3m{'name': 'Aaron', 'used_days_off': 12, 'location': 'London', 'role': 'ML eng'}[0m[32;1m[1;3mRelevant Documents: 0
    Cited Documents: 0
    Answer: Aaron has 18 days off left.
    Grounded answer: Aaron has <co: 0>18 days off left.</co: 0>[0m
    
    [1m> Finished chain.[0m


In order to understand q3, the Agent needs to remember who we are talking about - Aaron.


```python
q4 = "And Harper?"

a4, chat_history = run_agent(q4, chat_history)
```

    
    
    [1m> Entering new AgentExecutor chain...[0m
    [32;1m[1;3m
    I will search for the number of days off Harper has used, then subtract that from the total number of days off to calculate how many days off Harper has left.
    {'tool_name': 'get_info_employee', 'parameters': {'employee': 'Harper'}}
    [0m[33;1m[1;3m{'name': 'Harper', 'used_days_off': 7, 'location': 'Singapore', 'role': 'ML eng'}[0m[32;1m[1;3mRelevant Documents: 0
    Cited Documents: 0
    Answer: Harper has 23 days off left.
    Grounded answer: Harper has <co: 0>23 days off left</co: 0>.[0m
    
    [1m> Finished chain.[0m


To answer q4, the Agent needs to remember what is the current topic, namely, the number of days off left for a specific employee.


```python
q5 = "Where is he based?"

a5, chat_history = run_agent(q5, chat_history)
```

    
    
    [1m> Entering new AgentExecutor chain...[0m
    [32;1m[1;3m
    I will search for Harper's location using the 'get_info_employee' tool.
    {'tool_name': 'get_info_employee', 'parameters': {'employee': 'Harper'}}
    [0m[33;1m[1;3m{'name': 'Harper', 'used_days_off': 7, 'location': 'Singapore', 'role': 'ML eng'}[0m[32;1m[1;3mRelevant Documents: 0
    Cited Documents: 0
    Answer: Harper is based in Singapore.
    Grounded answer: Harper is based in <co: 0>Singapore</co: 0>.[0m
    
    [1m> Finished chain.[0m


Again, the Agent here needs to solve the anaphora ("he") selecting the correct referent ("Harper").


```python
q6 = "What's the time difference between Harper and Aaron?"

a6, chat_history = run_agent(q6, chat_history)
```

    
    
    [1m> Entering new AgentExecutor chain...[0m
    [32;1m[1;3m
    I will first find out where Aaron is based, then I will use the 'get_employee_timezone' tool to find the time difference between Harper and Aaron.
    {'tool_name': 'get_info_employee', 'parameters': {'employee': 'Aaron'}}
    [0m[33;1m[1;3m{'name': 'Aaron', 'used_days_off': 12, 'location': 'London', 'role': 'ML eng'}[0m[32;1m[1;3m
    Aaron is based in London. Now I will use the 'get_employee_timezone' tool to find the time difference between Harper and Aaron.
    {'tool_name': 'get_employee_timezone', 'parameters': {'city': 'Singapore'}}
    [0m[36;1m[1;3m8.0[0m[32;1m[1;3m
    {'tool_name': 'get_employee_timezone', 'parameters': {'city': 'London'}}
    [0m[36;1m[1;3m1.0[0m[32;1m[1;3mRelevant Documents: 0,1,2
    Cited Documents: 0,1,2
    Answer: There is a 7-hour time difference between Harper and Aaron.
    Grounded answer: There is a <co: 1,2>7-hour</co: 1,2> time difference between Harper and Aaron.[0m
    
    [1m> Finished chain.[0m


Here, the Agent has to perform multiple tool calls, to get the final answer.


```python
q7 = "How far apart are Harper and Aaron?"

a7, chat_history = run_agent(q7, chat_history)
```

    
    
    [1m> Entering new AgentExecutor chain...[0m
    [32;1m[1;3m
    I will search for the locations of Harper and Aaron and then use an online distance calculator to find out how far apart they are.
    {'tool_name': 'get_info_employee', 'parameters': {'employee': 'Harper'}}
    [0m[33;1m[1;3m{'name': 'Harper', 'used_days_off': 7, 'location': 'Singapore', 'role': 'ML eng'}[0m[32;1m[1;3m
    {'tool_name': 'get_info_employee', 'parameters': {'employee': 'Aaron'}}
    [0m[33;1m[1;3m{'name': 'Aaron', 'used_days_off': 12, 'location': 'London', 'role': 'ML eng'}[0m[32;1m[1;3m
    Harper is based in Singapore and Aaron is based in London. Now I will use an online distance calculator to find out how far apart they are.
    {'tool_name': 'internet_search', 'parameters': {'query': 'distance between singapore and london'}}
    [0m[33;1m[1;3m[{'url': 'https://www.rome2rio.com/s/Singapore/London', 'content': 'The distance between Singapore and London is 6828 miles. How long does it take to get from Singapore to London? It takes approximately 16h 24m to get from Singapore to London, including transfers.'}, {'url': 'https://www.travelmath.com/distance/from/Singapore/to/London,+United+Kingdom', 'content': 'The total straight line flight distance from Singapore to London, United Kingdom is 6,742 miles. This is equivalent to 10 850 kilometers or 5,858 nautical miles. Your trip begins in Singapore. It ends in London, United Kingdom. Your flight direction from Singapore to London, United Kingdom is Northwest (-38 degrees from North).'}, {'url': 'https://www.rome2rio.com/s/London/Singapore', 'content': 'The cheapest way to get from London to Singapore costs only $513, and the quickest way takes just 16 hours. Find the travel option that best suits you. Rome2Rio. ... The distance between London and Singapore is 10925 km. How long does it take to get from London to Singapore?'}, {'url': 'https://www.rome2rio.com/s/London/Singapore-Country', 'content': 'The distance between London and Singapore is 10915 km. How long does it take to get from London to Singapore? It takes approximately 15h 40m to get from London to Singapore, including transfers.'}, {'url': 'https://www.distance.to/London/Singapore', 'content': 'Distance: 6,738.95 mi (10,845.29 km) The shortest distance (air line) between London and Singapore is 6,738.95 mi (10,845.29 km). Driving route: -- (- ) The shortest route between London and Singapore is according to the route planner. The driving time is approx. . Half of the trip is reached in . Time difference: 7h'}][0m[32;1m[1;3mRelevant Documents: 0,1,2,3,4,5,6
    Cited Documents: 0,1,2,3,4,5,6
    Answer: Harper is based in Singapore and Aaron is based in London. The distance between Singapore and London is approximately 6,742 miles or 10,845 kilometres.
    Grounded answer: Harper is based in <co: 0>Singapore</co: 0> and Aaron is based in <co: 1>London</co: 1>. The distance between Singapore and London is approximately <co: 2,3>6,742 miles</co: 2,3> or <co: 4,5,6>10,845 kilometres</co: 4,5,6>.[0m
    
    [1m> Finished chain.[0m


In the last example, the Agent has to use even more tools, to get the final answer.

# Conclusions
In this notebook, we have seen how the Agent is able to select the right tools to answer users's question, leverage the information shared with the user during the conversations to answer follow-up question, and deal with complex queries which require using several tools.


```python

```

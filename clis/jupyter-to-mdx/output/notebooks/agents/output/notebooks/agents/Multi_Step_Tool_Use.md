# A ReAct agent with Command R+, achieving the same goals as Adaptive RAG | Add the custom tools

Adaptive RAG is a strategy for RAG that unites (1) [query analysis](https://blog.langchain.dev/query-construction/) with (2) [active / self-corrective RAG](https://blog.langchain.dev/agentic-rag-with-langgraph/).

In the paper, they report query analysis to route across:
- No Retrieval (LLM answers)
- Single-shot RAG
- Iterative RAG


We'll use Command R+, a recent release from Cohere that:
- Has strong accuracy on RAG, Tool Use and Agents
- Has 128k context


# Environment


```python
%pip install --quiet langchain langchain_cohere tiktoken faiss-cpu beautifulsoup4 langchain_experimental matplotlib tabulate python-dotenv
```

Save your credentials in a .env file in your user root directory, so that you can retrieve securely


```python
import os
from dotenv import load_dotenv
load_dotenv()

COHERE_API_KEY = os.environ.get("COHERE_API_KEY")
TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY") # Get your Free API key at https://app.tavily.com once you sign up
FMP_API_KEY = os.environ.get("FMP_API_KEY") # Get your Free API key https://site.financialmodelingprep.com/ once you sign up
```

# Create tools
The ReAct agent will be equipped with these tools. The model can pick between
- web search
- RAG: retrieval from a vector store
- custom tool (call an external API)
- directly answering

The model can use any of these tools, in any sequence of steps, and self-reflect.

### Web search tool


```python
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.pydantic_v1 import BaseModel, Field

internet_search = TavilySearchResults()
internet_search.name = "internet_search"
internet_search.description = "Returns a list of relevant document snippets for a textual query retrieved from the internet."


class TavilySearchInput(BaseModel):
    query: str = Field(description="Query to search the internet with")


internet_search.args_schema = TavilySearchInput
```

### Python interpreter tool


```python
from langchain.agents import Tool
from langchain_experimental.utilities import PythonREPL

python_repl = PythonREPL()
repl_tool = Tool(
    name="python_repl",
    description="Executes python code and returns the result. The code runs in a static sandbox without interactive mode, so print output or save output to a file.",
    func=python_repl.run,
)
repl_tool.name = "python_interpreter"

# from langchain_core.pydantic_v1 import BaseModel, Field
class ToolInput(BaseModel):
    code: str = Field(description="Python code to execute.")
repl_tool.args_schema = ToolInput
```

### RAG tool


```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_cohere import CohereEmbeddings
from langchain_community.document_loaders import WebBaseLoader
from langchain_community.vectorstores import FAISS

# Set embeddings
embd = CohereEmbeddings()

# Docs to index
urls = [
    "https://www.mayerbrown.com/en/insights/publications/2023/03/new-data-standards-pending-for-federally-regulated-financial-entities",
    "https://plaid.com/resources/open-finance/what-is-fdx/",
    "https://www.egnyte.com/guides/financial-services/financial-data-compliance",
]

# Load
docs = [WebBaseLoader(url).load() for url in urls]
docs_list = [item for sublist in docs for item in sublist]

# Split
text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
    chunk_size=512, chunk_overlap=0
)
doc_splits = text_splitter.split_documents(docs_list)

# Add to vectorstore
vectorstore = FAISS.from_documents(
    documents=doc_splits,
    embedding=embd,
)

vectorstore_retriever = vectorstore.as_retriever()
```


```python
from langchain.tools.retriever import create_retriever_tool

vectorstore_search = create_retriever_tool(
    retriever=vectorstore_retriever,
    name="vectorstore_search",
    description="Retrieve relevant info from a vectorstore that contains documents related to Data Compliance for Financial Services and its regulation.",
)
```

### Custom Tool For Market Capitalization



1. Define the function


```python
import requests

# Function to get the market capitalization of a ticker symbol
def get_market_cap(ticker):
    url = f"https://financialmodelingprep.com/api/v3/market-capitalization/{ticker}?apikey={FMP_API_KEY}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        if data and isinstance(data, list) and len(data) > 0:
            market_cap = data[0].get('marketCap', 'No market cap data available')
            return [{'id': 0, 'text': f'Market cap for {ticker}: ${market_cap}'}]
        else:
            return "No data available for the specified ticker."
    else:
        return "Failed to retrieve data from the API."
```

2. Define the Custom Tool


```python
from langchain.tools import tool

@tool
def market_cap(ticker: str) -> list:
    """This tool is only used to find market capitalization. Do not use it for anything else. Find the ticker when asked about capitalization. The ticker symbol of the company (e.g., AAPL which is the ticker for Apple Inc, MSFT for Microsoft )"""
    return get_market_cap(ticker)
    
```

# Create the ReAct Agent
The model can smartly pick the right tool(s) for the user query, call them in any sequence of steps, analyze the results and self-reflect.


```python
from langchain.agents import AgentExecutor
from langchain_cohere.react_multi_hop.agent import create_cohere_react_agent
from langchain_core.prompts import ChatPromptTemplate
```


```python
# LLM
from langchain_cohere.chat_models import ChatCohere

chat = ChatCohere(model="command-r-plus", temperature=0.3)

# Preamble
preamble = """
Use all tools that are available to answear the question. 
If the query covers the topics of Federal Financial Institutions, use the vectorstore search first.
If the query covers market capitalization, use the market cap tool first.
You are equipped with an internet search tool, and python interpreter, a market cap api, and a special vectorstore of information about Data Compliance for Financial Services.

"""

# Prompt
prompt = ChatPromptTemplate.from_template("{input}")

# Create the ReAct agent
agent = create_cohere_react_agent(
    llm=chat,
    tools=[vectorstore_search, internet_search, repl_tool, market_cap],
    prompt=prompt,
)
```


```python
agent_executor = AgentExecutor(
    agent=agent, tools=[vectorstore_search, internet_search, repl_tool, market_cap], verbose=True
)
```

# Testing the ReAct agent

**Let's ask a question that requires web search.**


```python
result = agent_executor.invoke(
    {
        "input": "How does the current interest rate environment affect the bond market?",
        "preamble": preamble,
    }
)
```


```python
result["output"]
```

**Let's ask a question that requires RAG retrieval from the vector db.**


```python
result = agent_executor.invoke(
    {
        "input": "What are the primary functions of the Federal Financial Institutions Examination Council (FFIEC)?",
        "preamble": preamble,
    }
)
```


```python
result["output"]
```

**Let's ask a question that requires Market Cap.**


```python
result = agent_executor.invoke(
    {
        "input": "What is Apple capitalization compared to Microsoft? Calculate the difference",
         "preamble": preamble,
    }
)
```


```python
result["output"]
```

**Let's ask a question that requires Internet Search.**


```python
result = agent_executor.invoke(
    {
        "input": "Hi there!",
         "preamble": preamble,
    }
)
```


```python
result["output"]
```

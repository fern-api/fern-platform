# Question Answering using LangChain and Cohere's Generate and Embedding Models from SageMaker JumpStart


This notebook was contributed by James Yi – Sr. Partner Solutions Architect - AI/ML, Amazon Web Services

---

This notebook's CI test result for us-west-2 is as follows. CI test results in other regions can be found at the end of the notebook.

![This us-west-2 badge failed to load. Check your device's internet connectivity, otherwise the service is currently unavailable](https://h75twx4l60.execute-api.us-west-2.amazonaws.com/sagemaker-nb/us-west-2/introduction_to_amazon_algorithms|jumpstart-foundation-models|question_answering_retrieval_augmented_generation|question_answering_Cohere+langchain_jumpstart.ipynb)

---

In this notebook we will demonstrate how to use Cohere Generate model to answer questions using a library of documents as a reference, by using Cohere embedding model for document embeddings and retrieval.  

The Cohere Platform empowers enterprises and developers to use Large Language Models (LLMs) privately and securely with AWS JumpStart deployment. We have announced the availability of Cohere’s LLMs through Amazon SageMaker in Jan 2023. Customers can easily subscribe [Cohere’s LLMs through AWS Marketplace](https://aws.amazon.com/marketplace/seller-profile?id=87af0c85-6cf9-4ed8-bee0-b40ce65167e0) and use them in Amazon SageMaker.

[Command](https://aws.amazon.com/marketplace/pp/prodview-n44fbeuycwldi?sr=0-3&ref_=beagle&applicationId=AWSMPContessa) is Cohere’s text generation model. It is trained to follow user commands and to be instantly useful in practical business applications. Command ranks at the top of the Holistic Evaluation of Language Models (HELM) benchmark, an evaluation leaderboard comparing large language models on a wide number of tasks. [Cohere Multilingual Embedding Model](https://aws.amazon.com/marketplace/pp/prodview-z6huxszcqc25i) allows you to classify, embed, and tokenize text in multiple languages. 

In this notebook, we will use [Cohere Generate Model - Command-Light](https://aws.amazon.com/marketplace/pp/prodview-6dmzzso5vu5my?sr=0-1&ref_=beagle&applicationId=AWSMPContessa) for text generation and [Cohere Multilingual Embedding Model](https://aws.amazon.com/marketplace/pp/prodview-z6huxszcqc25i) for text embedding. You can follow the [Cohere model deployment jupyterbooks in this github](https://github.com/cohere-ai/cohere-sagemaker/tree/main/notebooks) for each model deployment.



## Pre-requisites:

1. Ensure that IAM role used has **AmazonSageMakerFullAccess**
1. To deploy this ML model successfully, ensure that:
    1. Either your IAM role has these three permissions and you have authority to make AWS Marketplace subscriptions in the AWS account used: 
        1. **aws-marketplace:ViewSubscriptions**
        1. **aws-marketplace:Unsubscribe**
        1. **aws-marketplace:Subscribe**  
    2. or your AWS account has subscriptions to [Cohere Generate Model - Command-Light](https://aws.amazon.com/marketplace/pp/prodview-6dmzzso5vu5my?sr=0-1&ref_=beagle&applicationId=AWSMPContessa) and [Cohere Multilingual Embedding Model](https://aws.amazon.com/marketplace/ai/procurement?productId=b50f0eee-4595-48b3-8507-253f3c8ca728).

## Step 1. Subscribe to the model packages and deploy Cohere Generate model and Embedding model in SageMaker JumpStart

To subscribe to the model packages:

1. Open the model package listing pages [Cohere Generate Model - Command-Light](https://aws.amazon.com/marketplace/pp/prodview-6dmzzso5vu5my) and [Cohere Multilingual Embedding Model](https://aws.amazon.com/marketplace/ai/procurement?productId=b50f0eee-4595-48b3-8507-253f3c8ca728).
1. On the AWS Marketplace listing, click on the **Continue to subscribe** button.
1. On the **Subscribe to this software** page, review and click on **"Accept Offer"** if you and your organization agrees with EULA, pricing, and support terms.
1. Once you click on **Continue to configuration** button and then choose a **region**, you will see a **Product Arn** displayed. This is the model package ARN that you need to specify while creating a deployable model using Boto3. Copy the ARN corresponding to your region and specify the same in the following cell.



```python
!pip install --upgrade sagemaker --quiet
!pip install --upgrade cohere-sagemaker
!pip install ipywidgets==7.0.0 --quiet
!pip install langchain==0.0.148 --quiet
!pip install faiss-cpu --quiet
```


```python
import time
import sagemaker, boto3, json
from cohere_sagemaker import Client
from sagemaker.session import Session
from sagemaker.model import Model
from sagemaker import image_uris, model_uris, script_uris, hyperparameters
from sagemaker.predictor import Predictor
from sagemaker.utils import name_from_base
from typing import Any, Dict, List, Optional
from langchain.embeddings import SagemakerEndpointEmbeddings
from langchain.llms.sagemaker_endpoint import ContentHandlerBase

sagemaker_session = Session()
aws_role = sagemaker_session.get_caller_identity_arn()
aws_region = boto3.Session().region_name
sess = sagemaker.Session()
model_version = "*"
```

### Deploy Cohere Generate Model


```python
cohere_generate_package = "cohere-gpt-medium-v1-8-081bb643f4ae3394a249d913abc6085c"

# Mapping for Model Packages
generate_model_package_map = {
    "us-east-1": f"arn:aws:sagemaker:us-east-1:865070037744:model-package/{cohere_generate_package}",
    "us-east-2": f"arn:aws:sagemaker:us-east-2:057799348421:model-package/{cohere_generate_package}",
    "us-west-1": f"arn:aws:sagemaker:us-west-1:382657785993:model-package/{cohere_generate_package}",
    "us-west-2": f"arn:aws:sagemaker:us-west-2:594846645681:model-package/{cohere_generate_package}",
    "ca-central-1": f"arn:aws:sagemaker:ca-central-1:470592106596:model-package/{cohere_generate_package}",
    "eu-central-1": f"arn:aws:sagemaker:eu-central-1:446921602837:model-package/{cohere_generate_package}",
    "eu-west-1": f"arn:aws:sagemaker:eu-west-1:985815980388:model-package/{cohere_generate_package}",
    "eu-west-2": f"arn:aws:sagemaker:eu-west-2:856760150666:model-package/{cohere_generate_package}",
    "eu-west-3": f"arn:aws:sagemaker:eu-west-3:843114510376:model-package/{cohere_generate_package}",
    "eu-north-1": f"arn:aws:sagemaker:eu-north-1:136758871317:model-package/{cohere_generate_package}",
    "ap-southeast-1": f"arn:aws:sagemaker:ap-southeast-1:192199979996:model-package/{cohere_generate_package}",
    "ap-southeast-2": f"arn:aws:sagemaker:ap-southeast-2:666831318237:model-package/{cohere_generate_package}",
    "ap-northeast-2": f"arn:aws:sagemaker:ap-northeast-2:745090734665:model-package/{cohere_generate_package}",
    "ap-northeast-1": f"arn:aws:sagemaker:ap-northeast-1:977537786026:model-package/{cohere_generate_package}",
    "ap-south-1": f"arn:aws:sagemaker:ap-south-1:077584701553:model-package/{cohere_generate_package}",
    "sa-east-1": f"arn:aws:sagemaker:sa-east-1:270155090741:model-package/{cohere_generate_package}",
}

region = boto3.Session().region_name
if region not in generate_model_package_map.keys():
    raise Exception(f"Current boto3 session region {region} is not supported.")

generate_model_package_arn = generate_model_package_map[region]
```


```python
from cohere_sagemaker import Client

Cohere_Generate_Endpoint_Name = "jumpstart-example-raglc-cohere-command-light-01"

co_generate = Client(region_name=region)
co_generate.create_endpoint(
    arn=generate_model_package_arn,
    endpoint_name=Cohere_Generate_Endpoint_Name,
    instance_type="ml.g5.xlarge",
    n_instances=1,
)

# If the endpoint is already created, you just need to connect to it
# co_generate.connect_to_endpoint(endpoint_name=Cohere_Generate_Endpoint_Name)
```

### Deploy Cohere Embedding Model


```python
cohere_embedding_package = "cohere-multilingual-small-v1-1-e0210aae7f8135adaec4b199df604c4c"

# Mapping for Model Packages
embedding_model_package_map = {
    "us-east-1": f"arn:aws:sagemaker:us-east-1:865070037744:model-package/{cohere_embedding_package}",
    "us-east-2": f"arn:aws:sagemaker:us-east-2:057799348421:model-package/{cohere_embedding_package}",
    "us-west-1": f"arn:aws:sagemaker:us-west-1:382657785993:model-package/{cohere_embedding_package}",
    "us-west-2": f"arn:aws:sagemaker:us-west-2:594846645681:model-package/{cohere_embedding_package}",
    "ca-central-1": f"arn:aws:sagemaker:ca-central-1:470592106596:model-package/{cohere_embedding_package}",
    "eu-central-1": f"arn:aws:sagemaker:eu-central-1:446921602837:model-package/{cohere_embedding_package}",
    "eu-west-1": f"arn:aws:sagemaker:eu-west-1:985815980388:model-package/{cohere_embedding_package}",
    "eu-west-2": f"arn:aws:sagemaker:eu-west-2:856760150666:model-package/{cohere_embedding_package}",
    "eu-west-3": f"arn:aws:sagemaker:eu-west-3:843114510376:model-package/{cohere_embedding_package}",
    "eu-north-1": f"arn:aws:sagemaker:eu-north-1:136758871317:model-package/{cohere_embedding_package}",
    "ap-southeast-1": f"arn:aws:sagemaker:ap-southeast-1:192199979996:model-package/{cohere_embedding_package}",
    "ap-southeast-2": f"arn:aws:sagemaker:ap-southeast-2:666831318237:model-package/{cohere_embedding_package}",
    "ap-northeast-2": f"arn:aws:sagemaker:ap-northeast-2:745090734665:model-package/{cohere_embedding_package}",
    "ap-northeast-1": f"arn:aws:sagemaker:ap-northeast-1:977537786026:model-package/{cohere_embedding_package}",
    "ap-south-1": f"arn:aws:sagemaker:ap-south-1:077584701553:model-package/{cohere_embedding_package}",
    "sa-east-1": f"arn:aws:sagemaker:sa-east-1:270155090741:model-package/{cohere_embedding_package}",
}

# region = boto3.Session().region_name
if region not in embedding_model_package_map.keys():
    raise Exception(f"Current boto3 session region {region} is not supported.")

embedding_model_package_arn = embedding_model_package_map[region]
```


```python
Cohere_Embedding_Endpoint_Name = "jumpstart-example-raglc-cohere-embedding-01"

co_embedding = Client(region_name=region)
co_embedding.create_endpoint(
    arn=embedding_model_package_arn,
    endpoint_name=Cohere_Embedding_Endpoint_Name,
    instance_type="ml.g5.xlarge",
    n_instances=1,
)

# If the endpoint is already created, you just need to connect to it
# co_embedding.connect_to_endpoint(endpoint_name=Cohere_Embedding_Endpoint_Name)
```

## Step 2. Ask a question to LLM without providing the context

To better illustrate why we need retrieval-augmented generation (RAG) based approach to solve the question and anwering problem. Let's directly ask the model a question and see how they respond.


```python
def query_endpoint_with_json_payload(encoded_json, endpoint_name, content_type="application/json"):
    client = boto3.client("runtime.sagemaker")
    response = client.invoke_endpoint(
        EndpointName=endpoint_name, ContentType=content_type, Body=encoded_json
    )
    return response


def parse_response_model_cohere_generate(query_response):
    model_predictions = json.loads(query_response["Body"].read())
    generated_text = model_predictions["generations"][0]["text"]
    return generated_text
```


```python
question = "Which instances can I use with Managed Spot Training in SageMaker?"
```


```python
payload = {
    "prompt": question,
    "max_tokens": 100,
    "k": 50,
    "p": 0.95,
    "stop_sequences": None,
    "return_likelihoods": None,
    "truncate": None,
}

query_response = query_endpoint_with_json_payload(
    json.dumps(payload).encode("utf-8"), endpoint_name=Cohere_Generate_Endpoint_Name
)
generated_texts = parse_response_model_cohere_generate(query_response)
print(
    f"For Cohere Generate Light Model, the generated output without context is: {generated_texts}\n"
)
```

You can see the generated answer is wrong or doesn't make much sense. 

## Step 3. Improve the answer to the same question using **prompt engineering** with insightful context


To better answer the question well, we provide extra contextual information, combine it with a prompt, and send it to model together with the question. Below is an example.


```python
context = """Managed Spot Training can be used with all instances supported in Amazon SageMaker. Managed Spot Training is supported in all AWS Regions where Amazon SageMaker is currently available."""
prompt = """Answer based on context:\n\n%s\n\nquestion: %s""" % (context, question)
```


```python
payload = {
    "prompt": prompt,
    "max_tokens": 100,
    "k": 50,
    "p": 0.95,
    "stop_sequences": None,
    "return_likelihoods": None,
    "truncate": None,
}

query_response = query_endpoint_with_json_payload(
    json.dumps(payload).encode("utf-8"), endpoint_name=Cohere_Generate_Endpoint_Name
)
generated_texts = parse_response_model_cohere_generate(query_response)
print(f"For Cohere Generate Light Model, the generated output with context is: {generated_texts}\n")
```

The output from step 3 tells us the chance to get the correct response significantly correlates with the insightful context you send into the LLM. 

**<span style="color:red">Now, the question becomes where can I find the insightful context based on the user query? The answer is to use a pre-stored knowledge data base with retrieval augmented generation, as shown in step 4 below</span>.**

## Step 4. Use RAG based approach with [LangChain](https://python.langchain.com/en/latest/index.html) and SageMaker endpoints to build a simplified question and answering application.


We plan to use document embeddings to fetch the most relevant documents in our document knowledge library and combine them with the prompt that we provide to LLM.

To achieve that, we will do following.

1. **Generate embedings for each of document in the knowledge library with Cohere Multilingual embedding model.**
2. **Identify top K most relevant documents based on user query.**
    - 2.1 **For a query of your interest, generate the embedding of the query using the same embedding model.**
    - 2.2 **Search the indexes of top K most relevant documents in the embedding space using in-memory Faiss search.**
    - 2.3 **Use the indexes to retrieve the corresponded documents.**
3. **Combine the retrieved documents with prompt and question and send them into SageMaker LLM.**



Note: The retrieved document/text should be large enough to contain enough information to answer a question; but small enough to fit into the LLM prompt. 

---
To build a simiplied QA application with LangChain, we need: 
1. Wrap up our SageMaker endpoints for embedding model and LLM into `langchain.embeddings.SagemakerEndpointEmbeddings` and `langchain.llms.sagemaker_endpoint.SagemakerEndpoint`. That requires a small overwritten of `SagemakerEndpointEmbeddings` class to make it compatible with SageMaker embedding mdoel.
2. Prepare the dataset to build the knowledge data base. 

---

Wrap up our SageMaker endpoints for embedding model into `langchain.embeddings.SagemakerEndpointEmbeddings`. That requires a small overwritten of `SagemakerEndpointEmbeddings` class to make it compatible with SageMaker embedding mdoel.


```python
from langchain.embeddings.sagemaker_endpoint import EmbeddingsContentHandler


class SagemakerEndpointCohereEmbeddingsJumpStart(SagemakerEndpointEmbeddings):
    def embed_documents(self, texts: List[str], chunk_size: int = 5) -> List[List[float]]:
        """Compute doc embeddings using a SageMaker Inference Endpoint.

        Args:
            texts: The list of texts to embed.
            chunk_size: The chunk size defines how many input texts will
                be grouped together as request. If None, will use the
                chunk size specified by the class.

        Returns:
            List of embeddings, one for each text.
        """
        results = []
        _chunk_size = len(texts) if chunk_size > len(texts) else chunk_size

        for i in range(0, len(texts), _chunk_size):
            response = self._embedding_func(texts[i : i + _chunk_size])
            print
            results.extend(response)
        return results


class ContentHandler(EmbeddingsContentHandler):
    content_type = "application/json"
    accepts = "application/json"

    def transform_input(self, prompt: str, model_kwargs={}) -> bytes:
        input_str = json.dumps({"texts": prompt, **model_kwargs})
        return input_str.encode("utf-8")

    def transform_output(self, output: bytes) -> str:
        response_json = json.loads(output.read().decode("utf-8"))
        embeddings = response_json["embeddings"]
        return embeddings


content_handler = ContentHandler()

embeddings = SagemakerEndpointCohereEmbeddingsJumpStart(
    endpoint_name=Cohere_Embedding_Endpoint_Name,
    region_name=aws_region,
    content_handler=content_handler,
)
```

Next, we wrap up our SageMaker endpoints for LLM into `langchain.llms.sagemaker_endpoint.SagemakerEndpoint`. 


```python
from langchain.llms.sagemaker_endpoint import LLMContentHandler, SagemakerEndpoint

parameters = {
    "max_tokens": 200,
    "k": 250,
    "p": 0.95,
    "temperature": 1,
    "stop_sequences": None,
    "return_likelihoods": None,
    "truncate": None,
}


class ContentHandler(LLMContentHandler):
    content_type = "application/json"
    accepts = "application/json"

    def transform_input(self, prompt: str, model_kwargs={}) -> bytes:
        input_str = json.dumps({"prompt": prompt, **model_kwargs})
        return input_str.encode("utf-8")

    def transform_output(self, output: bytes) -> str:
        response_json = json.loads(output.read().decode("utf-8"))
        return response_json["generations"][0]["text"]


content_handler = ContentHandler()

sm_llm = SagemakerEndpoint(
    endpoint_name=Cohere_Generate_Endpoint_Name,
    region_name=aws_region,
    model_kwargs=parameters,
    content_handler=content_handler,
)
```

Now, let's download the example data and prepare it for demonstration. We will use [Amazon SageMaker FAQs](https://aws.amazon.com/sagemaker/faqs/) as knowledge library. The data are formatted in a CSV file with two columns Question and Answer. We use the Answer column as the documents of knowledge library, from which relevant documents are retrieved based on a query. 

**For your purpose, you can replace the example dataset of your own to build a custom question and answering application.**


```python
original_data = "s3://jumpstart-cache-prod-us-east-2/training-datasets/Amazon_SageMaker_FAQs/"

!mkdir -p rag_data
!aws s3 cp --recursive $original_data rag_data
```

For the case when you have data saved in multiple subsets. The following code will read all files that end with `.csv` and concatenate them together. Please ensure each `csv` file has the same format.


```python
import glob
import os
import pandas as pd

all_files = glob.glob(os.path.join("rag_data/", "*.csv"))

df_knowledge = pd.concat(
    (pd.read_csv(f, header=None, names=["Question", "Answer"]) for f in all_files),
    axis=0,
    ignore_index=True,
)
```

Drop the `Question` column as it is not used in this demonstration.


```python
df_knowledge.drop(["Question"], axis=1, inplace=True)
```


```python
df_knowledge.head(5)
```


```python
df_knowledge.to_csv("rag_data/processed_data.csv", header=False, index=False)
```


```python
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI
from langchain.document_loaders import TextLoader
from langchain.indexes import VectorstoreIndexCreator
from langchain.vectorstores import Chroma, AtlasDB, FAISS
from langchain.text_splitter import CharacterTextSplitter
from langchain import PromptTemplate
from langchain.chains.question_answering import load_qa_chain
from langchain.document_loaders.csv_loader import CSVLoader
```

Use langchain to read the `csv` data. There are multiple built-in functions in LangChain to read different format of files such as `txt`, `html`, and `pdf`. For details, see [LangChain document loaders](https://python.langchain.com/en/latest/modules/indexes/document_loaders.html).


```python
loader = CSVLoader(file_path="rag_data/processed_data.csv")
```


```python
documents = loader.load()
# text_splitter = CharacterTextSplitter(chunk_size=300, chunk_overlap=0)
# texts = text_splitter.split_documents(documents) ### if you use langchain.document_loaders.TextLoader to load text file. You can uncomment the code
## to split the text.
```

**Now, we can build an QA application. <span style="color:red">LangChain makes it extremly simple with following few lines of code</span>.**

Based on the question below, we can achieven the points in Step 4 with just a few lines of code as shown below.


```python
question
```


```python
index_creator = VectorstoreIndexCreator(
    vectorstore_cls=FAISS,
    embedding=embeddings,
    text_splitter=CharacterTextSplitter(chunk_size=300, chunk_overlap=0),
)
```


```python
index = index_creator.from_loaders([loader])
```


```python
index.query(question=question, llm=sm_llm)
```

## Step 5. Customize the QA application above with different prompt.

Now, we see how simple it is to use LangChain to achieve question and answering application with just few lines of code. Let's break down the above `VectorstoreIndexCreator` and see what's happening under the hood. Furthermore, we will see how to incorporate a customize prompt rather than using a default prompt with `VectorstoreIndexCreator`.

Firstly, we **generate embedings for each of document in the knowledge library with SageMaker GPT-J-6B embedding model.**


```python
docsearch = FAISS.from_documents(documents, embeddings)
```


```python
question
```

Based on the question above, we then **identify top K most relevant documents based on user query, where K = 3 in this setup**.


```python
docs = docsearch.similarity_search(question, k=3)
```

Print out the top 3 most relevant docuemnts as below.


```python
docs
```

Finally, we **combine the retrieved documents with prompt and question and send them into SageMaker LLM.** 

We define a customized prompt as below.


```python
prompt_template = """Answer based on context:\n\n{context}\n\n{question}"""

PROMPT = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
```


```python
chain = load_qa_chain(llm=sm_llm, prompt=PROMPT)
```

Send the top 3 most relevant docuemnts and question into LLM to get a answer.


```python
result = chain({"input_documents": docs, "question": question}, return_only_outputs=True)[
    "output_text"
]
```

Print the final answer from LLM as below, which is accurate.


```python
result
```

## Notebook CI Test Results

This notebook was tested in multiple regions. The test results are as follows, except for us-west-2 which is shown at the top of the notebook.


![This us-east-1 badge failed to load. Check your device's internet connectivity, otherwise the service is currently unavailable](https://h75twx4l60.execute-api.us-west-2.amazonaws.com/sagemaker-nb/us-east-1/introduction_to_amazon_algorithms|jumpstart-foundation-models|question_answering_retrieval_augmented_generation|question_answering_Cohere+langchain_jumpstart.ipynb)

![This us-east-2 badge failed to load. Check your device's internet connectivity, otherwise the service is currently unavailable](https://h75twx4l60.execute-api.us-west-2.amazonaws.com/sagemaker-nb/us-east-2/introduction_to_amazon_algorithms|jumpstart-foundation-models|question_answering_retrieval_augmented_generation|question_answering_Cohere+langchain_jumpstart.ipynb)

![This us-west-1 badge failed to load. Check your device's internet connectivity, otherwise the service is currently unavailable](https://h75twx4l60.execute-api.us-west-2.amazonaws.com/sagemaker-nb/us-west-1/introduction_to_amazon_algorithms|jumpstart-foundation-models|question_answering_retrieval_augmented_generation|question_answering_Cohere+langchain_jumpstart.ipynb)

![This ca-central-1 badge failed to load. Check your device's internet connectivity, otherwise the service is currently unavailable](https://h75twx4l60.execute-api.us-west-2.amazonaws.com/sagemaker-nb/ca-central-1/introduction_to_amazon_algorithms|jumpstart-foundation-models|question_answering_retrieval_augmented_generation|question_answering_Cohere+langchain_jumpstart.ipynb)

![This sa-east-1 badge failed to load. Check your device's internet connectivity, otherwise the service is currently unavailable](https://h75twx4l60.execute-api.us-west-2.amazonaws.com/sagemaker-nb/sa-east-1/introduction_to_amazon_algorithms|jumpstart-foundation-models|question_answering_retrieval_augmented_generation|question_answering_Cohere+langchain_jumpstart.ipynb)

![This eu-west-1 badge failed to load. Check your device's internet connectivity, otherwise the service is currently unavailable](https://h75twx4l60.execute-api.us-west-2.amazonaws.com/sagemaker-nb/eu-west-1/introduction_to_amazon_algorithms|jumpstart-foundation-models|question_answering_retrieval_augmented_generation|question_answering_Cohere+langchain_jumpstart.ipynb)

![This eu-west-2 badge failed to load. Check your device's internet connectivity, otherwise the service is currently unavailable](https://h75twx4l60.execute-api.us-west-2.amazonaws.com/sagemaker-nb/eu-west-2/introduction_to_amazon_algorithms|jumpstart-foundation-models|question_answering_retrieval_augmented_generation|question_answering_Cohere+langchain_jumpstart.ipynb)

![This eu-west-3 badge failed to load. Check your device's internet connectivity, otherwise the service is currently unavailable](https://h75twx4l60.execute-api.us-west-2.amazonaws.com/sagemaker-nb/eu-west-3/introduction_to_amazon_algorithms|jumpstart-foundation-models|question_answering_retrieval_augmented_generation|question_answering_Cohere+langchain_jumpstart.ipynb)

![This eu-central-1 badge failed to load. Check your device's internet connectivity, otherwise the service is currently unavailable](https://h75twx4l60.execute-api.us-west-2.amazonaws.com/sagemaker-nb/eu-central-1/introduction_to_amazon_algorithms|jumpstart-foundation-models|question_answering_retrieval_augmented_generation|question_answering_Cohere+langchain_jumpstart.ipynb)

![This eu-north-1 badge failed to load. Check your device's internet connectivity, otherwise the service is currently unavailable](https://h75twx4l60.execute-api.us-west-2.amazonaws.com/sagemaker-nb/eu-north-1/introduction_to_amazon_algorithms|jumpstart-foundation-models|question_answering_retrieval_augmented_generation|question_answering_Cohere+langchain_jumpstart.ipynb)

![This ap-southeast-1 badge failed to load. Check your device's internet connectivity, otherwise the service is currently unavailable](https://h75twx4l60.execute-api.us-west-2.amazonaws.com/sagemaker-nb/ap-southeast-1/introduction_to_amazon_algorithms|jumpstart-foundation-models|question_answering_retrieval_augmented_generation|question_answering_Cohere+langchain_jumpstart.ipynb)

![This ap-southeast-2 badge failed to load. Check your device's internet connectivity, otherwise the service is currently unavailable](https://h75twx4l60.execute-api.us-west-2.amazonaws.com/sagemaker-nb/ap-southeast-2/introduction_to_amazon_algorithms|jumpstart-foundation-models|question_answering_retrieval_augmented_generation|question_answering_Cohere+langchain_jumpstart.ipynb)

![This ap-northeast-1 badge failed to load. Check your device's internet connectivity, otherwise the service is currently unavailable](https://h75twx4l60.execute-api.us-west-2.amazonaws.com/sagemaker-nb/ap-northeast-1/introduction_to_amazon_algorithms|jumpstart-foundation-models|question_answering_retrieval_augmented_generation|question_answering_Cohere+langchain_jumpstart.ipynb)

![This ap-northeast-2 badge failed to load. Check your device's internet connectivity, otherwise the service is currently unavailable](https://h75twx4l60.execute-api.us-west-2.amazonaws.com/sagemaker-nb/ap-northeast-2/introduction_to_amazon_algorithms|jumpstart-foundation-models|question_answering_retrieval_augmented_generation|question_answering_Cohere+langchain_jumpstart.ipynb)

![This ap-south-1 badge failed to load. Check your device's internet connectivity, otherwise the service is currently unavailable](https://h75twx4l60.execute-api.us-west-2.amazonaws.com/sagemaker-nb/ap-south-1/introduction_to_amazon_algorithms|jumpstart-foundation-models|question_answering_retrieval_augmented_generation|question_answering_Cohere+langchain_jumpstart.ipynb)




<a target="_blank" href="https://colab.research.google.com/github/cohere-ai/notebooks/blob/main/notebooks/llmu/Validating_Large_Language_Model_Outputs.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

# Validating Large Language Model Outputs

One key property of LLMs that’s different from traditional software is that the output is probabilistic in nature. The same input (i.e., the prompt) may not always produce the same response. While this property makes it possible to build entirely new classes of natural language applications, it also means that those applications require a mechanism for validating their outputs.

An output validation step ensures that an LLM application is robust and predictable. In this article, we looked at what output validation is and how to implement it using [Guardrails AI](https://www.guardrailsai.com/).

Read the accompanying [article here](https://docs.cohere.com/docs/validating-outputs).


## 1: Setup


```python
! pip install cohere git+https://github.com/guardrails-ai/guardrails.git@main
```

    Collecting git+https://github.com/guardrails-ai/guardrails.git@main
      Cloning https://github.com/guardrails-ai/guardrails.git (to revision main) to /tmp/pip-req-build-vcruxxjc
      Running command git clone --filter=blob:none --quiet https://github.com/guardrails-ai/guardrails.git /tmp/pip-req-build-vcruxxjc
      Resolved https://github.com/guardrails-ai/guardrails.git to commit 6de5641b8f269164cd57cd95f32dacb9e7d83537
      Installing build dependencies ... [?25l[?25hdone
      Getting requirements to build wheel ... [?25l[?25hdone
      Preparing metadata (pyproject.toml) ... [?25l[?25hdone
    Requirement already satisfied: cohere in /usr/local/lib/python3.10/dist-packages (5.2.6)
    Requirement already satisfied: fastavro<2.0.0,>=1.9.4 in /usr/local/lib/python3.10/dist-packages (from cohere) (1.9.4)
    Requirement already satisfied: httpx>=0.21.2 in /usr/local/lib/python3.10/dist-packages (from cohere) (0.27.0)
    Requirement already satisfied: pydantic>=1.9.2 in /usr/local/lib/python3.10/dist-packages (from cohere) (2.6.4)
    Requirement already satisfied: requests<3.0.0,>=2.0.0 in /usr/local/lib/python3.10/dist-packages (from cohere) (2.31.0)
    Requirement already satisfied: tokenizers<0.16.0,>=0.15.2 in /usr/local/lib/python3.10/dist-packages (from cohere) (0.15.2)
    Requirement already satisfied: types-requests<3.0.0,>=2.0.0 in /usr/local/lib/python3.10/dist-packages (from cohere) (2.31.0.20240406)
    Requirement already satisfied: typing_extensions>=4.0.0 in /usr/local/lib/python3.10/dist-packages (from cohere) (4.11.0)
    Requirement already satisfied: coloredlogs<16.0.0,>=15.0.1 in /usr/local/lib/python3.10/dist-packages (from guardrails-ai==0.4.3) (15.0.1)
    Requirement already satisfied: griffe<0.37.0,>=0.36.9 in /usr/local/lib/python3.10/dist-packages (from guardrails-ai==0.4.3) (0.36.9)
    Requirement already satisfied: guardrails-api-client<0.2.0,>=0.1.1 in /usr/local/lib/python3.10/dist-packages (from guardrails-ai==0.4.3) (0.1.1)
    Requirement already satisfied: jwt<2.0.0,>=1.3.1 in /usr/local/lib/python3.10/dist-packages (from guardrails-ai==0.4.3) (1.3.1)
    Requirement already satisfied: langchain-core<0.2.0,>=0.1.18 in /usr/local/lib/python3.10/dist-packages (from guardrails-ai==0.4.3) (0.1.42)
    Requirement already satisfied: lxml<5.0.0,>=4.9.3 in /usr/local/lib/python3.10/dist-packages (from guardrails-ai==0.4.3) (4.9.4)
    Requirement already satisfied: openai<2 in /usr/local/lib/python3.10/dist-packages (from guardrails-ai==0.4.3) (1.17.1)
    Requirement already satisfied: opentelemetry-exporter-otlp-proto-grpc==1.20.0 in /usr/local/lib/python3.10/dist-packages (from guardrails-ai==0.4.3) (1.20.0)
    Requirement already satisfied: opentelemetry-exporter-otlp-proto-http==1.20.0 in /usr/local/lib/python3.10/dist-packages (from guardrails-ai==0.4.3) (1.20.0)
    Requirement already satisfied: opentelemetry-sdk==1.20.0 in /usr/local/lib/python3.10/dist-packages (from guardrails-ai==0.4.3) (1.20.0)
    Requirement already satisfied: pydash<8.0.0,>=7.0.6 in /usr/local/lib/python3.10/dist-packages (from guardrails-ai==0.4.3) (7.0.7)
    Requirement already satisfied: python-dateutil<3.0.0,>=2.8.2 in /usr/local/lib/python3.10/dist-packages (from guardrails-ai==0.4.3) (2.8.2)
    Requirement already satisfied: regex<2024.0.0,>=2023.10.3 in /usr/local/lib/python3.10/dist-packages (from guardrails-ai==0.4.3) (2023.12.25)
    Requirement already satisfied: rich<14.0.0,>=13.6.0 in /usr/local/lib/python3.10/dist-packages (from guardrails-ai==0.4.3) (13.7.1)
    Requirement already satisfied: rstr<4.0.0,>=3.2.2 in /usr/local/lib/python3.10/dist-packages (from guardrails-ai==0.4.3) (3.2.2)
    Requirement already satisfied: tenacity>=8.1.0 in /usr/local/lib/python3.10/dist-packages (from guardrails-ai==0.4.3) (8.2.3)
    Requirement already satisfied: tiktoken<0.6.0,>=0.5.1 in /usr/local/lib/python3.10/dist-packages (from guardrails-ai==0.4.3) (0.5.2)
    Requirement already satisfied: typer[all]<0.10.0,>=0.9.0 in /usr/local/lib/python3.10/dist-packages (from guardrails-ai==0.4.3) (0.9.4)
    Requirement already satisfied: backoff<3.0.0,>=1.10.0 in /usr/local/lib/python3.10/dist-packages (from opentelemetry-exporter-otlp-proto-grpc==1.20.0->guardrails-ai==0.4.3) (2.2.1)
    Requirement already satisfied: deprecated>=1.2.6 in /usr/local/lib/python3.10/dist-packages (from opentelemetry-exporter-otlp-proto-grpc==1.20.0->guardrails-ai==0.4.3) (1.2.14)
    Requirement already satisfied: googleapis-common-protos~=1.52 in /usr/local/lib/python3.10/dist-packages (from opentelemetry-exporter-otlp-proto-grpc==1.20.0->guardrails-ai==0.4.3) (1.63.0)
    Requirement already satisfied: grpcio<2.0.0,>=1.0.0 in /usr/local/lib/python3.10/dist-packages (from opentelemetry-exporter-otlp-proto-grpc==1.20.0->guardrails-ai==0.4.3) (1.62.1)
    Requirement already satisfied: opentelemetry-api~=1.15 in /usr/local/lib/python3.10/dist-packages (from opentelemetry-exporter-otlp-proto-grpc==1.20.0->guardrails-ai==0.4.3) (1.20.0)
    Requirement already satisfied: opentelemetry-exporter-otlp-proto-common==1.20.0 in /usr/local/lib/python3.10/dist-packages (from opentelemetry-exporter-otlp-proto-grpc==1.20.0->guardrails-ai==0.4.3) (1.20.0)
    Requirement already satisfied: opentelemetry-proto==1.20.0 in /usr/local/lib/python3.10/dist-packages (from opentelemetry-exporter-otlp-proto-grpc==1.20.0->guardrails-ai==0.4.3) (1.20.0)
    Requirement already satisfied: opentelemetry-semantic-conventions==0.41b0 in /usr/local/lib/python3.10/dist-packages (from opentelemetry-sdk==1.20.0->guardrails-ai==0.4.3) (0.41b0)
    Requirement already satisfied: importlib-metadata<7.0,>=6.0 in /usr/local/lib/python3.10/dist-packages (from opentelemetry-api~=1.15->opentelemetry-exporter-otlp-proto-grpc==1.20.0->guardrails-ai==0.4.3) (6.11.0)
    Requirement already satisfied: protobuf<5.0,>=3.19 in /usr/local/lib/python3.10/dist-packages (from opentelemetry-proto==1.20.0->opentelemetry-exporter-otlp-proto-grpc==1.20.0->guardrails-ai==0.4.3) (3.20.3)
    Requirement already satisfied: humanfriendly>=9.1 in /usr/local/lib/python3.10/dist-packages (from coloredlogs<16.0.0,>=15.0.1->guardrails-ai==0.4.3) (10.0)
    Requirement already satisfied: colorama>=0.4 in /usr/local/lib/python3.10/dist-packages (from griffe<0.37.0,>=0.36.9->guardrails-ai==0.4.3) (0.4.6)
    Requirement already satisfied: attrs>=21.3.0 in /usr/local/lib/python3.10/dist-packages (from guardrails-api-client<0.2.0,>=0.1.1->guardrails-ai==0.4.3) (23.2.0)
    Requirement already satisfied: anyio in /usr/local/lib/python3.10/dist-packages (from httpx>=0.21.2->cohere) (3.7.1)
    Requirement already satisfied: certifi in /usr/local/lib/python3.10/dist-packages (from httpx>=0.21.2->cohere) (2024.2.2)
    Requirement already satisfied: httpcore==1.* in /usr/local/lib/python3.10/dist-packages (from httpx>=0.21.2->cohere) (1.0.5)
    Requirement already satisfied: idna in /usr/local/lib/python3.10/dist-packages (from httpx>=0.21.2->cohere) (3.6)
    Requirement already satisfied: sniffio in /usr/local/lib/python3.10/dist-packages (from httpx>=0.21.2->cohere) (1.3.1)
    Requirement already satisfied: h11<0.15,>=0.13 in /usr/local/lib/python3.10/dist-packages (from httpcore==1.*->httpx>=0.21.2->cohere) (0.14.0)
    Requirement already satisfied: cryptography!=3.4.0,>=3.1 in /usr/local/lib/python3.10/dist-packages (from jwt<2.0.0,>=1.3.1->guardrails-ai==0.4.3) (42.0.5)
    Requirement already satisfied: PyYAML>=5.3 in /usr/local/lib/python3.10/dist-packages (from langchain-core<0.2.0,>=0.1.18->guardrails-ai==0.4.3) (6.0.1)
    Requirement already satisfied: jsonpatch<2.0,>=1.33 in /usr/local/lib/python3.10/dist-packages (from langchain-core<0.2.0,>=0.1.18->guardrails-ai==0.4.3) (1.33)
    Requirement already satisfied: langsmith<0.2.0,>=0.1.0 in /usr/local/lib/python3.10/dist-packages (from langchain-core<0.2.0,>=0.1.18->guardrails-ai==0.4.3) (0.1.47)
    Requirement already satisfied: packaging<24.0,>=23.2 in /usr/local/lib/python3.10/dist-packages (from langchain-core<0.2.0,>=0.1.18->guardrails-ai==0.4.3) (23.2)
    Requirement already satisfied: distro<2,>=1.7.0 in /usr/lib/python3/dist-packages (from openai<2->guardrails-ai==0.4.3) (1.7.0)
    Requirement already satisfied: tqdm>4 in /usr/local/lib/python3.10/dist-packages (from openai<2->guardrails-ai==0.4.3) (4.66.2)
    Requirement already satisfied: annotated-types>=0.4.0 in /usr/local/lib/python3.10/dist-packages (from pydantic>=1.9.2->cohere) (0.6.0)
    Requirement already satisfied: pydantic-core==2.16.3 in /usr/local/lib/python3.10/dist-packages (from pydantic>=1.9.2->cohere) (2.16.3)
    Requirement already satisfied: six>=1.5 in /usr/local/lib/python3.10/dist-packages (from python-dateutil<3.0.0,>=2.8.2->guardrails-ai==0.4.3) (1.16.0)
    Requirement already satisfied: charset-normalizer<4,>=2 in /usr/local/lib/python3.10/dist-packages (from requests<3.0.0,>=2.0.0->cohere) (3.3.2)
    Requirement already satisfied: urllib3<3,>=1.21.1 in /usr/local/lib/python3.10/dist-packages (from requests<3.0.0,>=2.0.0->cohere) (2.0.7)
    Requirement already satisfied: markdown-it-py>=2.2.0 in /usr/local/lib/python3.10/dist-packages (from rich<14.0.0,>=13.6.0->guardrails-ai==0.4.3) (3.0.0)
    Requirement already satisfied: pygments<3.0.0,>=2.13.0 in /usr/local/lib/python3.10/dist-packages (from rich<14.0.0,>=13.6.0->guardrails-ai==0.4.3) (2.16.1)
    Requirement already satisfied: huggingface_hub<1.0,>=0.16.4 in /usr/local/lib/python3.10/dist-packages (from tokenizers<0.16.0,>=0.15.2->cohere) (0.20.3)
    Requirement already satisfied: click<9.0.0,>=7.1.1 in /usr/local/lib/python3.10/dist-packages (from typer[all]<0.10.0,>=0.9.0->guardrails-ai==0.4.3) (8.1.7)
    Requirement already satisfied: shellingham<2.0.0,>=1.3.0 in /usr/local/lib/python3.10/dist-packages (from typer[all]<0.10.0,>=0.9.0->guardrails-ai==0.4.3) (1.5.4)
    Requirement already satisfied: exceptiongroup in /usr/local/lib/python3.10/dist-packages (from anyio->httpx>=0.21.2->cohere) (1.2.0)
    Requirement already satisfied: cffi>=1.12 in /usr/local/lib/python3.10/dist-packages (from cryptography!=3.4.0,>=3.1->jwt<2.0.0,>=1.3.1->guardrails-ai==0.4.3) (1.16.0)
    Requirement already satisfied: wrapt<2,>=1.10 in /usr/local/lib/python3.10/dist-packages (from deprecated>=1.2.6->opentelemetry-exporter-otlp-proto-grpc==1.20.0->guardrails-ai==0.4.3) (1.14.1)
    Requirement already satisfied: filelock in /usr/local/lib/python3.10/dist-packages (from huggingface_hub<1.0,>=0.16.4->tokenizers<0.16.0,>=0.15.2->cohere) (3.13.4)
    Requirement already satisfied: fsspec>=2023.5.0 in /usr/local/lib/python3.10/dist-packages (from huggingface_hub<1.0,>=0.16.4->tokenizers<0.16.0,>=0.15.2->cohere) (2023.6.0)
    Requirement already satisfied: jsonpointer>=1.9 in /usr/local/lib/python3.10/dist-packages (from jsonpatch<2.0,>=1.33->langchain-core<0.2.0,>=0.1.18->guardrails-ai==0.4.3) (2.4)
    Requirement already satisfied: orjson<4.0.0,>=3.9.14 in /usr/local/lib/python3.10/dist-packages (from langsmith<0.2.0,>=0.1.0->langchain-core<0.2.0,>=0.1.18->guardrails-ai==0.4.3) (3.10.0)
    Requirement already satisfied: mdurl~=0.1 in /usr/local/lib/python3.10/dist-packages (from markdown-it-py>=2.2.0->rich<14.0.0,>=13.6.0->guardrails-ai==0.4.3) (0.1.2)
    Requirement already satisfied: pycparser in /usr/local/lib/python3.10/dist-packages (from cffi>=1.12->cryptography!=3.4.0,>=3.1->jwt<2.0.0,>=1.3.1->guardrails-ai==0.4.3) (2.22)
    Requirement already satisfied: zipp>=0.5 in /usr/local/lib/python3.10/dist-packages (from importlib-metadata<7.0,>=6.0->opentelemetry-api~=1.15->opentelemetry-exporter-otlp-proto-grpc==1.20.0->guardrails-ai==0.4.3) (3.18.1)



```python
!guardrails hub install hub://guardrails/valid_range
!guardrails hub install hub://guardrails/valid_choices
```

    [nltk_data] Downloading package punkt to /root/nltk_data...
    [nltk_data]   Unzipping tokenizers/punkt.zip.
    
    Installing hub:[35m/[0m[35m/guardrails/[0m[95mvalid_range...[0m
    
    [2K[32m[  ==][0m Fetching manifest
    [2K[32m[    ][0m Downloading dependencies
    [1A[2K[?25l[32m[    ][0m Running post-install setup
    [1A[2K✅Successfully installed hub:[35m/[0m[35m/guardrails/[0m[95mvalid_range[0m!
    
    [1mImport validator:[0m
    from guardrails.hub import ValidRange
    
    [1mGet more info:[0m
    [4;94mhttps://hub.guardrailsai.com/validator/guardrails/valid_range[0m
    
    
    Installing hub:[35m/[0m[35m/guardrails/[0m[95mvalid_choices...[0m
    
    [2K[32m[=   ][0m Fetching manifest
    [2K[32m[====][0m Downloading dependencies
    [1A[2K[?25l[32m[    ][0m Running post-install setup
    [1A[2K✅Successfully installed hub:[35m/[0m[35m/guardrails/[0m[95mvalid_choices[0m!
    
    [1mImport validator:[0m
    from guardrails.hub import ValidChoices
    
    [1mGet more info:[0m
    [4;94mhttps://hub.guardrailsai.com/validator/guardrails/valid_choices[0m
    



```python
import cohere
import guardrails as gd
from guardrails.hub import ValidRange, ValidChoices
from pydantic import BaseModel, Field
from rich import print
from typing import List

# Create a Cohere client
co = cohere.Client(api_key="COHERE_API_KEY")
```

## 2: Define the Output Schema

Our goal is to extract detailed patient information from a medical record.
As an example, we will use the following medical record:


```python
doctors_notes = """49 y/o Male with chronic macular rash to face & hair, worse in beard, eyebrows & nares.
Itchy, flaky, slightly scaly. Moderate response to OTC steroid cream"""
```

We want our extracted information to contain the following fields:

1. Patient's gender
2. Patient's age
3. A list of symptoms, each with a severity rating and an affected area
4. A list of medications, each with information about the patient's response to the medication

Let's define the Pydantic classes below.


```python
class Symptom(BaseModel):
    symptom: str = Field(..., description="Symptom that a patient is experiencing")
    affected_area: str = Field(
        ...,
        description="What part of the body the symptom is affecting",
        validators=[ValidChoices(["Head", "Face", "Neck", "Chest"], on_fail="reask")]
    )

class CurrentMed(BaseModel):
    medication: str = Field(..., description="Name of the medication the patient is taking")
    response: str = Field(..., description="How the patient is responding to the medication")


class PatientInfo(BaseModel):
    gender: str = Field(..., description="Patient's gender")
    age: int = Field(..., description="Patient's age", validators=[ValidRange(0, 100)])
    symptoms: List[Symptom] = Field(..., description="Symptoms that the patient is experiencing")
    current_meds: List[CurrentMed] = Field(..., description="Medications that the patient is currently taking")

```

## 3: Initialize a Guard Object Based on the Schema


```python
PROMPT = """Given the following doctor's notes about a patient,
please extract a dictionary that contains the patient's information.

${doctors_notes}

${gr.complete_json_suffix_v2}
"""
```


```python
# Initialize a Guard object from the Pydantic model PatientInfo
guard = gd.Guard.from_pydantic(PatientInfo, prompt=PROMPT)
print(guard.base_prompt)
```

    /usr/local/lib/python3.10/dist-packages/guardrails/validators/__init__.py:50: FutureWarning: 
        Importing validators from `guardrails.validators` is deprecated.
        All validators are now available in the Guardrails Hub. Please install
        and import them from the hub instead. All validators will be
        removed from this module in the next major release.
    
        Install with: `guardrails hub install hub://<namespace>/<validator_name>`
        Import as: from guardrails.hub import `ValidatorName`
        
      warn(



<pre style="white-space:pre;overflow-x:auto;line-height:normal;font-family:Menlo,'DejaVu Sans Mono',consolas,'Courier New',monospace">Given the following doctor's notes about a patient,
please extract a dictionary that contains the patient's information.

$<span style="font-weight: bold">{</span>doctors_notes<span style="font-weight: bold">}</span>


Given below is XML that describes the information to extract from this document and the tags to extract it into.

<span style="font-weight: bold">&lt;</span><span style="color: #ff00ff; text-decoration-color: #ff00ff; font-weight: bold">output</span><span style="color: #000000; text-decoration-color: #000000">&gt;</span>
<span style="color: #000000; text-decoration-color: #000000">    &lt;string </span><span style="color: #808000; text-decoration-color: #808000">name</span><span style="color: #000000; text-decoration-color: #000000">=</span><span style="color: #008000; text-decoration-color: #008000">"gender"</span><span style="color: #000000; text-decoration-color: #000000"> </span><span style="color: #808000; text-decoration-color: #808000">description</span><span style="color: #000000; text-decoration-color: #000000">=</span><span style="color: #008000; text-decoration-color: #008000">"Patient's gender"</span><span style="color: #800080; text-decoration-color: #800080">/</span><span style="color: #000000; text-decoration-color: #000000">&gt;</span>
<span style="color: #000000; text-decoration-color: #000000">    &lt;integer </span><span style="color: #808000; text-decoration-color: #808000">name</span><span style="color: #000000; text-decoration-color: #000000">=</span><span style="color: #008000; text-decoration-color: #008000">"age"</span><span style="color: #000000; text-decoration-color: #000000"> </span><span style="color: #808000; text-decoration-color: #808000">description</span><span style="color: #000000; text-decoration-color: #000000">=</span><span style="color: #008000; text-decoration-color: #008000">"Patient's age"</span><span style="color: #000000; text-decoration-color: #000000"> </span><span style="color: #808000; text-decoration-color: #808000">format</span><span style="color: #000000; text-decoration-color: #000000">=</span><span style="color: #008000; text-decoration-color: #008000">"guardrails/valid_range: min=0 max=100"</span><span style="color: #800080; text-decoration-color: #800080">/</span><span style="color: #000000; text-decoration-color: #000000">&gt;</span>
<span style="color: #000000; text-decoration-color: #000000">    &lt;list </span><span style="color: #808000; text-decoration-color: #808000">name</span><span style="color: #000000; text-decoration-color: #000000">=</span><span style="color: #008000; text-decoration-color: #008000">"symptoms"</span><span style="color: #000000; text-decoration-color: #000000"> </span><span style="color: #808000; text-decoration-color: #808000">description</span><span style="color: #000000; text-decoration-color: #000000">=</span><span style="color: #008000; text-decoration-color: #008000">"Symptoms that the patient is experiencing"</span><span style="color: #000000; text-decoration-color: #000000">&gt;</span>
<span style="color: #000000; text-decoration-color: #000000">        &lt;object&gt;</span>
<span style="color: #000000; text-decoration-color: #000000">            &lt;string </span><span style="color: #808000; text-decoration-color: #808000">name</span><span style="color: #000000; text-decoration-color: #000000">=</span><span style="color: #008000; text-decoration-color: #008000">"symptom"</span><span style="color: #000000; text-decoration-color: #000000"> </span><span style="color: #808000; text-decoration-color: #808000">description</span><span style="color: #000000; text-decoration-color: #000000">=</span><span style="color: #008000; text-decoration-color: #008000">"Symptom that a patient is experiencing"</span><span style="color: #800080; text-decoration-color: #800080">/</span><span style="color: #000000; text-decoration-color: #000000">&gt;</span>
<span style="color: #000000; text-decoration-color: #000000">            &lt;string </span><span style="color: #808000; text-decoration-color: #808000">name</span><span style="color: #000000; text-decoration-color: #000000">=</span><span style="color: #008000; text-decoration-color: #008000">"affected_area"</span><span style="color: #000000; text-decoration-color: #000000"> </span><span style="color: #808000; text-decoration-color: #808000">description</span><span style="color: #000000; text-decoration-color: #000000">=</span><span style="color: #008000; text-decoration-color: #008000">"What part of the body the symptom is affecting"</span><span style="color: #000000; text-decoration-color: #000000"> </span>
<span style="color: #808000; text-decoration-color: #808000">format</span><span style="color: #000000; text-decoration-color: #000000">=</span><span style="color: #008000; text-decoration-color: #008000">"guardrails/valid_choices: choices=['Head', 'Face', 'Neck', 'Chest']"</span><span style="color: #800080; text-decoration-color: #800080">/</span><span style="color: #000000; text-decoration-color: #000000">&gt;</span>
<span style="color: #000000; text-decoration-color: #000000">        &lt;</span><span style="color: #800080; text-decoration-color: #800080">/</span><span style="color: #ff00ff; text-decoration-color: #ff00ff">object</span><span style="color: #000000; text-decoration-color: #000000">&gt;</span>
<span style="color: #000000; text-decoration-color: #000000">    &lt;</span><span style="color: #800080; text-decoration-color: #800080">/</span><span style="color: #ff00ff; text-decoration-color: #ff00ff">list</span><span style="color: #000000; text-decoration-color: #000000">&gt;</span>
<span style="color: #000000; text-decoration-color: #000000">    &lt;list </span><span style="color: #808000; text-decoration-color: #808000">name</span><span style="color: #000000; text-decoration-color: #000000">=</span><span style="color: #008000; text-decoration-color: #008000">"current_meds"</span><span style="color: #000000; text-decoration-color: #000000"> </span><span style="color: #808000; text-decoration-color: #808000">description</span><span style="color: #000000; text-decoration-color: #000000">=</span><span style="color: #008000; text-decoration-color: #008000">"Medications that the patient is currently taking"</span><span style="color: #000000; text-decoration-color: #000000">&gt;</span>
<span style="color: #000000; text-decoration-color: #000000">        &lt;object&gt;</span>
<span style="color: #000000; text-decoration-color: #000000">            &lt;string </span><span style="color: #808000; text-decoration-color: #808000">name</span><span style="color: #000000; text-decoration-color: #000000">=</span><span style="color: #008000; text-decoration-color: #008000">"medication"</span><span style="color: #000000; text-decoration-color: #000000"> </span><span style="color: #808000; text-decoration-color: #808000">description</span><span style="color: #000000; text-decoration-color: #000000">=</span><span style="color: #008000; text-decoration-color: #008000">"Name of the medication the patient is taking"</span><span style="color: #800080; text-decoration-color: #800080">/</span><span style="color: #000000; text-decoration-color: #000000">&gt;</span>
<span style="color: #000000; text-decoration-color: #000000">            &lt;string </span><span style="color: #808000; text-decoration-color: #808000">name</span><span style="color: #000000; text-decoration-color: #000000">=</span><span style="color: #008000; text-decoration-color: #008000">"response"</span><span style="color: #000000; text-decoration-color: #000000"> </span><span style="color: #808000; text-decoration-color: #808000">description</span><span style="color: #000000; text-decoration-color: #000000">=</span><span style="color: #008000; text-decoration-color: #008000">"How the patient is responding to the medication"</span><span style="color: #800080; text-decoration-color: #800080">/</span><span style="color: #000000; text-decoration-color: #000000">&gt;</span>
<span style="color: #000000; text-decoration-color: #000000">        &lt;</span><span style="color: #800080; text-decoration-color: #800080">/</span><span style="color: #ff00ff; text-decoration-color: #ff00ff">object</span><span style="color: #000000; text-decoration-color: #000000">&gt;</span>
<span style="color: #000000; text-decoration-color: #000000">    &lt;</span><span style="color: #800080; text-decoration-color: #800080">/</span><span style="color: #ff00ff; text-decoration-color: #ff00ff">list</span><span style="color: #000000; text-decoration-color: #000000">&gt;</span>
<span style="color: #000000; text-decoration-color: #000000">&lt;</span><span style="color: #800080; text-decoration-color: #800080">/</span><span style="color: #ff00ff; text-decoration-color: #ff00ff">output</span><span style="color: #000000; text-decoration-color: #000000">&gt;</span>


<span style="color: #000000; text-decoration-color: #000000">ONLY return a valid JSON object </span><span style="color: #000000; text-decoration-color: #000000; font-weight: bold">(</span><span style="color: #000000; text-decoration-color: #000000">no other text is necessary</span><span style="color: #000000; text-decoration-color: #000000; font-weight: bold">)</span><span style="color: #000000; text-decoration-color: #000000">, where the key of the field in JSON is the `name` </span>
<span style="color: #000000; text-decoration-color: #000000">attribute of the corresponding XML, and the value is of the type specified by the corresponding XML's tag. The JSON</span>
<span style="color: #000000; text-decoration-color: #000000">MUST conform to the XML format, including any types and format requests e.g. requests for lists, objects and </span>
<span style="color: #000000; text-decoration-color: #000000">specific types. Be correct and concise.</span>

<span style="color: #000000; text-decoration-color: #000000">Here are examples of simple </span><span style="color: #000000; text-decoration-color: #000000; font-weight: bold">(</span><span style="color: #000000; text-decoration-color: #000000">XML, JSON</span><span style="color: #000000; text-decoration-color: #000000; font-weight: bold">)</span><span style="color: #000000; text-decoration-color: #000000"> pairs that show the expected behavior:</span>
<span style="color: #000000; text-decoration-color: #000000">- `&lt;string </span><span style="color: #808000; text-decoration-color: #808000">name</span><span style="color: #000000; text-decoration-color: #000000">=</span><span style="color: #008000; text-decoration-color: #008000">'foo'</span><span style="color: #000000; text-decoration-color: #000000"> </span><span style="color: #808000; text-decoration-color: #808000">format</span><span style="color: #000000; text-decoration-color: #000000">=</span><span style="color: #008000; text-decoration-color: #008000">'two-words lower-case'</span><span style="color: #000000; text-decoration-color: #000000"> </span><span style="color: #800080; text-decoration-color: #800080">/</span><span style="color: #000000; text-decoration-color: #000000">&gt;` =&gt; `</span><span style="color: #000000; text-decoration-color: #000000; font-weight: bold">{</span><span style="color: #008000; text-decoration-color: #008000">'foo'</span><span style="color: #000000; text-decoration-color: #000000">: </span><span style="color: #008000; text-decoration-color: #008000">'example one'</span><span style="color: #000000; text-decoration-color: #000000; font-weight: bold">}</span><span style="color: #000000; text-decoration-color: #000000">`</span>
<span style="color: #000000; text-decoration-color: #000000">- `&lt;list </span><span style="color: #808000; text-decoration-color: #808000">name</span><span style="color: #000000; text-decoration-color: #000000">=</span><span style="color: #008000; text-decoration-color: #008000">'bar'</span><span style="color: #000000; text-decoration-color: #000000">&gt;&lt;string </span><span style="color: #808000; text-decoration-color: #808000">format</span><span style="color: #000000; text-decoration-color: #000000">=</span><span style="color: #008000; text-decoration-color: #008000">'upper-case'</span><span style="color: #000000; text-decoration-color: #000000"> </span><span style="color: #800080; text-decoration-color: #800080">/</span><span style="color: #000000; text-decoration-color: #000000">&gt;&lt;</span><span style="color: #800080; text-decoration-color: #800080">/</span><span style="color: #ff00ff; text-decoration-color: #ff00ff">list</span><span style="color: #000000; text-decoration-color: #000000">&gt;` =&gt; `</span><span style="color: #000000; text-decoration-color: #000000; font-weight: bold">{</span><span style="color: #008000; text-decoration-color: #008000">"bar"</span><span style="color: #000000; text-decoration-color: #000000">: </span><span style="color: #000000; text-decoration-color: #000000; font-weight: bold">[</span><span style="color: #008000; text-decoration-color: #008000">'STRING ONE'</span><span style="color: #000000; text-decoration-color: #000000">, </span><span style="color: #008000; text-decoration-color: #008000">'STRING TWO'</span><span style="color: #000000; text-decoration-color: #000000">, etc.</span><span style="color: #000000; text-decoration-color: #000000; font-weight: bold">]}</span><span style="color: #000000; text-decoration-color: #000000">`</span>
<span style="color: #000000; text-decoration-color: #000000">- `&lt;object </span><span style="color: #808000; text-decoration-color: #808000">name</span><span style="color: #000000; text-decoration-color: #000000">=</span><span style="color: #008000; text-decoration-color: #008000">'baz'</span><span style="color: #000000; text-decoration-color: #000000">&gt;&lt;string </span><span style="color: #808000; text-decoration-color: #808000">name</span><span style="color: #000000; text-decoration-color: #000000">=</span><span style="color: #008000; text-decoration-color: #008000">"foo"</span><span style="color: #000000; text-decoration-color: #000000"> </span><span style="color: #808000; text-decoration-color: #808000">format</span><span style="color: #000000; text-decoration-color: #000000">=</span><span style="color: #008000; text-decoration-color: #008000">"capitalize two-words"</span><span style="color: #000000; text-decoration-color: #000000"> </span><span style="color: #800080; text-decoration-color: #800080">/</span><span style="color: #000000; text-decoration-color: #000000">&gt;&lt;integer </span><span style="color: #808000; text-decoration-color: #808000">name</span><span style="color: #000000; text-decoration-color: #000000">=</span><span style="color: #008000; text-decoration-color: #008000">"index"</span><span style="color: #000000; text-decoration-color: #000000"> </span><span style="color: #808000; text-decoration-color: #808000">format</span><span style="color: #000000; text-decoration-color: #000000">=</span><span style="color: #008000; text-decoration-color: #008000">"1-indexed"</span><span style="color: #000000; text-decoration-color: #000000"> </span>
<span style="color: #800080; text-decoration-color: #800080">/</span><span style="color: #000000; text-decoration-color: #000000">&gt;&lt;</span><span style="color: #800080; text-decoration-color: #800080">/</span><span style="color: #ff00ff; text-decoration-color: #ff00ff">object</span><span style="color: #000000; text-decoration-color: #000000">&gt;` =</span><span style="font-weight: bold">&gt;</span> `<span style="font-weight: bold">{</span><span style="color: #008000; text-decoration-color: #008000">'baz'</span>: <span style="font-weight: bold">{</span><span style="color: #008000; text-decoration-color: #008000">'foo'</span>: <span style="color: #008000; text-decoration-color: #008000">'Some String'</span>, <span style="color: #008000; text-decoration-color: #008000">'index'</span>: <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">1</span><span style="font-weight: bold">}}</span>`


</pre>



## 4: Wrap an LLM Call with the Guard Object


```python
# Wrap the Cohere API call with the `guard` object
response = guard(
    co.chat,
    prompt_params={"doctors_notes": doctors_notes},
    model='command-r',
    temperature=0,
)

# Print the validated output from the LLM
print(response.validated_output)
```


<pre style="white-space:pre;overflow-x:auto;line-height:normal;font-family:Menlo,'DejaVu Sans Mono',consolas,'Courier New',monospace"><span style="font-weight: bold">{</span>
    <span style="color: #008000; text-decoration-color: #008000">'gender'</span>: <span style="color: #008000; text-decoration-color: #008000">'Male'</span>,
    <span style="color: #008000; text-decoration-color: #008000">'age'</span>: <span style="color: #008080; text-decoration-color: #008080; font-weight: bold">49</span>,
    <span style="color: #008000; text-decoration-color: #008000">'symptoms'</span>: <span style="font-weight: bold">[{</span><span style="color: #008000; text-decoration-color: #008000">'symptom'</span>: <span style="color: #008000; text-decoration-color: #008000">'Chronic macular rash, itchy, flaky, slightly scaly'</span>, <span style="color: #008000; text-decoration-color: #008000">'affected_area'</span>: <span style="color: #008000; text-decoration-color: #008000">'Face'</span><span style="font-weight: bold">}]</span>,
    <span style="color: #008000; text-decoration-color: #008000">'current_meds'</span>: <span style="font-weight: bold">[{</span><span style="color: #008000; text-decoration-color: #008000">'medication'</span>: <span style="color: #008000; text-decoration-color: #008000">'OTC steroid cream'</span>, <span style="color: #008000; text-decoration-color: #008000">'response'</span>: <span style="color: #008000; text-decoration-color: #008000">'Moderate response'</span><span style="font-weight: bold">}]</span>
<span style="font-weight: bold">}</span>
</pre>




```python
guard.history.last.tree
```




<pre style="white-space:pre;overflow-x:auto;line-height:normal;font-family:Menlo,'DejaVu Sans Mono',consolas,'Courier New',monospace">Logs
├── ╭────────────────────────────────────────────────── Step 0 ───────────────────────────────────────────────────╮
│   │ <span style="background-color: #f0f8ff">╭──────────────────────────────────────────────── Prompt ─────────────────────────────────────────────────╮</span> │
│   │ <span style="background-color: #f0f8ff">│ Given the following doctor's notes about a patient,                                                     │</span> │
│   │ <span style="background-color: #f0f8ff">│ please extract a dictionary that contains the patient's information.                                    │</span> │
│   │ <span style="background-color: #f0f8ff">│                                                                                                         │</span> │
│   │ <span style="background-color: #f0f8ff">│ 49 y/o Male with chronic macular rash to face &amp; hair, worse in beard, eyebrows &amp; nares.                 │</span> │
│   │ <span style="background-color: #f0f8ff">│ Itchy, flaky, slightly scaly. Moderate response to OTC steroid cream                                    │</span> │
│   │ <span style="background-color: #f0f8ff">│                                                                                                         │</span> │
│   │ <span style="background-color: #f0f8ff">│                                                                                                         │</span> │
│   │ <span style="background-color: #f0f8ff">│ Given below is XML that describes the information to extract from this document and the tags to extract │</span> │
│   │ <span style="background-color: #f0f8ff">│ it into.                                                                                                │</span> │
│   │ <span style="background-color: #f0f8ff">│                                                                                                         │</span> │
│   │ <span style="background-color: #f0f8ff">│ &lt;output&gt;                                                                                                │</span> │
│   │ <span style="background-color: #f0f8ff">│     &lt;string name="gender" description="Patient's gender"/&gt;                                              │</span> │
│   │ <span style="background-color: #f0f8ff">│     &lt;integer name="age" description="Patient's age" format="guardrails/valid_range: min=0 max=100"/&gt;    │</span> │
│   │ <span style="background-color: #f0f8ff">│     &lt;list name="symptoms" description="Symptoms that the patient is experiencing"&gt;                      │</span> │
│   │ <span style="background-color: #f0f8ff">│         &lt;object&gt;                                                                                        │</span> │
│   │ <span style="background-color: #f0f8ff">│             &lt;string name="symptom" description="Symptom that a patient is experiencing"/&gt;               │</span> │
│   │ <span style="background-color: #f0f8ff">│             &lt;string name="affected_area" description="What part of the body the symptom is affecting"   │</span> │
│   │ <span style="background-color: #f0f8ff">│ format="guardrails/valid_choices: choices=['Head', 'Face', 'Neck', 'Chest']"/&gt;                          │</span> │
│   │ <span style="background-color: #f0f8ff">│         &lt;/object&gt;                                                                                       │</span> │
│   │ <span style="background-color: #f0f8ff">│     &lt;/list&gt;                                                                                             │</span> │
│   │ <span style="background-color: #f0f8ff">│     &lt;list name="current_meds" description="Medications that the patient is currently taking"&gt;           │</span> │
│   │ <span style="background-color: #f0f8ff">│         &lt;object&gt;                                                                                        │</span> │
│   │ <span style="background-color: #f0f8ff">│             &lt;string name="medication" description="Name of the medication the patient is taking"/&gt;      │</span> │
│   │ <span style="background-color: #f0f8ff">│             &lt;string name="response" description="How the patient is responding to the medication"/&gt;     │</span> │
│   │ <span style="background-color: #f0f8ff">│         &lt;/object&gt;                                                                                       │</span> │
│   │ <span style="background-color: #f0f8ff">│     &lt;/list&gt;                                                                                             │</span> │
│   │ <span style="background-color: #f0f8ff">│ &lt;/output&gt;                                                                                               │</span> │
│   │ <span style="background-color: #f0f8ff">│                                                                                                         │</span> │
│   │ <span style="background-color: #f0f8ff">│                                                                                                         │</span> │
│   │ <span style="background-color: #f0f8ff">│ ONLY return a valid JSON object (no other text is necessary), where the key of the field in JSON is the │</span> │
│   │ <span style="background-color: #f0f8ff">│ `name` attribute of the corresponding XML, and the value is of the type specified by the corresponding  │</span> │
│   │ <span style="background-color: #f0f8ff">│ XML's tag. The JSON MUST conform to the XML format, including any types and format requests e.g.        │</span> │
│   │ <span style="background-color: #f0f8ff">│ requests for lists, objects and specific types. Be correct and concise.                                 │</span> │
│   │ <span style="background-color: #f0f8ff">│                                                                                                         │</span> │
│   │ <span style="background-color: #f0f8ff">│ Here are examples of simple (XML, JSON) pairs that show the expected behavior:                          │</span> │
│   │ <span style="background-color: #f0f8ff">│ - `&lt;string name='foo' format='two-words lower-case' /&gt;` =&gt; `{'foo': 'example one'}`                     │</span> │
│   │ <span style="background-color: #f0f8ff">│ - `&lt;list name='bar'&gt;&lt;string format='upper-case' /&gt;&lt;/list&gt;` =&gt; `{"bar": ['STRING ONE', 'STRING TWO',     │</span> │
│   │ <span style="background-color: #f0f8ff">│ etc.]}`                                                                                                 │</span> │
│   │ <span style="background-color: #f0f8ff">│ - `&lt;object name='baz'&gt;&lt;string name="foo" format="capitalize two-words" /&gt;&lt;integer name="index"          │</span> │
│   │ <span style="background-color: #f0f8ff">│ format="1-indexed" /&gt;&lt;/object&gt;` =&gt; `{'baz': {'foo': 'Some String', 'index': 1}}`                        │</span> │
│   │ <span style="background-color: #f0f8ff">│                                                                                                         │</span> │
│   │ <span style="background-color: #f0f8ff">│                                                                                                         │</span> │
│   │ <span style="background-color: #f0f8ff">╰─────────────────────────────────────────────────────────────────────────────────────────────────────────╯</span> │
│   │ <span style="background-color: #e7dfeb">╭──────────────────────────────────────────── Message History ────────────────────────────────────────────╮</span> │
│   │ <span style="background-color: #e7dfeb">│ No message history.                                                                                     │</span> │
│   │ <span style="background-color: #e7dfeb">╰─────────────────────────────────────────────────────────────────────────────────────────────────────────╯</span> │
│   │ <span style="background-color: #f5f5dc">╭──────────────────────────────────────────── Raw LLM Output ─────────────────────────────────────────────╮</span> │
│   │ <span style="background-color: #f5f5dc">│ {                                                                                                       │</span> │
│   │ <span style="background-color: #f5f5dc">│     "gender": "Male",                                                                                   │</span> │
│   │ <span style="background-color: #f5f5dc">│     "age": 49,                                                                                          │</span> │
│   │ <span style="background-color: #f5f5dc">│     "symptoms": [                                                                                       │</span> │
│   │ <span style="background-color: #f5f5dc">│         {                                                                                               │</span> │
│   │ <span style="background-color: #f5f5dc">│             "symptom": "Chronic macular rash, itchy, flaky, slightly scaly",                            │</span> │
│   │ <span style="background-color: #f5f5dc">│             "affected_area": "Face &amp; Head"                                                              │</span> │
│   │ <span style="background-color: #f5f5dc">│         }                                                                                               │</span> │
│   │ <span style="background-color: #f5f5dc">│     ],                                                                                                  │</span> │
│   │ <span style="background-color: #f5f5dc">│     "current_meds": [                                                                                   │</span> │
│   │ <span style="background-color: #f5f5dc">│         {                                                                                               │</span> │
│   │ <span style="background-color: #f5f5dc">│             "medication": "OTC steroid cream",                                                          │</span> │
│   │ <span style="background-color: #f5f5dc">│             "response": "Moderate response"                                                             │</span> │
│   │ <span style="background-color: #f5f5dc">│         }                                                                                               │</span> │
│   │ <span style="background-color: #f5f5dc">│     ]                                                                                                   │</span> │
│   │ <span style="background-color: #f5f5dc">│ }                                                                                                       │</span> │
│   │ <span style="background-color: #f5f5dc">╰─────────────────────────────────────────────────────────────────────────────────────────────────────────╯</span> │
│   │ <span style="background-color: #f0fff0">╭─────────────────────────────────────────── Validated Output ────────────────────────────────────────────╮</span> │
│   │ <span style="background-color: #f0fff0">│ {                                                                                                       │</span> │
│   │ <span style="background-color: #f0fff0">│     'gender': 'Male',                                                                                   │</span> │
│   │ <span style="background-color: #f0fff0">│     'age': 49,                                                                                          │</span> │
│   │ <span style="background-color: #f0fff0">│     'symptoms': [                                                                                       │</span> │
│   │ <span style="background-color: #f0fff0">│         {                                                                                               │</span> │
│   │ <span style="background-color: #f0fff0">│             'symptom': 'Chronic macular rash, itchy, flaky, slightly scaly',                            │</span> │
│   │ <span style="background-color: #f0fff0">│             'affected_area': FieldReAsk(                                                                │</span> │
│   │ <span style="background-color: #f0fff0">│                 incorrect_value='Face &amp; Head',                                                          │</span> │
│   │ <span style="background-color: #f0fff0">│                 fail_results=[                                                                          │</span> │
│   │ <span style="background-color: #f0fff0">│                     FailResult(                                                                         │</span> │
│   │ <span style="background-color: #f0fff0">│                         outcome='fail',                                                                 │</span> │
│   │ <span style="background-color: #f0fff0">│                         metadata=None,                                                                  │</span> │
│   │ <span style="background-color: #f0fff0">│                         error_message="Value Face &amp; Head is not in choices ['Head', 'Face', 'Neck',     │</span> │
│   │ <span style="background-color: #f0fff0">│ 'Chest'].",                                                                                             │</span> │
│   │ <span style="background-color: #f0fff0">│                         fix_value=None                                                                  │</span> │
│   │ <span style="background-color: #f0fff0">│                     )                                                                                   │</span> │
│   │ <span style="background-color: #f0fff0">│                 ],                                                                                      │</span> │
│   │ <span style="background-color: #f0fff0">│                 path=['symptoms', 0, 'affected_area']                                                   │</span> │
│   │ <span style="background-color: #f0fff0">│             )                                                                                           │</span> │
│   │ <span style="background-color: #f0fff0">│         }                                                                                               │</span> │
│   │ <span style="background-color: #f0fff0">│     ],                                                                                                  │</span> │
│   │ <span style="background-color: #f0fff0">│     'current_meds': [                                                                                   │</span> │
│   │ <span style="background-color: #f0fff0">│         {'medication': 'OTC steroid cream', 'response': 'Moderate response'}                            │</span> │
│   │ <span style="background-color: #f0fff0">│     ]                                                                                                   │</span> │
│   │ <span style="background-color: #f0fff0">│ }                                                                                                       │</span> │
│   │ <span style="background-color: #f0fff0">╰─────────────────────────────────────────────────────────────────────────────────────────────────────────╯</span> │
│   ╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
└── ╭────────────────────────────────────────────────── Step 1 ───────────────────────────────────────────────────╮
    │ <span style="background-color: #f0f8ff">╭──────────────────────────────────────────────── Prompt ─────────────────────────────────────────────────╮</span> │
    │ <span style="background-color: #f0f8ff">│                                                                                                         │</span> │
    │ <span style="background-color: #f0f8ff">│ I was given the following JSON response, which had problems due to incorrect values.                    │</span> │
    │ <span style="background-color: #f0f8ff">│                                                                                                         │</span> │
    │ <span style="background-color: #f0f8ff">│ {                                                                                                       │</span> │
    │ <span style="background-color: #f0f8ff">│   "gender": "Male",                                                                                     │</span> │
    │ <span style="background-color: #f0f8ff">│   "age": 49,                                                                                            │</span> │
    │ <span style="background-color: #f0f8ff">│   "symptoms": [                                                                                         │</span> │
    │ <span style="background-color: #f0f8ff">│     {                                                                                                   │</span> │
    │ <span style="background-color: #f0f8ff">│       "symptom": "Chronic macular rash, itchy, flaky, slightly scaly",                                  │</span> │
    │ <span style="background-color: #f0f8ff">│       "affected_area": {                                                                                │</span> │
    │ <span style="background-color: #f0f8ff">│         "incorrect_value": "Face &amp; Head",                                                               │</span> │
    │ <span style="background-color: #f0f8ff">│         "error_messages": [                                                                             │</span> │
    │ <span style="background-color: #f0f8ff">│           "Value Face &amp; Head is not in choices ['Head', 'Face', 'Neck', 'Chest']."                      │</span> │
    │ <span style="background-color: #f0f8ff">│         ]                                                                                               │</span> │
    │ <span style="background-color: #f0f8ff">│       }                                                                                                 │</span> │
    │ <span style="background-color: #f0f8ff">│     }                                                                                                   │</span> │
    │ <span style="background-color: #f0f8ff">│   ],                                                                                                    │</span> │
    │ <span style="background-color: #f0f8ff">│   "current_meds": [                                                                                     │</span> │
    │ <span style="background-color: #f0f8ff">│     {                                                                                                   │</span> │
    │ <span style="background-color: #f0f8ff">│       "medication": "OTC steroid cream",                                                                │</span> │
    │ <span style="background-color: #f0f8ff">│       "response": "Moderate response"                                                                   │</span> │
    │ <span style="background-color: #f0f8ff">│     }                                                                                                   │</span> │
    │ <span style="background-color: #f0f8ff">│   ]                                                                                                     │</span> │
    │ <span style="background-color: #f0f8ff">│ }                                                                                                       │</span> │
    │ <span style="background-color: #f0f8ff">│                                                                                                         │</span> │
    │ <span style="background-color: #f0f8ff">│ Help me correct the incorrect values based on the given error messages.                                 │</span> │
    │ <span style="background-color: #f0f8ff">│                                                                                                         │</span> │
    │ <span style="background-color: #f0f8ff">│ Given below is XML that describes the information to extract from this document and the tags to extract │</span> │
    │ <span style="background-color: #f0f8ff">│ it into.                                                                                                │</span> │
    │ <span style="background-color: #f0f8ff">│                                                                                                         │</span> │
    │ <span style="background-color: #f0f8ff">│ &lt;output&gt;                                                                                                │</span> │
    │ <span style="background-color: #f0f8ff">│     &lt;string name="gender" description="Patient's gender"/&gt;                                              │</span> │
    │ <span style="background-color: #f0f8ff">│     &lt;integer name="age" description="Patient's age" format="guardrails/valid_range: min=0 max=100"/&gt;    │</span> │
    │ <span style="background-color: #f0f8ff">│     &lt;list name="symptoms" description="Symptoms that the patient is experiencing"&gt;                      │</span> │
    │ <span style="background-color: #f0f8ff">│         &lt;object&gt;                                                                                        │</span> │
    │ <span style="background-color: #f0f8ff">│             &lt;string name="symptom" description="Symptom that a patient is experiencing"/&gt;               │</span> │
    │ <span style="background-color: #f0f8ff">│             &lt;string name="affected_area" description="What part of the body the symptom is affecting"   │</span> │
    │ <span style="background-color: #f0f8ff">│ format="guardrails/valid_choices: choices=['Head', 'Face', 'Neck', 'Chest']"/&gt;                          │</span> │
    │ <span style="background-color: #f0f8ff">│         &lt;/object&gt;                                                                                       │</span> │
    │ <span style="background-color: #f0f8ff">│     &lt;/list&gt;                                                                                             │</span> │
    │ <span style="background-color: #f0f8ff">│     &lt;list name="current_meds" description="Medications that the patient is currently taking"&gt;           │</span> │
    │ <span style="background-color: #f0f8ff">│         &lt;object&gt;                                                                                        │</span> │
    │ <span style="background-color: #f0f8ff">│             &lt;string name="medication" description="Name of the medication the patient is taking"/&gt;      │</span> │
    │ <span style="background-color: #f0f8ff">│             &lt;string name="response" description="How the patient is responding to the medication"/&gt;     │</span> │
    │ <span style="background-color: #f0f8ff">│         &lt;/object&gt;                                                                                       │</span> │
    │ <span style="background-color: #f0f8ff">│     &lt;/list&gt;                                                                                             │</span> │
    │ <span style="background-color: #f0f8ff">│ &lt;/output&gt;                                                                                               │</span> │
    │ <span style="background-color: #f0f8ff">│                                                                                                         │</span> │
    │ <span style="background-color: #f0f8ff">│                                                                                                         │</span> │
    │ <span style="background-color: #f0f8ff">│ ONLY return a valid JSON object (no other text is necessary), where the key of the field in JSON is the │</span> │
    │ <span style="background-color: #f0f8ff">│ `name` attribute of the corresponding XML, and the value is of the type specified by the corresponding  │</span> │
    │ <span style="background-color: #f0f8ff">│ XML's tag. The JSON MUST conform to the XML format, including any types and format requests e.g.        │</span> │
    │ <span style="background-color: #f0f8ff">│ requests for lists, objects and specific types. Be correct and concise. If you are unsure anywhere,     │</span> │
    │ <span style="background-color: #f0f8ff">│ enter `null`.                                                                                           │</span> │
    │ <span style="background-color: #f0f8ff">│                                                                                                         │</span> │
    │ <span style="background-color: #f0f8ff">╰─────────────────────────────────────────────────────────────────────────────────────────────────────────╯</span> │
    │ <span style="background-color: #e7dfeb">╭──────────────────────────────────────────── Message History ────────────────────────────────────────────╮</span> │
    │ <span style="background-color: #e7dfeb">│ No message history.                                                                                     │</span> │
    │ <span style="background-color: #e7dfeb">╰─────────────────────────────────────────────────────────────────────────────────────────────────────────╯</span> │
    │ <span style="background-color: #f5f5dc">╭──────────────────────────────────────────── Raw LLM Output ─────────────────────────────────────────────╮</span> │
    │ <span style="background-color: #f5f5dc">│ {                                                                                                       │</span> │
    │ <span style="background-color: #f5f5dc">│   "gender": "Male",                                                                                     │</span> │
    │ <span style="background-color: #f5f5dc">│   "age": 49,                                                                                            │</span> │
    │ <span style="background-color: #f5f5dc">│   "symptoms": [                                                                                         │</span> │
    │ <span style="background-color: #f5f5dc">│     {                                                                                                   │</span> │
    │ <span style="background-color: #f5f5dc">│       "symptom": "Chronic macular rash, itchy, flaky, slightly scaly",                                  │</span> │
    │ <span style="background-color: #f5f5dc">│       "affected_area": "Face"                                                                           │</span> │
    │ <span style="background-color: #f5f5dc">│     }                                                                                                   │</span> │
    │ <span style="background-color: #f5f5dc">│   ],                                                                                                    │</span> │
    │ <span style="background-color: #f5f5dc">│   "current_meds": [                                                                                     │</span> │
    │ <span style="background-color: #f5f5dc">│     {                                                                                                   │</span> │
    │ <span style="background-color: #f5f5dc">│       "medication": "OTC steroid cream",                                                                │</span> │
    │ <span style="background-color: #f5f5dc">│       "response": "Moderate response"                                                                   │</span> │
    │ <span style="background-color: #f5f5dc">│     }                                                                                                   │</span> │
    │ <span style="background-color: #f5f5dc">│   ]                                                                                                     │</span> │
    │ <span style="background-color: #f5f5dc">│ }                                                                                                       │</span> │
    │ <span style="background-color: #f5f5dc">╰─────────────────────────────────────────────────────────────────────────────────────────────────────────╯</span> │
    │ <span style="background-color: #f0fff0">╭─────────────────────────────────────────── Validated Output ────────────────────────────────────────────╮</span> │
    │ <span style="background-color: #f0fff0">│ {                                                                                                       │</span> │
    │ <span style="background-color: #f0fff0">│     'gender': 'Male',                                                                                   │</span> │
    │ <span style="background-color: #f0fff0">│     'age': 49,                                                                                          │</span> │
    │ <span style="background-color: #f0fff0">│     'symptoms': [                                                                                       │</span> │
    │ <span style="background-color: #f0fff0">│         {                                                                                               │</span> │
    │ <span style="background-color: #f0fff0">│             'symptom': 'Chronic macular rash, itchy, flaky, slightly scaly',                            │</span> │
    │ <span style="background-color: #f0fff0">│             'affected_area': 'Face'                                                                     │</span> │
    │ <span style="background-color: #f0fff0">│         }                                                                                               │</span> │
    │ <span style="background-color: #f0fff0">│     ],                                                                                                  │</span> │
    │ <span style="background-color: #f0fff0">│     'current_meds': [                                                                                   │</span> │
    │ <span style="background-color: #f0fff0">│         {'medication': 'OTC steroid cream', 'response': 'Moderate response'}                            │</span> │
    │ <span style="background-color: #f0fff0">│     ]                                                                                                   │</span> │
    │ <span style="background-color: #f0fff0">│ }                                                                                                       │</span> │
    │ <span style="background-color: #f0fff0">╰─────────────────────────────────────────────────────────────────────────────────────────────────────────╯</span> │
    ╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
</pre>





```python

```

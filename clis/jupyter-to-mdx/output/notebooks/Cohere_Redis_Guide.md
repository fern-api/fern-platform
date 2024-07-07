```python
# Import the required packages for this tutorial
from redis import Redis
from redisvl.index import SearchIndex
from redisvl.schema import IndexSchema
from redisvl.utils.vectorize import CohereTextVectorizer
from redisvl.query import VectorQuery
from redisvl.query.filter import Tag, Text, Num
import jsonlines
```


```python
# initialize the Cohere Text Vectorizer
api_key='{Insert your API Key}'

cohere_vectorizer = CohereTextVectorizer(
    model="embed-english-v3.0",
    api_config={"api_key": api_key},
)
```


```python
# construct a search index from the schema - this schema is called "semantic_search_demo"
schema = IndexSchema.from_yaml("configs/redis_guide_schema.yaml")
client = Redis.from_url("redis://localhost:6379")
index = SearchIndex(schema, client)

# create the index (no data yet)
index.create(overwrite=True)
```

    17:53:38 redisvl.index.index INFO   Index already exists, overwriting.



```python
# list all your indexes 
!rvl index listall
```

    [32m17:57:31[0m [34m[RedisVL][0m [1;30mINFO[0m   Indices:
    [32m17:57:31[0m [34m[RedisVL][0m [1;30mINFO[0m   1. semantic_search_demo
    [32m17:57:31[0m [34m[RedisVL][0m [1;30mINFO[0m   2. user_index
    [32m17:57:31[0m [34m[RedisVL][0m [1;30mINFO[0m   3. demo
    [32m17:57:31[0m [34m[RedisVL][0m [1;30mINFO[0m   4. redis_final_demo
    [32m17:57:31[0m [34m[RedisVL][0m [1;30mINFO[0m   5. providers



```python
# make sure the index matches our schema
!rvl index info -i semantic_search_demo
```

    
    
    Index Information:
    ╭──────────────────────┬────────────────┬────────────┬─────────────────┬────────────╮
    │ Index Name           │ Storage Type   │ Prefixes   │ Index Options   │   Indexing │
    ├──────────────────────┼────────────────┼────────────┼─────────────────┼────────────┤
    │ semantic_search_demo │ HASH           │ ['rvl']    │ []              │          0 │
    ╰──────────────────────┴────────────────┴────────────┴─────────────────┴────────────╯
    Index Fields:
    ╭──────────────┬──────────────┬─────────┬────────────────┬────────────────┬────────────────┬────────────────┬────────────────┬────────────────┬─────────────────┬────────────────╮
    │ Name         │ Attribute    │ Type    │ Field Option   │ Option Value   │ Field Option   │ Option Value   │ Field Option   │   Option Value │ Field Option    │ Option Value   │
    ├──────────────┼──────────────┼─────────┼────────────────┼────────────────┼────────────────┼────────────────┼────────────────┼────────────────┼─────────────────┼────────────────┤
    │ url          │ url          │ TEXT    │ WEIGHT         │ 1              │                │                │                │                │                 │                │
    │ title        │ title        │ TAG     │ SEPARATOR      │ ,              │                │                │                │                │                 │                │
    │ text         │ text         │ TEXT    │ WEIGHT         │ 1              │                │                │                │                │                 │                │
    │ wiki_id      │ wiki_id      │ NUMERIC │                │                │                │                │                │                │                 │                │
    │ paragraph_id │ paragraph_id │ NUMERIC │                │                │                │                │                │                │                 │                │
    │ id           │ id           │ NUMERIC │                │                │                │                │                │                │                 │                │
    │ views        │ views        │ NUMERIC │                │                │                │                │                │                │                 │                │
    │ langs        │ langs        │ NUMERIC │                │                │                │                │                │                │                 │                │
    │ embedding    │ embedding    │ VECTOR  │ algorithm      │ FLAT           │ data_type      │ FLOAT32        │ dim            │           1024 │ distance_metric │ COSINE         │
    ╰──────────────┴──────────────┴─────────┴────────────────┴────────────────┴────────────────┴────────────────┴────────────────┴────────────────┴─────────────────┴────────────────╯



```python
# read in your documents
jsonl_file_path='data/redis_guide_data.jsonl'

corpus=[]
text_to_embed=[]

with jsonlines.open(jsonl_file_path, mode='r') as reader:
    for line in reader: 
        corpus.append(line)
        # we want to store the embeddings of the field called `text`
        text_to_embed.append(line['text'])

# call embed_many which returns an array 
# hash data structures get serialized as a string and thus we store the embeddings in hashes as a byte string (handled by numpy)
res=cohere_vectorizer.embed_many(text_to_embed, input_type='search_document', as_buffer=True)
```


```python
# contruct the data payload to be uploaded to your index
data = [{"url": row['url'],
         "title": row['title'],
         "text": row['text'],
         "wiki_id": row['wiki_id'],
         "paragraph_id": row['paragraph_id'],
         "id":row['id'],
         "views":row['views'],
         "langs":row['langs'],
         "embedding":v}
        for row, v in zip(corpus, res)]

# load the data into your index
index.load(data)
```


```python
# use the Cohere vectorizer again to create a query embedding
query_embedding = cohere_vectorizer.embed("What did Microsoft release in 2015?", input_type='search_query',as_buffer=True)


query = VectorQuery(
    vector=query_embedding,
    vector_field_name="embedding",
    return_fields=["url","wiki_id","paragraph_id","id","views","langs","title","text",],
    num_results=5
)

results = index.query(query)

for doc in results:
    print(f"Title:{doc['title']}\nText:{doc['text']}\nDistance {doc['vector_distance']}\n\n")
```

    Title:Microsoft Office
    Text:On January 22, 2015, the Microsoft Office blog announced that the next version of the suite for Windows desktop, Office 2016, was in development. On May 4, 2015, a public preview of Microsoft Office 2016 was released. Office 2016 was released for Mac OS X on July 9, 2015 and for Windows on September 22, 2015.
    Distance 0.425565302372
    
    
    Title:Microsoft Office
    Text:On January 22, 2015, the Microsoft Office blog announced that the next version of the suite for Windows desktop, Office 2016, was in development. On May 4, 2015, a public preview of Microsoft Office 2016 was released. Office 2016 was released for Mac OS X on July 9, 2015 and for Windows on September 22, 2015.
    Distance 0.425565302372
    
    
    Title:Microsoft Office
    Text:On January 22, 2015, the Microsoft Office blog announced that the next version of the suite for Windows desktop, Office 2016, was in development. On May 4, 2015, a public preview of Microsoft Office 2016 was released. Office 2016 was released for Mac OS X on July 9, 2015 and for Windows on September 22, 2015.
    Distance 0.425565302372
    
    
    Title:Microsoft Office
    Text:The first Preview version of Microsoft Office 2016 for Mac was released on March 5, 2015. On July 9, 2015, Microsoft released the final version of Microsoft Office 2016 for Mac which includes Word, Excel, PowerPoint, Outlook and OneNote. It was immediately made available for Office 365 subscribers with either a Home, Personal, Business, Business Premium, E3 or ProPlus subscription. A non–Office 365 edition of Office 2016 was made available as a one-time purchase option on September 22, 2015.
    Distance 0.447538018227
    
    
    Title:Microsoft Office
    Text:The first Preview version of Microsoft Office 2016 for Mac was released on March 5, 2015. On July 9, 2015, Microsoft released the final version of Microsoft Office 2016 for Mac which includes Word, Excel, PowerPoint, Outlook and OneNote. It was immediately made available for Office 365 subscribers with either a Home, Personal, Business, Business Premium, E3 or ProPlus subscription. A non–Office 365 edition of Office 2016 was made available as a one-time purchase option on September 22, 2015.
    Distance 0.447538018227
    
    



```python
# Initialize a tag filter
tag_filter = Tag("title") == "Microsoft Office"

# set the tag filter on our existing query 
query.set_filter(tag_filter)

results = index.query(query)

for doc in results:
    print(f"Title:{doc['title']}\nText:{doc['text']}\nDistance {doc['vector_distance']}\n")
```

    Title:Microsoft Office
    Text:On January 22, 2015, the Microsoft Office blog announced that the next version of the suite for Windows desktop, Office 2016, was in development. On May 4, 2015, a public preview of Microsoft Office 2016 was released. Office 2016 was released for Mac OS X on July 9, 2015 and for Windows on September 22, 2015.
    Distance 0.425565302372
    
    Title:Microsoft Office
    Text:On January 22, 2015, the Microsoft Office blog announced that the next version of the suite for Windows desktop, Office 2016, was in development. On May 4, 2015, a public preview of Microsoft Office 2016 was released. Office 2016 was released for Mac OS X on July 9, 2015 and for Windows on September 22, 2015.
    Distance 0.425565302372
    
    Title:Microsoft Office
    Text:On January 22, 2015, the Microsoft Office blog announced that the next version of the suite for Windows desktop, Office 2016, was in development. On May 4, 2015, a public preview of Microsoft Office 2016 was released. Office 2016 was released for Mac OS X on July 9, 2015 and for Windows on September 22, 2015.
    Distance 0.425565302372
    
    Title:Microsoft Office
    Text:The first Preview version of Microsoft Office 2016 for Mac was released on March 5, 2015. On July 9, 2015, Microsoft released the final version of Microsoft Office 2016 for Mac which includes Word, Excel, PowerPoint, Outlook and OneNote. It was immediately made available for Office 365 subscribers with either a Home, Personal, Business, Business Premium, E3 or ProPlus subscription. A non–Office 365 edition of Office 2016 was made available as a one-time purchase option on September 22, 2015.
    Distance 0.447538018227
    
    Title:Microsoft Office
    Text:The first Preview version of Microsoft Office 2016 for Mac was released on March 5, 2015. On July 9, 2015, Microsoft released the final version of Microsoft Office 2016 for Mac which includes Word, Excel, PowerPoint, Outlook and OneNote. It was immediately made available for Office 365 subscribers with either a Home, Personal, Business, Business Premium, E3 or ProPlus subscription. A non–Office 365 edition of Office 2016 was made available as a one-time purchase option on September 22, 2015.
    Distance 0.447538018227
    



```python
# use a filter expression for a more complex filter
# define a tag match on the title, text match on the text field, and numeric filter on the views field
filter_data=(Tag('title')=='Elizabeth II') & (Text("text")% "born") & (Num("views")>4500)

query_embedding = cohere_vectorizer.embed("When was she born?", input_type='search_query',as_buffer=True)

# reinitialize the query with the filter expression
query = VectorQuery(
    vector=query_embedding,
    vector_field_name="embedding",
    return_fields=["url","wiki_id","paragraph_id","id","views","langs","title","text",],
    num_results=5, 
    filter_expression=filter_data
)

results = index.query(query)

for doc in results:
    print(f"Title:{doc['title']}\nText:{doc['text']}\nDistance {doc['vector_distance']}\nView {doc['views']}\n")
```

    Title:Elizabeth II
    Text:Elizabeth was born on 21 April 1926, the first child of Prince Albert, Duke of York (later King George VI), and his wife, Elizabeth, Duchess of York (later Queen Elizabeth The Queen Mother). Her father was the second son of King George V and Queen Mary, and her mother was the youngest daughter of Scottish aristocrat Claude Bowes-Lyon, 14th Earl of Strathmore and Kinghorne. She was delivered at 02:40 (GMT) by Caesarean section at her maternal grandfather's London home, 17 Bruton Street in Mayfair. The Anglican Archbishop of York, Cosmo Gordon Lang, baptised her in the private chapel of Buckingham Palace on 29 May, and she was named Elizabeth after her mother; Alexandra after her paternal great-grandmother, who had died six months earlier; and Mary after her paternal grandmother. She was called "Lilibet" by her close family, based on what she called herself at first. She was cherished by her grandfather George V, whom she affectionately called "Grandpa England", and her regular visits during his serious illness in 1929 were credited in the popular press and by later biographers with raising his spirits and aiding his recovery.
    Distance 0.553019762039
    View 4912.77372605
    
    Title:Elizabeth II
    Text:Elizabeth was born on 21 April 1926, the first child of Prince Albert, Duke of York (later King George VI), and his wife, Elizabeth, Duchess of York (later Queen Elizabeth The Queen Mother). Her father was the second son of King George V and Queen Mary, and her mother was the youngest daughter of Scottish aristocrat Claude Bowes-Lyon, 14th Earl of Strathmore and Kinghorne. She was delivered at 02:40 (GMT) by Caesarean section at her maternal grandfather's London home, 17 Bruton Street in Mayfair. The Anglican Archbishop of York, Cosmo Gordon Lang, baptised her in the private chapel of Buckingham Palace on 29 May, and she was named Elizabeth after her mother; Alexandra after her paternal great-grandmother, who had died six months earlier; and Mary after her paternal grandmother. She was called "Lilibet" by her close family, based on what she called herself at first. She was cherished by her grandfather George V, whom she affectionately called "Grandpa England", and her regular visits during his serious illness in 1929 were credited in the popular press and by later biographers with raising his spirits and aiding his recovery.
    Distance 0.553019762039
    View 4912.77372605
    
    Title:Elizabeth II
    Text:Elizabeth was born on 21 April 1926, the first child of Prince Albert, Duke of York (later King George VI), and his wife, Elizabeth, Duchess of York (later Queen Elizabeth The Queen Mother). Her father was the second son of King George V and Queen Mary, and her mother was the youngest daughter of Scottish aristocrat Claude Bowes-Lyon, 14th Earl of Strathmore and Kinghorne. She was delivered at 02:40 (GMT) by Caesarean section at her maternal grandfather's London home, 17 Bruton Street in Mayfair. The Anglican Archbishop of York, Cosmo Gordon Lang, baptised her in the private chapel of Buckingham Palace on 29 May, and she was named Elizabeth after her mother; Alexandra after her paternal great-grandmother, who had died six months earlier; and Mary after her paternal grandmother. She was called "Lilibet" by her close family, based on what she called herself at first. She was cherished by her grandfather George V, whom she affectionately called "Grandpa England", and her regular visits during his serious illness in 1929 were credited in the popular press and by later biographers with raising his spirits and aiding his recovery.
    Distance 0.553019762039
    View 4912.77372605
    
    Title:Elizabeth II
    Text:Elizabeth was born in Mayfair, London, as the first child of the Duke and Duchess of York (later King George VI and Queen Elizabeth The Queen Mother). Her father acceded to the throne in 1936 upon the abdication of his brother Edward VIII, making the ten-year-old Princess Elizabeth the heir presumptive. She was educated privately at home and began to undertake public duties during the Second World War, serving in the Auxiliary Territorial Service. In November 1947, she married Philip Mountbatten, a former prince of Greece and Denmark, and their marriage lasted 73 years until his death in 2021. They had four children: Charles, Anne, Andrew, and Edward.
    Distance 0.573408603668
    View 4912.77372605
    
    Title:Elizabeth II
    Text:Elizabeth was born in Mayfair, London, as the first child of the Duke and Duchess of York (later King George VI and Queen Elizabeth The Queen Mother). Her father acceded to the throne in 1936 upon the abdication of his brother Edward VIII, making the ten-year-old Princess Elizabeth the heir presumptive. She was educated privately at home and began to undertake public duties during the Second World War, serving in the Auxiliary Territorial Service. In November 1947, she married Philip Mountbatten, a former prince of Greece and Denmark, and their marriage lasted 73 years until his death in 2021. They had four children: Charles, Anne, Andrew, and Edward.
    Distance 0.573408603668
    View 4912.77372605
    


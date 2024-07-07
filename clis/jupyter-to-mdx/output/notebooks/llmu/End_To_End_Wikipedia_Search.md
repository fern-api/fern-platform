<a target="_blank" href="https://colab.research.google.com/github/cohere-ai/notebooks/blob/main/notebooks/llmu/End_To_End_Wikipedia_Search.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

# Comparing different search methods for Wikipedia

In this notebook we study several different ways to query a Wikipedia database, including:
- Keyword search 
- Dense retrieval
- Reranking

Furthermore, we combine the power of search with Cohere's Chat endpoint in order to output accurate answers in sentence format to a query.

This notebook accompanies the [Semantic Search](https://docs.cohere.com/docs/intro-semantic-search) section of LLM University.

## Setup

We'll start by installing the tools we'll need and then importing them.


```python
! pip install cohere weaviate-client==4.5.4 -q
```


```python
import weaviate
import cohere
```

Fill in your Cohere API key in the next cell. To do this, begin by [signing up to Cohere](https://os.cohere.ai/) (for free!) if you haven't yet. Then get your API key [here](https://dashboard.cohere.com/api-keys).


```python
# Fill in your API key here. Remember to not share publicly
cohere_api_key = "COHERE_API_KEY"

co = cohere.Client(cohere_api_key) 
```


```python
# Connect to the Weaviate demo database containing 10M wikipedia vectors
auth_config = weaviate.auth.AuthApiKey(api_key="76320a90-53d8-42bc-b41d-678647c6672e")
client = weaviate.Client(
    url="https://cohere-demo.weaviate.network/",
    auth_client_secret=auth_config,
    additional_headers={
        "X-Cohere-Api-Key": cohere_api_key,
    }
)

client.is_ready() # check if True
```

    /Users/alexiscook/anaconda3/lib/python3.11/site-packages/weaviate/warnings.py:158: DeprecationWarning: Dep016: You are using the Weaviate v3 client, which is deprecated.
                Consider upgrading to the new and improved v4 client instead!
                See here for usage: https://weaviate.io/developers/weaviate/client-libraries/python
                
      warnings.warn(





    True



# Keyword Search

This section accompanies the [Keyword Search](https://docs.cohere.com/docs/keyword-search) chapter of LLM University.

We'll search for two queries using keyword search.
- Simple query: "Who discovered penicillin?" (Answer: Alexander Fleming)
- Hard query: "Who was the first person to win two Nobel prizes?" (Answer: Marie Curie)

You will notice that keyword search performs very well with the simple query, and not so well with the hard one.


```python
def keyword_search(query, results_lang='en', num_results=10):
    properties = ["text", "title", "url", "views", "lang", "_additional {distance}"]

    where_filter = {
        "path": ["lang"],
        "operator": "Equal",
        "valueString": results_lang
    }

    response = (
        client.query.get("Articles", properties)
        .with_bm25(
            query=query
        )
        .with_where(where_filter)
        .with_limit(num_results)
        .do()
    )
    result = response['data']['Get']['Articles']
    return result
```


```python
def print_result(result):
    """ Print results with colorful formatting """
    for item in result:
        print(f"\033[95m{item['title']} ({item['views']}) \033[0m")
        print(f"\033[4m{item['url']}\033[0m")
        print(item['text'])
        print()
```


```python
simple_query = "Who discovered penicillin?"
keyword_search_results_simple = keyword_search(simple_query)
print_result(keyword_search_results_simple)
```

    [95mPenicillin (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=23312[0m
    When Alexander Fleming discovered the crude penicillin in 1928, one important observation he made was that many bacteria were not affected by penicillin. This phenomenon was realised by Ernst Chain and Edward Abraham while trying to identify the exact of penicillin. In 1940, they discovered that unsusceptible bacteria like "Escherichia coli" produced specific enzymes that can break down penicillin molecules, thus making them resistant to the antibiotic. They named the enzyme penicillinase. Penicillinase is now classified as member of enzymes called β-lactamases. These β-lactamases are naturally present in many other bacteria, and many bacteria produce them upon constant exposure to antibiotics. In most bacteria, resistance can be through three different mechanisms: reduced permeability in bacteria, reduced binding affinity of the penicillin-binding proteins (PBPs) or destruction of the antibiotic through the expression of β-lactamase. Using any of these, bacteria commonly develop resistance to different antibiotics, a phenomenon called multi-drug resistance.
    
    [95mPenicillin (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=23312[0m
    Enzymatic destruction by β-lactamases is the most important mechanism of penicillin resistance, and is described as "the greatest threat to the usage [of penicillins]". It was the first discovered mechanism of penicillin resistance. During the experiments when purification and biological activity tests of penicillin were performed in 1940, it was found that "E. coli" was unsusceptible. The reason was discovered as production of an enzyme penicillinase (hence, the first β-lactamase known) in "E. coli" that easily degraded penicillin. There are over 2,000 types of β-lactamases each of which has unique amino acid sequence, and thus, enzymatic activity. All of them are able to hydrolyse β-lactam rings but their exact target sites are different. They are secreted on the bacterial surface in large quantities in Gram-positive bacteria but less so in Gram-negative species. Therefore, in a mixed bacterial infection, the Gram-positive bacteria can protect the otherwise penicillin-susceptible Gram-negative cells.
    
    [95mAntibiotic (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=1805[0m
    Ernst Chain, Howard Florey and Edward Abraham succeeded in purifying the first penicillin, penicillin G, in 1942, but it did not become widely available outside the Allied military before 1945. Later, Norman Heatley developed the back extraction technique for efficiently purifying penicillin in bulk. The chemical structure of penicillin was first proposed by Abraham in 1942 and then later confirmed by Dorothy Crowfoot Hodgkin in 1945. Purified penicillin displayed potent antibacterial activity against a wide range of bacteria and had low toxicity in humans. Furthermore, its activity was not inhibited by biological constituents such as pus, unlike the synthetic sulfonamides. (see below) The development of penicillin led to renewed interest in the search for antibiotic compounds with similar efficacy and safety. For their successful development of penicillin, which Fleming had accidentally discovered but could not develop himself, as a therapeutic drug, Chain and Florey shared the 1945 Nobel Prize in Medicine with Fleming.
    
    [95mAlexander Fleming (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=1937[0m
    Fleming also discovered very early that bacteria developed antibiotic resistance whenever too little penicillin was used or when it was used for too short a period. Almroth Wright had predicted antibiotic resistance even before it was noticed during experiments. Fleming cautioned about the use of penicillin in his many speeches around the world. On 26 June 1945, he made the following cautionary statements: "the microbes are educated to resist penicillin and a host of penicillin-fast organisms is bred out ... In such cases the thoughtless person playing with penicillin is morally responsible for the death of the man who finally succumbs to infection with the penicillin-resistant organism. I hope this evil can be averted." He cautioned not to use penicillin unless there was a properly diagnosed reason for it to be used, and that if it were used, never to use too little, or for too short a period, since these are the circumstances under which bacterial resistance to antibiotics develops.
    
    [95mPenicillin (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=23312[0m
    The term "penicillin" is defined as the natural product of "Penicillium" mould with antimicrobial activity. It was coined by Alexander Fleming on 7 March 1929 when he discovered the antibacterial property of "Penicillium rubens". Fleming explained in his 1929 paper in the "British Journal of Experimental Pathology" that "to avoid the repetition of the rather cumbersome phrase 'Mould broth filtrate', the name 'penicillin' will be used." The name thus refers to the scientific name of the mould, as described by Fleming in his Nobel lecture in 1945:I have been frequently asked why I invented the name "Penicillin". I simply followed perfectly orthodox lines and coined a word which explained that the substance penicillin was derived from a plant of the genus Penicillium just as many years ago the word "Digitalin" was invented for a substance derived from the plant "Digitalis".In modern usage, the term penicillin is used more broadly to refer to any β-lactam antimicrobial that contains a thiazolidine ring fused to the β-lactam core and may or may not be a natural product. Like most natural products, penicillin is present in "Penicillium" moulds as a mixture of active constituents (gentamicin is another example of a natural product that is an ill-defined mixture of active components). The principal active components of "Penicillium" are listed in the following table:""
    
    [95mPenicillin (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=23312[0m
    Penicillin was discovered in 1928 by Scottish scientist Alexander Fleming as a crude extract of "P. rubens". Fleming's student Cecil George Paine was the first to successfully use penicillin to treat eye infection (Ophthalmia neonatorum) in 1930. The purified compound (penicillin F) was isolated in 1940 by a research team led by Howard Florey and Ernst Boris Chain at the University of Oxford. Fleming first used the purified penicillin to treat streptococcal meningitis in 1942. The 1945 Nobel Prize in Physiology or Medicine was shared by Chain, Fleming, and Florey.
    
    [95mStaphylococcus aureus (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=118212[0m
    In 1880, Alexander Ogston, a Scottish surgeon, discovered that "Staphylococcus" can cause wound infections after noticing groups of bacteria in pus from a surgical abscess during a procedure he was performing. He named it "Staphylococcus" after its clustered appearance evident under a microscope. Then, in 1884, German scientist Friedrich Julius Rosenbach identified "Staphylococcus aureus", discriminating and separating it from "Staphylococcus albus", a related bacterium. In the early 1930s, doctors began to use a more streamlined test to detect the presence of an "S. aureus" infection by the means of coagulase testing, which enables detection of an enzyme produced by the bacterium. Prior to the 1940s, "S. aureus" infections were fatal in the majority of patients. However, doctors discovered that the use of penicillin could cure "S. aureus" infections. Unfortunately, by the end of the 1940s, penicillin resistance became widespread amongst this bacterium population and outbreaks of the resistant strain began to occur.
    
    [95mDoxycycline (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=660870[0m
    After penicillin revolutionized the treatment of bacterial infections in WWII, many chemical companies moved into the field of discovering antibiotics by bioprospecting. American Cyanamid was one of these, and in the late 1940s chemists there discovered chlortetracycline, the first member of the tetracycline class of antibiotics. Shortly thereafter, scientists at Pfizer discovered terramycin and it was brought to market. Both compounds, like penicillin, were natural products and it was commonly believed that nature had perfected them, and further chemical changes could only degrade their effectiveness. Scientists at Pfizer led by Lloyd Conover modified these compounds, which led to the invention of tetracycline itself, the first semi-synthetic antibiotic. Charlie Stephens' group at Pfizer worked on further analogs and created one with greatly improved stability and pharmacological efficacy: doxycycline. It was clinically developed in the early 1960s and approved by the FDA in 1967.
    
    [95mRoaring Twenties (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=369155[0m
    For decades biologists had been at work on the medicine that became penicillin. In 1928, Scottish biologist Alexander Fleming discovered a substance that killed a number of disease-causing bacteria. In 1929, he named the new substance penicillin. His publications were largely ignored at first, but it became a significant antibiotic in the 1930s. In 1930, Cecil George Paine, a pathologist at Sheffield Royal Infirmary, used penicillin to treat sycosis barbae, eruptions in beard follicles, but was unsuccessful. Moving to ophthalmia neonatorum, a gonococcal infection in infants, he achieved the first recorded cure with penicillin, on November 25, 1930. He then cured four additional patients (one adult and three infants) of eye infections, but failed to cure a fifth.
    
    [95mAlexander Fleming (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=1937[0m
    The popular story of Winston Churchill's father paying for Fleming's education after Fleming's father saved young Winston from death is false. According to the biography, "Penicillin Man: Alexander Fleming and the Antibiotic Revolution" by Kevin Brown, Alexander Fleming, in a letter to his friend and colleague Andre Gratia, described this as "A wondrous fable." Nor did he save Winston Churchill himself during World War II. Churchill was saved by Lord Moran, using sulphonamides, since he had no experience with penicillin, when Churchill fell ill in Carthage in Tunisia in 1943. "The Daily Telegraph" and "The Morning Post" on 21 December 1943 wrote that he had been saved by penicillin. He was saved by the new sulphonamide drug Sulphapyridine, known at the time under the research code M&B 693, discovered and produced by May & Baker Ltd, Dagenham, Essex – a subsidiary of the French group Rhône-Poulenc. In a subsequent radio broadcast, Churchill referred to the new drug as "This admirable M&B". It is highly probable that the correct information about the sulphonamide did not reach the newspapers because, since the original sulphonamide antibacterial, Prontosil, had been a discovery by the German laboratory Bayer, and as Britain was at war with Germany at the time, it was thought better to raise British morale by associating Churchill's cure with a British discovery, penicillin.
    



```python
hard_query = "Who was the first person to win two nobel prizes?"
keyword_search_results_hard = keyword_search(hard_query)
print_result(keyword_search_results_hard)
```

    [95mNeutrino (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=21485[0m
    In the 1960s, the now-famous Homestake experiment made the first measurement of the flux of electron neutrinos arriving from the core of the Sun and found a value that was between one third and one half the number predicted by the Standard Solar Model. This discrepancy, which became known as the solar neutrino problem, remained unresolved for some thirty years, while possible problems with both the experiment and the solar model were investigated, but none could be found. Eventually, it was realized that both were actually correct and that the discrepancy between them was due to neutrinos being more complex than was previously assumed. It was postulated that the three neutrinos had nonzero and slightly different masses, and could therefore oscillate into undetectable flavors on their flight to the Earth. This hypothesis was investigated by a new series of experiments, thereby opening a new major field of research that still continues. Eventual confirmation of the phenomenon of neutrino oscillation led to two Nobel prizes, to R. Davis, who conceived and led the Homestake experiment, and to A.B. McDonald, who led the SNO experiment, which could detect all of the neutrino flavors and found no deficit.
    
    [95mWestern culture (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=21208262[0m
    By the will of the Swedish inventor Alfred Nobel the Nobel Prizes were established in 1895. The prizes in Chemistry, Literature, Peace, Physics, and Physiology or Medicine were first awarded in 1901. The percentage of ethnically European Nobel prize winners during the first and second halves of the 20th century were respectively 98 and 94 percent.
    
    [95mReality television (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=38539[0m
    Game shows like "Weakest Link", "Who Wants to Be a Millionaire?", "American Gladiators" and "Deal or No Deal", which were popular in the 2000s, also lie in a gray area: like traditional game shows (e.g., "The Price Is Right", "Jeopardy!"), the action takes place in an enclosed television studio over a short period of time; however, they have higher production values, more dramatic background music, and higher stakes than traditional shows (done either through putting contestants into physical danger or offering large cash prizes). In addition, there is more interaction between contestants and hosts, and in some cases, they feature reality-style contestant competition or elimination as well. These factors, as well as these shows' rise in global popularity at the same time as the arrival of the reality craze, have led to such shows often being grouped under both the reality television and game show umbrellas. There have been various hybrid reality-competition shows, like the worldwide-syndicated "Star Academy", which combines the "Big Brother" and "Idol" formats, "The Biggest Loser", which combines competition with the self-improvement format, and "American Inventor", which uses the "Idol" format for products instead of people. Some reality shows that aired mostly during the early 2000s, such as "Popstars", "Making the Band" and "Project Greenlight", devoted the first part of the season to selecting a winner, and the second part to showing that person or group of people working on a project.
    
    [95mPeter Mullan (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=3242135[0m
    Mullan is an art house movie director. He won a Golden Lion at 59th Venice International Film Festival for "The Magdalene Sisters" (2002), listed by many critics among the best films of 2003 and nominated for BAFTA Award for Best British Film and European Film Award for best film, and a Golden Shell at San Sebastián International Film Festival for "Neds" (2010). He is the only person to win top prizes both for acting (Cannes Best Actor award for "My Name Is Joe") and for the best film (Golden Lion for "The Magdalene Sisters") at major European film festivals.
    
    [95mIndiana Pacers (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=72875[0m
    From 1989 to 1993, the Pacers would play at or near .500 and qualify for the playoffs; in 1989–90, the Pacers parlayed a fast start into the team's third playoff appearance under coach Bob Hill. But the Pacers were swept by the Detroit Pistons, who would go on to win their second consecutive NBA Championship. Reggie Miller became the first Pacer to play in the All-Star Game since 1976 on the strength of his 24.6 points-per-game average. Despite four straight first-round exits, this period was highlighted by a first-round series with the Boston Celtics in 1991 that went to Game 5. The next season, the Pacers returned to the playoffs in 1992 and met the Celtics for the second year in a row. But this time, the Celtics left no doubt who was the better team, as they swept the Pacers in three straight games. Chuck Person and point guard Micheal Williams were traded to the Minnesota Timberwolves in the off-season, and the Pacers got Pooh Richardson and Sam Mitchell in return. For the 1992–93 season, Detlef Schrempf moved from sixth man to the starter at small forward and was elected to his first All-Star game. Meanwhile, Miller became the Pacers' all-time NBA era leading scorer during this season (4th overall). The Pacers returned to the playoffs with a 41–41 record, but lost to the New York Knicks in the first round, three games to one.
    
    [95mWilliam Regal (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=690254[0m
    On 30 June, Regal was sent to SmackDown! as part of an eleven-person trade during the draft. His first match on "SmackDown!" was on 7 July against Matt Morgan in what was to be Morgan's final WWE match. It was interrupted before Regal was even able to enter the ring by Mexicools. His first full match as part of the roster was a loss to Chris Benoit in a catch wrestling match on 16 July episode of "Velocity". On 4 August, Regal was scheduled to go one on one with Scotty 2 Hotty, but the Mexicools came in and attacked both men. Two weeks later, they teamed up on "SmackDown!" against Psicosis and Super Crazy with Juventud in their corner. Halfway through the match, Regal betrayed Scotty by refusing to tag him and walked out of the ring with a smirk on his face, turning heel as a result and allowing the Mexicools to pick up the win. Two days later, Regal cut a promo telling the crowd that he had returned to his former self, referring to himself as a "scoundrel" and a "rogue". The promo ended when Scotty ran to the ring and attacked Regal. The following week, a match between the two was cut short when the debuting Paul Burchill interfered to aid his countryman. Regal went on to take Burchill under his wing and tag with him on the hunt for the WWE Tag Team Championship, but the team's biggest exposure was a loss in a handicap match against Bobby Lashley at Armageddon.
    
    [95mNobel Prize (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=21201[0m
    The Nobel Foundation was founded as a private organization on 29 June 1900. Its function is to manage the finances and administration of the Nobel Prizes. In accordance with Nobel's will, the primary task of the foundation is to manage the fortune Nobel left. Robert and Ludvig Nobel were involved in the oil business in Azerbaijan, and according to Swedish historian E. Bargengren, who accessed the Nobel family archive, it was this "decision to allow withdrawal of Alfred's money from Baku that became the decisive factor that enabled the Nobel Prizes to be established". Another important task of the Nobel Foundation is to market the prizes internationally and to oversee informal administration related to the prizes. The foundation is not involved in the process of selecting the Nobel laureates. In many ways, the Nobel Foundation is similar to an investment company, in that it invests Nobel's money to create a solid funding base for the prizes and the administrative activities. The Nobel Foundation is exempt from all taxes in Sweden (since 1946) and from investment taxes in the United States (since 1953). Since the 1980s, the foundation's investments have become more profitable and as of 31 December 2007, the assets controlled by the Nobel Foundation amounted to 3.628 billion Swedish "kronor" (c. US$560 million).
    
    [95mNobel Prize (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=21201[0m
    In terms of the most prestigious awards in STEM fields, only a small proportion have been awarded to women. Out of 210 laureates in Physics, 181 in Chemistry and 216 in Medicine between 1901 and 2018, there were only three female laureates in physics, five in chemistry and 12 in medicine. Factors proposed to contribute to the discrepancy between this and the roughly equal human sex ratio include biased nominations, fewer women than men being active in the relevant fields, Nobel Prizes typically being awarded decades after the research was done (reflecting a time when gender bias in the relevant fields was greater), a greater delay in awarding Nobel Prizes for women's achievements making longevity a more important factor for women (one cannot be nominated for the Nobel Prize posthumously), and a tendency to omit women from jointly awarded Nobel Prizes. Despite these factors, Marie Curie is to date the only person awarded Nobel Prizes in two different sciences (Physics in 1903, Chemistry in 1911); she is one of only three people who have received two Nobel Prizes in sciences (see Multiple laureates below). Malala Yousafzai is the youngest person ever to be awarded the Nobel Peace Prize. When she received it in 2014, she was only 17 years old.
    
    [95mNobel Prize (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=21201[0m
    The Nobel Prizes ( ; ; ) are five separate prizes that, according to Alfred Nobel's will of 1895, are awarded to "those who, during the preceding year, have conferred the greatest benefit to humankind." Alfred Nobel was a Swedish chemist, engineer, and industrialist most famously known for the invention of dynamite. He died in 1896. In his will, he bequeathed all of his "remaining realisable assets" to be used to establish five prizes which became known as "Nobel Prizes." Nobel Prizes were first awarded in 1901.
    
    [95mNoble gas (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=21140[0m
    Ramsay continued his search for these gases using the method of fractional distillation to separate liquid air into several components. In 1898, he discovered the elements krypton, neon, and xenon, and named them after the Greek words (, "hidden"), (, "new"), and (, "stranger"), respectively. Radon was first identified in 1898 by Friedrich Ernst Dorn, and was named "radium emanation", but was not considered a noble gas until 1904 when its characteristics were found to be similar to those of other noble gases. Rayleigh and Ramsay received the 1904 Nobel Prizes in Physics and in Chemistry, respectively, for their discovery of the noble gases; in the words of J. E. Cederblom, then president of the Royal Swedish Academy of Sciences, "the discovery of an entirely new group of elements, of which no single representative had been known with any certainty, is something utterly unique in the history of chemistry, being intrinsically an advance in science of peculiar significance".
    


# Dense Retrieval

This section accompanies the [Dense Retrieval](https://docs.cohere.com/docs/dense-retrieval) chapter of LLM University.

Now we will use dense retrieval to search the answers for the two queries. Now you will notice that the results are good for both queries.


```python
# This function performs dense retrieval
def dense_retrieval(query, results_lang='en', num_results=10):
    """
    Query the vectors database and return the top results.


    Parameters
    ----------
        query: str
            The search query

        results_lang: str (optional)
            Retrieve results only in the specified language.
            The demo dataset has those languages:
            en, de, fr, es, it, ja, ar, zh, ko, hi

    """

    nearText = {"concepts": [query]}
    properties = ["text", "title", "url", "views", "lang", "_additional {distance}"]
    # To filter by language
    where_filter = {
    "path": ["lang"],
    "operator": "Equal",
    "valueString": results_lang
    }
    response = (
        client.query
        .get("Articles", properties)
        .with_near_text(nearText)
        .with_where(where_filter)
        .with_limit(num_results)
        .do()
    )

    result = response['data']['Get']['Articles']

    return result
```


```python
simple_query = "Who discovered penicillin?"

dense_retrieval_results_simple = dense_retrieval(simple_query)
print_result(dense_retrieval_results_simple)
```

    [95mAlexander Fleming (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=1937[0m
    Sir Alexander Fleming (6 August 1881 – 11 March 1955) was a Scottish physician and microbiologist, best known for discovering the world's first broadly effective antibiotic substance, which he named penicillin. His discovery in 1928 of what was later named benzylpenicillin (or penicillin G) from the mould "Penicillium rubens" is described as the "single greatest victory ever achieved over disease." For this discovery, he shared the Nobel Prize in Physiology or Medicine in 1945 with Howard Florey and Ernst Boris Chain.
    
    [95mPenicillin (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=23312[0m
    Penicillin was discovered in 1928 by Scottish scientist Alexander Fleming as a crude extract of "P. rubens". Fleming's student Cecil George Paine was the first to successfully use penicillin to treat eye infection (Ophthalmia neonatorum) in 1930. The purified compound (penicillin F) was isolated in 1940 by a research team led by Howard Florey and Ernst Boris Chain at the University of Oxford. Fleming first used the purified penicillin to treat streptococcal meningitis in 1942. The 1945 Nobel Prize in Physiology or Medicine was shared by Chain, Fleming, and Florey.
    
    [95mPenicillin (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=23312[0m
    The term "penicillin" is defined as the natural product of "Penicillium" mould with antimicrobial activity. It was coined by Alexander Fleming on 7 March 1929 when he discovered the antibacterial property of "Penicillium rubens". Fleming explained in his 1929 paper in the "British Journal of Experimental Pathology" that "to avoid the repetition of the rather cumbersome phrase 'Mould broth filtrate', the name 'penicillin' will be used." The name thus refers to the scientific name of the mould, as described by Fleming in his Nobel lecture in 1945:I have been frequently asked why I invented the name "Penicillin". I simply followed perfectly orthodox lines and coined a word which explained that the substance penicillin was derived from a plant of the genus Penicillium just as many years ago the word "Digitalin" was invented for a substance derived from the plant "Digitalis".In modern usage, the term penicillin is used more broadly to refer to any β-lactam antimicrobial that contains a thiazolidine ring fused to the β-lactam core and may or may not be a natural product. Like most natural products, penicillin is present in "Penicillium" moulds as a mixture of active constituents (gentamicin is another example of a natural product that is an ill-defined mixture of active components). The principal active components of "Penicillium" are listed in the following table:""
    
    [95mAlexander Fleming (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=1937[0m
    The laboratory in which Fleming discovered and tested penicillin is preserved as the Alexander Fleming Laboratory Museum in St. Mary's Hospital, Paddington. The source of the fungal contaminant was established in 1966 as coming from La Touche's room, which was directly below Fleming's.
    
    [95mRoaring Twenties (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=369155[0m
    For decades biologists had been at work on the medicine that became penicillin. In 1928, Scottish biologist Alexander Fleming discovered a substance that killed a number of disease-causing bacteria. In 1929, he named the new substance penicillin. His publications were largely ignored at first, but it became a significant antibiotic in the 1930s. In 1930, Cecil George Paine, a pathologist at Sheffield Royal Infirmary, used penicillin to treat sycosis barbae, eruptions in beard follicles, but was unsuccessful. Moving to ophthalmia neonatorum, a gonococcal infection in infants, he achieved the first recorded cure with penicillin, on November 25, 1930. He then cured four additional patients (one adult and three infants) of eye infections, but failed to cure a fifth.
    
    [95mAlexander Fleming (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=1937[0m
    Fleming's discovery of penicillin changed the world of modern medicine by introducing the age of useful antibiotics; penicillin has saved, and is still saving, millions of people around the world.
    
    [95mBiotechnology (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=4502[0m
    Biotechnology has also led to the development of antibiotics. In 1928, Alexander Fleming discovered the mold "Penicillium". His work led to the purification of the antibiotic compound formed by the mold by Howard Florey, Ernst Boris Chain and Norman Heatley – to form what we today know as penicillin. In 1940, penicillin became available for medicinal use to treat bacterial infections in humans.
    
    [95mPenicillin (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=23312[0m
    6-APA was discovered by researchers at the Beecham Research Laboratories (later the Beecham Group) in Surrey in 1957 (published in 1959). Attaching different groups to the 6-APA 'nucleus' of penicillin allowed the creation of new forms of penicillins which are more versatile and better in activity.
    
    [95mPenicillin (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=23312[0m
    Fleming did not convince anyone that his discovery was important. This was largely because penicillin was so difficult to isolate that its development as a drug seemed impossible. It is speculated that had Fleming been more successful at making other scientists interested in his work, penicillin would possibly have been developed years earlier.
    
    [95mPenicillin (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=23312[0m
    Starting in the late 19th century there had been reports of the antibacterial properties of "Penicillium" mould, but scientists were unable to discern what process was causing the effect. Scottish physician Alexander Fleming at St. Mary's Hospital in London (now part of Imperial College) was the first to show that "Penicillium rubens" had antibacterial properties. On 3 September 1928 he observed that fungal contamination of a bacterial culture ("Staphylococcus aureus") appeared to kill the bacteria. He confirmed this observation with a new experiment on 28 September 1928. He published his experiment in 1929, and called the antibacterial substance (the fungal extract) penicillin.
    



```python
hard_query = "Who was the first person to win two Nobel prizes?"
dense_retrieval_results_hard = dense_retrieval(hard_query)
print_result(dense_retrieval_results_hard)
```

    [95mNobel Prize (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=21201[0m
    Five people have received two Nobel Prizes. Marie Curie received the Physics Prize in 1903 for her work on radioactivity and the Chemistry Prize in 1911 for the isolation of pure radium, making her the only person to be awarded a Nobel Prize in two different sciences. Linus Pauling was awarded the 1954 Chemistry Prize for his research into the chemical bond and its application to the structure of complex substances. Pauling was also awarded the Peace Prize in 1962 for his activism against nuclear weapons, making him the only laureate of two unshared prizes. John Bardeen received the Physics Prize twice: in 1956 for the invention of the transistor and in 1972 for the theory of superconductivity. Frederick Sanger received the prize twice in Chemistry: in 1958 for determining the structure of the insulin molecule and in 1980 for inventing a method of determining base sequences in DNA. Karl Barry Sharpless was awarded the 2001 Chemistry Prize for his research into chirally catalysed oxidation reactions, and the 2022 Chemistry Prize for click chemistry.
    
    [95mNobel Prize (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=21201[0m
    Although posthumous nominations are not presently permitted, individuals who died in the months between their nomination and the decision of the prize committee were originally eligible to receive the prize. This has occurred twice: the 1931 Literature Prize awarded to Erik Axel Karlfeldt, and the 1961 Peace Prize awarded to UN Secretary General Dag Hammarskjöld. Since 1974, laureates must be thought alive at the time of the October announcement. There has been one laureate, William Vickrey, who in 1996 died after the prize (in Economics) was announced but before it could be presented. On 3 October 2011, the laureates for the Nobel Prize in Physiology or Medicine were announced; however, the committee was not aware that one of the laureates, Ralph M. Steinman, had died three days earlier. The committee was debating about Steinman's prize, since the rule is that the prize is not awarded posthumously. The committee later decided that as the decision to award Steinman the prize "was made in good faith", it would remain unchanged.
    
    [95mUnited Nations (3000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=31769[0m
    A number of agencies and individuals associated with the UN have won the Nobel Peace Prize in recognition of their work. Two secretaries-general, Dag Hammarskjöld and Kofi Annan, were each awarded the prize (in 1961 and 2001, respectively), as were Ralph Bunche (1950), a UN negotiator, René Cassin (1968), a contributor to the Universal Declaration of Human Rights, and the US Secretary of State Cordell Hull (1945), the latter for his role in the organization's founding. Lester B. Pearson, the Canadian Secretary of State for External Affairs, was awarded the prize in 1957 for his role in organizing the UN's first peacekeeping force to resolve the Suez Crisis. UNICEF won the prize in 1965, the International Labour Organization in 1969, the UN Peacekeeping Forces in 1988, the International Atomic Energy Agency (which reports to the UN) in 2005, and the UN-supported Organisation for the Prohibition of Chemical Weapons in 2013. The UN High Commissioner for Refugees was awarded in 1954 and 1981, becoming one of only two recipients to win the prize twice. The UN as a whole was awarded the prize in 2001, sharing it with Annan. In 2007, IPCC received the prize "for their efforts to build up and disseminate greater knowledge about man-made climate change, and to lay the foundations for the measures that are needed to counteract such change."
    
    [95mNobel Prize in Literature (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=23385442[0m
    The Nobel Prize in Literature can be shared between two individuals. However, the Academy has been reluctant to award shared prizes, mainly because divisions are liable to be interpreted as a result of a compromise. The shared prizes awarded to Frederic Mistral and José Echegaray in 1904 and to Karl Gjellerup and Henrik Pontoppidan in 1917 were in fact both a result of compromises. The Academy has also hesitated to divide the prize between two authors as a shared prize runs the risk of being regarded as only half a laurel. Shared prizes are exceptional, and more recently the Academy has awarded a shared prize on only two occasions, to Shmuel Yosef Agnon and Nelly Sachs in 1966, and to Eyvind Johnson and Harry Martinson in 1974.
    
    [95mMarie Curie (3000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=20408[0m
    Marie Curie was the first woman to win a Nobel Prize, the first person to win two Nobel Prizes, the only woman to win in two fields, and the only person to win in multiple sciences. Awards that she received include:
    
    [95mWestern culture (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=21208262[0m
    By the will of the Swedish inventor Alfred Nobel the Nobel Prizes were established in 1895. The prizes in Chemistry, Literature, Peace, Physics, and Physiology or Medicine were first awarded in 1901. The percentage of ethnically European Nobel prize winners during the first and second halves of the 20th century were respectively 98 and 94 percent.
    
    [95mLiterature (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=18963870[0m
    Nobel Prizes in Literature have been awarded between 1901 and 2020 to 117 individuals: 101 men and 16 women. Selma Lagerlöf (1858 – 1940) was the first woman to win the Nobel Prize in Literature, which she was awarded in 1909. Additionally, she was the first woman to be granted a membership in The Swedish Academy in 1914.
    
    [95mMarie Curie (3000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=20408[0m
    She was the first person to win or share two Nobel Prizes, and remains alone with Linus Pauling as Nobel laureates in two fields each. A delegation of celebrated Polish men of learning, headed by novelist Henryk Sienkiewicz, encouraged her to return to Poland and continue her research in her native country. Curie's second Nobel Prize enabled her to persuade the French government to support the Radium Institute, built in 1914, where research was conducted in chemistry, physics, and medicine. A month after accepting her 1911 Nobel Prize, she was hospitalised with depression and a kidney ailment. For most of 1912, she avoided public life but did spend time in England with her friend and fellow physicist, Hertha Ayrton. She returned to her laboratory only in December, after a break of about 14 months.
    
    [95mMarie Curie (3000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=20408[0m
    Marie Salomea Skłodowska–Curie ( , , ; born Maria Salomea Skłodowska, ; 7 November 1867 – 4 July 1934) was a Polish and naturalized-French physicist and chemist who conducted pioneering research on radioactivity. She was the first woman to win a Nobel Prize, the first person and the only woman to win a Nobel Prize twice, and the only person to win a Nobel Prize in two scientific fields. Her husband, Pierre Curie, was a co-winner on her first Nobel Prize, making them the first ever married couple to win the Nobel Prize and launching the Curie family legacy of five Nobel Prizes. She was, in 1906, the first woman to become a professor at the University of Paris.
    
    [95mAlfred Nobel (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=851[0m
    Nobel was elected a member of the Royal Swedish Academy of Sciences in 1884, the same institution that would later select laureates for two of the Nobel prizes, and he received an honorary doctorate from Uppsala University in 1893.
    


### Searching in other languages
Changing the `results_lang` parameter to any of the following: en, de, fr, es, it, ja, ar, zh, ko, hi (the available languages in the demo) allows you to get results in any language you want. For example, here are the results to the hard query in Arabic.


```python
arabic_results = dense_retrieval(hard_query, results_lang='ar')
print_result(arabic_results)
```

    [95mجائزة نوبل (1000) [0m
    [4mhttps://ar.wikipedia.org/wiki?curid=1979[0m
    وقد حصل أربعة أشخاص على اثنتين من جوائز نوبل. حيث حصلت ماري كوري على جائزة نوبل في الفيزياء في عام 1903 بالمشاركة مع زوجها بيير كوري لعملهما على النشاط الإشعاعي، وحصلت وحدها كذلك على جائزة نوبل في الكيمياء عام 1911 لعزل الراديوم النقي، مما يجعلها المرأة الوحيدة التي تفوز بجائزة نوبل مرتين، والشخص الوحيد الذي فاز بجائزة نوبل في مجالين مختلفين في مجالات العلوم. وفاز لينوس باولنغ بجائزة الكيمياء لعام 1954 لأبحاثه في الروابط الكيميائية وتطبيقها على هيكل من المواد المعقدة، كما فاز باولنغ على جائزة نوبل للسلام في عام 1962 لنشاطه ضد الأسلحة النووية، مما يجعل منه الفائز الوحيد في جائزتين دون مشاركة الجائزة مع أحد. وحصل جون باردين على جائزة نوبل في الفيزياء مرتين: الأولى في عام 1956 لاختراع الترانزستور، والثانية في عام 1972 لنظرية التوصيل. وتلقى فردريك سانغر الجائزة مرتين في الكيمياء: الأولى في عام 1958 لتحديد بنية جزيء الأنسولين، والثانية في عام 1980 لاختراعه طريقة لتحديد تسلسل قاعدة في الحمض النووي.
    
    [95mقائمة الحاصلين على جائزة نوبل (800) [0m
    [4mhttps://ar.wikipedia.org/wiki?curid=1064904[0m
    وقد تسلم ستة فائزون أكثر من جائزة واحدة، فقد تسلمت اللجنة الدولية للصليب الأحمر جائزة نوبل في السلام لثلاث مرات، وهي بذلك تعد أكثر من حازت جوائز نوبل. ومن بين الفائزين البالغ عددهم 892، كانت 48 منهم من النساء؛ وكانت أول امرأة تفوز بجائزة نوبل هي ماري كوري، والتي فازت بجائزة نوبل في الفيزياء في عام 1903. كما كانت أيضًا أول شخص (سواء من الرجال أو النساء) يفوز بجائزة نوبل مرتين، وكانت المرة الثانية في الكيمياء في سنة 1911.
    
    [95mامرأة (1000) [0m
    [4mhttps://ar.wikipedia.org/wiki?curid=21220[0m
    تعتبر ماري كوري أول امرأة تحصل على جائزة نوبل في الفيزياء سنة 1903، وحصلت بعد ذلك مرة أخرى على جائزة نوبل في الكيمياء سنة 1911 وكانت الجائزتان لقاء عملها على في مجال النشاط الإشعاعي. ماري كوري هي أول شخص يفوز بجائزتي نوبل في مجالين علميين مختلفين (الفيزياء والكيمياء). 40 امرأة حصلت على جائزة نوبل بين 1901 و2010، منهنّ 16 حصلن على جائزة نوبل في الفيزياء والكيمياء والطب.
    
    [95mالمرأة في العلوم (100) [0m
    [4mhttps://ar.wikipedia.org/wiki?curid=3051265[0m
    كانت ماري كوري أول امرأة تحصل على جائزة نوبل في الفيزياء سنة 1903، وحصلت بعد ذلك مرة أخرى على جائزة نوبل في الكيمياء سنة 1911 وكانت الجائزتان لقاء عملها على في مجال النشاط الإشعاعي. وقد حصلت 40 امرأة على جائزة نوبل في الفترة الممتدة بين عامي 1901 و 2010 في الفيزياء والكيمياء والطب.
    
    [95mماري كوري (1000) [0m
    [4mhttps://ar.wikipedia.org/wiki?curid=16622[0m
    كانت ماري كوري أول امرأة تفوز بجائزة نوبل، وأول من يحصل عليها مرتين، والمرأة الوحيدة التي حصلت عليها في مجالين، والشخص الوحيد الذي يحصل على جائزة نوبل في مجالين علميين. شملت الجوائز التي حصلت عليها:
    
    [95mمحمد يونس (300) [0m
    [4mhttps://ar.wikipedia.org/wiki?curid=52332[0m
    وكان محمد يونس أول بنغالي يحصل على جائزة نوبل. وبعد تلقي نبأ الجائزة الهامة، أعلن محمد يونس أنه سيستخدم جزءا من نصيبه من الجائزة (1,400,000 دولار) لإنشاء شركة لتقديم تكلفة منخفضة للمواد الغذائية للفقراء، في حين أن بقية الجائزة ستذهب لإقامة مستشفى العيون للفقراء في بنغلاديش.
    
    [95mجائزة نوبل (1000) [0m
    [4mhttps://ar.wikipedia.org/wiki?curid=1979[0m
    حتى عام 2015، مُنِحَت الجائزة إلى 822 رجلًا و48 امرأة و26 منظمة. فازت 16 امرأة بجائزة نوبل للسلام و14 في مجال الأدب و12 في مجال الطب أو علم وظائف الأعضاء و4 في مجال الكيمياء واثنتان في مجال الفيزياء وفازت واحدة وهي إلينور أوستروم بجائزة نوبل التذكارية في العلوم الاقتصادية. وكانت ماري كوري هي أول امرأة تفوز بجائزة نوبل، وحصلت عليها في مجال الفيزياء عام 1903 مشاركة مع زوجها بيار كوري وهنري بيكريل. وتعتبر ماري أيضًا المرأة الوحيدة التي تفوز بالجائزة مرتين، حيث فازت أيضًا بجائزة نوبل للكيمياء عام 1911. وبفوز إيرين جوليو-كوري -ابنة ماري كوري- بجائزة نوبل في الكيمياء عام 1935، جعلهما ذلك أول ثنائي من أمٍ وابنتها يفوز بالجائزة. أما عن أكثر عامٍ شهد فوز النساء بجوائز نوبل فكان عام 2009، حينها توجت خمسة نساء بالجوائز. وآخر النساء فوزًا بالجوائز هم دونا ستريكلاند وفرانسيس أرنولد ونادية مراد (2018).
    
    [95mقائمة الحاصلين على جائزة نوبل في الكيمياء (300) [0m
    [4mhttps://ar.wikipedia.org/wiki?curid=2354241[0m
    حصلت الكيمياء العضوية ما لا يقل عن 25 جائزة، أكثر من أي مجال كيميائي آخر. أيضا لم يسمح لحكومتي الحائزين على جائزة نوبل في الكيمياء، الألمان ريشارد كون (1938) وأدولف بوتنانت (1939)، من قبل حكومتهم بقبول الجائزة. إذ حصلوا على الميدالية والدبلوم، لكن تم حرمانهم من المبلغ المالي. فردريك سانغر هو واحد من اثنين من الحائزين على جائزة نوبل مرتين في نفس الموضوع، في عام 1958 و1980. جون باردين هو الآخر وحصل على جائزة نوبل في الفيزياء في عامي 1956 و1972. وحصل اثنان آخران على جائزة نوبل مرتين، واحد في الكيمياء وواحد في موضوع آخر: ماري كوري (الفيزياء في عام 1903، والكيمياء في عام 1911) ولينوس باولينغ (الكيمياء في عام 1954، والسلام في عام 1962). اعتبارا من عام 2018، تم منح الجائزة إلى 180 شخصًا، من بينهم سبع نساء: ماري كوري (1911)، وإيرين جوليو-كوري (1935)، ودوروثي هودجكن (1964)، وعادا يونات (2009)، وفرانسيس أرنولد (2018)، وإيمانويل شاربنتييه وجنيفر داودنا (2020). ولم تمنح جائزة نوبل في الكيمياء ثمان سنوات.
    
    [95mقائمة النساء الحاصلات على جائزة نوبل (300) [0m
    [4mhttps://ar.wikipedia.org/wiki?curid=943040[0m
    حتى عام 2015، مُنِحَت الجائزة إلى 822 رجلًا و48 امرأة و26 منظمة. فازت 16 امرأة بجائزة نوبل للسلام و14 في مجال الأدب و12 في مجال الطب أو علم وظائف الأعضاء و4 في مجال الكيمياء واثنتان في مجال الفيزياء وفازت واحدة وهي إلينور أوستروم بجائزة نوبل التذكارية في العلوم الاقتصادية. وكانت ماري كوري هي أول امرأة تفوز بجائزة نوبل، وحصلت عليها في مجال الفيزياء عام 1903 مشاركة مع زوجها بيار كوري وهنري بيكريل. وتعتبر ماري أيضًا المرأة الوحيدة التي تفوز بالجائزة مرتين، حيث فازت أيضًا بجائزة نوبل للكيمياء عام 1911. وبفوز إيرين جوليو-كوري -ابنة ماري كوري- بجائزة نوبل في الكيمياء عام 1935، جعلهما ذلك أول ثنائي من أمٍ وابنتها يفوز بالجائزة. أما عن أكثر عامٍ شهد فوز النساء بجوائز نوبل فكان عام 2009، حينها توجت خمسة نساء بالجوائز.
    
    [95mقائمة المسيحيين الحاصلين على جائزة نوبل (90) [0m
    [4mhttps://ar.wikipedia.org/wiki?curid=2167043[0m
    جدير بالذكر أنّ الفرد نوبل المهندس ومخترع الديناميت والكيميائي السويدي، والذي سميَّت جائزة نوبل بإسمه؛ كان مسيحيًا ملتزمًا وعضوًا في الكنيسة اللوثرية السويديَّة.
    


The query can also be in any other language. Here are the French results to a query in Spanish.


```python
spanish_query = "Quien descubrio la penicilina?"
french_results = dense_retrieval(spanish_query, results_lang='fr')
print_result(french_results)
```

    [95mPénicilline (1000) [0m
    [4mhttps://fr.wikipedia.org/wiki?curid=92634[0m
    La pénicilline (pénicilline G) fut découverte le , concentrée et surtout nommée par le Britannique Alexander Fleming. Elle a été introduite pour des thérapies à partir de 1941.
    
    [95mPénicilline (1000) [0m
    [4mhttps://fr.wikipedia.org/wiki?curid=92634[0m
    La pénicilline a été redécouverte accidentellement le par Alexander Fleming. Le chercheur écossais travailla ensuite plusieurs années à essayer de purifier cet antibiotique.
    
    [95mAlexander Fleming (800) [0m
    [4mhttps://fr.wikipedia.org/wiki?curid=27093[0m
    Huit ans plus tard, il découvrit la pénicilline par accident, lors de l'observation d'une moisissure qui tua les bactéries d'une de ses expériences, et surtout il comprit et fit comprendre son intérêt médical.
    
    [95mAlexander Fleming (800) [0m
    [4mhttps://fr.wikipedia.org/wiki?curid=27093[0m
    Sur sa découverte, Fleming publia en 1929 dans le "" un article qui attira peu l'attention. Il continua ses recherches, mais constata qu'il était difficile de cultiver le penicillium et, même quand on y arrivait, il était encore plus difficile d'en extraire la pénicilline. Son impression était que, du fait de ce problème de production en grande quantité et parce que son action lui semblait lente, la pénicilline n'aurait guère d'importance dans le traitement des infections. Fleming s'était également persuadé que la pénicilline ne subsisterait pas assez longtemps dans le corps humain pour tuer des bactéries. Un grand nombre de tests cliniques se révélèrent peu concluants, probablement du fait qu'elle y était utilisée comme antiseptique.
    
    [95mAlexander Fleming (800) [0m
    [4mhttps://fr.wikipedia.org/wiki?curid=27093[0m
    Ses découvertes les plus connues sont celle de l'antibiotique appelé pénicilline qu'il a isolée à partir du champignon "Penicillium notatum" en 1928, découverte pour laquelle il a partagé le prix Nobel de physiologie ou médecine avec Howard Walter Florey et Ernst Boris Chain en 1945, et celle de l'enzyme lysozyme en 1922.
    
    [95mAlexander Fleming (800) [0m
    [4mhttps://fr.wikipedia.org/wiki?curid=27093[0m
    Sa découverte de la pénicilline avait révolutionné le monde des médicaments en ouvrant l'ère des antibiotiques ; la découverte de la pénicilline a sauvé et sauve toujours des millions de personnes.
    
    [95mAlexander Fleming (800) [0m
    [4mhttps://fr.wikipedia.org/wiki?curid=27093[0m
    Ernst Chain trouva la façon d'isoler et de concentrer la pénicilline et il en théorisa correctement la structure. Peu de temps après que l'équipe eut publié ses premiers résultats en 1940, Fleming se présenta et demanda à voir où elle en était. Quand Chain lui eut demandé qui il était et que Fleming lui eut dit son nom, Chain s'écria
    
    [95mAlexander Fleming (800) [0m
    [4mhttps://fr.wikipedia.org/wiki?curid=27093[0m
    Fleming était modeste quant à sa participation à cette découverte et, en évoquant sa gloire, parlait du ; il réservait ses louanges à Florey et Chain qui avaient su transformer cette trouvaille de laboratoire en un médicament utilisable. Fleming avait tout de même été le premier à isoler la substance active, et lui avait donné son nom : pénicilline. C'est lui aussi qui pendant douze ans avait conservé, cultivé et distribué la moisissure originale, et jusqu'en 1940 il avait continué à tenter de convaincre tout chimiste assez habile de la préparer sous une forme stable, susceptible d'être produite en masse. Beaucoup de tentatives échouèrent dans l'entourage de Fleming quand on voulut stabiliser la substance avant que Florey, en 1938, eût organisé à Oxford une équipe de recherche biochimique nombreuse et expérimentée. C'est seulement alors qu'on put commencer ce travail immense et révolutionnaire.
    
    [95mAntibiotique (1000) [0m
    [4mhttps://fr.wikipedia.org/wiki?curid=5128[0m
    Le premier antibiotique identifié fut la pénicilline. Si dès la fin du Ernest Duchesne découvrit les propriétés curatives de "Penicillium glaucum", la découverte de la pénicilline est à mettre au crédit de Sir Alexander Fleming qui s’aperçut en 1928 que certaines de ses cultures bactériennes dans des boîtes oubliées avaient été contaminées par les expériences de son voisin de paillasse étudiant le champignon "Penicillium notatum" et que celui-ci inhibait leur reproduction. Mais l’importance de cette découverte, ses implications et ses utilisations médicales ne furent comprises et élaborées qu’après sa redécouverte, entre les deux grandes guerres notamment à la suite des travaux de Howard Walter Florey, Ernst Chain, et en 1939.
    
    [95mPlatine (1000) [0m
    [4mhttps://fr.wikipedia.org/wiki?curid=22918[0m
    Le curieux métal platine ne fut vraiment étudié pour lui-même que par le militaire et astronome Antonio de Ulloa (1716 – 1795), qui avec Jorge Juan y Santacilia (1713 – 1773), avait été chargé par le roi Philippe V d'Espagne de rejoindre la mission scientifique française au Pérou (1735 – 1745). Parmi d’autres objets selon lui inédits, Ulloa observa le "platina del pinto", un métal inexploitable trouvé avec l’or de Nouvelle-Grenade (Colombie).
    


# ReRank

This section accompanies the [Reranking](https://docs.cohere.com/docs/reranking-2) chapter of LLM University.

Rerank is a powerful method that will enhance any search model. In short, rerank takes a query and a set of responses (or documents), and will surface the ones that are the most relevant as answers to the query. We'll use Rerank to improve keyword search with the hard query.


```python
def rerank_responses(query, responses, num_responses=3):
    reranked_responses = co.rerank(
        query = query,
        documents = responses,
        top_n = num_responses,
        model = 'rerank-english-v3.0',
        return_documents=True
    )
    return reranked_responses
```


```python
hard_query = "Who was the first person to win two nobel prizes?"
keyword_searches_to_improve = keyword_search(hard_query, num_results = 100)
```


```python
for r in keyword_searches_to_improve[:20]:
    print(r['title'], ':', r['text'])
```

    Neutrino : In the 1960s, the now-famous Homestake experiment made the first measurement of the flux of electron neutrinos arriving from the core of the Sun and found a value that was between one third and one half the number predicted by the Standard Solar Model. This discrepancy, which became known as the solar neutrino problem, remained unresolved for some thirty years, while possible problems with both the experiment and the solar model were investigated, but none could be found. Eventually, it was realized that both were actually correct and that the discrepancy between them was due to neutrinos being more complex than was previously assumed. It was postulated that the three neutrinos had nonzero and slightly different masses, and could therefore oscillate into undetectable flavors on their flight to the Earth. This hypothesis was investigated by a new series of experiments, thereby opening a new major field of research that still continues. Eventual confirmation of the phenomenon of neutrino oscillation led to two Nobel prizes, to R. Davis, who conceived and led the Homestake experiment, and to A.B. McDonald, who led the SNO experiment, which could detect all of the neutrino flavors and found no deficit.
    Western culture : By the will of the Swedish inventor Alfred Nobel the Nobel Prizes were established in 1895. The prizes in Chemistry, Literature, Peace, Physics, and Physiology or Medicine were first awarded in 1901. The percentage of ethnically European Nobel prize winners during the first and second halves of the 20th century were respectively 98 and 94 percent.
    Reality television : Game shows like "Weakest Link", "Who Wants to Be a Millionaire?", "American Gladiators" and "Deal or No Deal", which were popular in the 2000s, also lie in a gray area: like traditional game shows (e.g., "The Price Is Right", "Jeopardy!"), the action takes place in an enclosed television studio over a short period of time; however, they have higher production values, more dramatic background music, and higher stakes than traditional shows (done either through putting contestants into physical danger or offering large cash prizes). In addition, there is more interaction between contestants and hosts, and in some cases, they feature reality-style contestant competition or elimination as well. These factors, as well as these shows' rise in global popularity at the same time as the arrival of the reality craze, have led to such shows often being grouped under both the reality television and game show umbrellas. There have been various hybrid reality-competition shows, like the worldwide-syndicated "Star Academy", which combines the "Big Brother" and "Idol" formats, "The Biggest Loser", which combines competition with the self-improvement format, and "American Inventor", which uses the "Idol" format for products instead of people. Some reality shows that aired mostly during the early 2000s, such as "Popstars", "Making the Band" and "Project Greenlight", devoted the first part of the season to selecting a winner, and the second part to showing that person or group of people working on a project.
    Peter Mullan : Mullan is an art house movie director. He won a Golden Lion at 59th Venice International Film Festival for "The Magdalene Sisters" (2002), listed by many critics among the best films of 2003 and nominated for BAFTA Award for Best British Film and European Film Award for best film, and a Golden Shell at San Sebastián International Film Festival for "Neds" (2010). He is the only person to win top prizes both for acting (Cannes Best Actor award for "My Name Is Joe") and for the best film (Golden Lion for "The Magdalene Sisters") at major European film festivals.
    Indiana Pacers : From 1989 to 1993, the Pacers would play at or near .500 and qualify for the playoffs; in 1989–90, the Pacers parlayed a fast start into the team's third playoff appearance under coach Bob Hill. But the Pacers were swept by the Detroit Pistons, who would go on to win their second consecutive NBA Championship. Reggie Miller became the first Pacer to play in the All-Star Game since 1976 on the strength of his 24.6 points-per-game average. Despite four straight first-round exits, this period was highlighted by a first-round series with the Boston Celtics in 1991 that went to Game 5. The next season, the Pacers returned to the playoffs in 1992 and met the Celtics for the second year in a row. But this time, the Celtics left no doubt who was the better team, as they swept the Pacers in three straight games. Chuck Person and point guard Micheal Williams were traded to the Minnesota Timberwolves in the off-season, and the Pacers got Pooh Richardson and Sam Mitchell in return. For the 1992–93 season, Detlef Schrempf moved from sixth man to the starter at small forward and was elected to his first All-Star game. Meanwhile, Miller became the Pacers' all-time NBA era leading scorer during this season (4th overall). The Pacers returned to the playoffs with a 41–41 record, but lost to the New York Knicks in the first round, three games to one.
    William Regal : On 30 June, Regal was sent to SmackDown! as part of an eleven-person trade during the draft. His first match on "SmackDown!" was on 7 July against Matt Morgan in what was to be Morgan's final WWE match. It was interrupted before Regal was even able to enter the ring by Mexicools. His first full match as part of the roster was a loss to Chris Benoit in a catch wrestling match on 16 July episode of "Velocity". On 4 August, Regal was scheduled to go one on one with Scotty 2 Hotty, but the Mexicools came in and attacked both men. Two weeks later, they teamed up on "SmackDown!" against Psicosis and Super Crazy with Juventud in their corner. Halfway through the match, Regal betrayed Scotty by refusing to tag him and walked out of the ring with a smirk on his face, turning heel as a result and allowing the Mexicools to pick up the win. Two days later, Regal cut a promo telling the crowd that he had returned to his former self, referring to himself as a "scoundrel" and a "rogue". The promo ended when Scotty ran to the ring and attacked Regal. The following week, a match between the two was cut short when the debuting Paul Burchill interfered to aid his countryman. Regal went on to take Burchill under his wing and tag with him on the hunt for the WWE Tag Team Championship, but the team's biggest exposure was a loss in a handicap match against Bobby Lashley at Armageddon.
    Nobel Prize : The Nobel Foundation was founded as a private organization on 29 June 1900. Its function is to manage the finances and administration of the Nobel Prizes. In accordance with Nobel's will, the primary task of the foundation is to manage the fortune Nobel left. Robert and Ludvig Nobel were involved in the oil business in Azerbaijan, and according to Swedish historian E. Bargengren, who accessed the Nobel family archive, it was this "decision to allow withdrawal of Alfred's money from Baku that became the decisive factor that enabled the Nobel Prizes to be established". Another important task of the Nobel Foundation is to market the prizes internationally and to oversee informal administration related to the prizes. The foundation is not involved in the process of selecting the Nobel laureates. In many ways, the Nobel Foundation is similar to an investment company, in that it invests Nobel's money to create a solid funding base for the prizes and the administrative activities. The Nobel Foundation is exempt from all taxes in Sweden (since 1946) and from investment taxes in the United States (since 1953). Since the 1980s, the foundation's investments have become more profitable and as of 31 December 2007, the assets controlled by the Nobel Foundation amounted to 3.628 billion Swedish "kronor" (c. US$560 million).
    Nobel Prize : In terms of the most prestigious awards in STEM fields, only a small proportion have been awarded to women. Out of 210 laureates in Physics, 181 in Chemistry and 216 in Medicine between 1901 and 2018, there were only three female laureates in physics, five in chemistry and 12 in medicine. Factors proposed to contribute to the discrepancy between this and the roughly equal human sex ratio include biased nominations, fewer women than men being active in the relevant fields, Nobel Prizes typically being awarded decades after the research was done (reflecting a time when gender bias in the relevant fields was greater), a greater delay in awarding Nobel Prizes for women's achievements making longevity a more important factor for women (one cannot be nominated for the Nobel Prize posthumously), and a tendency to omit women from jointly awarded Nobel Prizes. Despite these factors, Marie Curie is to date the only person awarded Nobel Prizes in two different sciences (Physics in 1903, Chemistry in 1911); she is one of only three people who have received two Nobel Prizes in sciences (see Multiple laureates below). Malala Yousafzai is the youngest person ever to be awarded the Nobel Peace Prize. When she received it in 2014, she was only 17 years old.
    Nobel Prize : The Nobel Prizes ( ; ; ) are five separate prizes that, according to Alfred Nobel's will of 1895, are awarded to "those who, during the preceding year, have conferred the greatest benefit to humankind." Alfred Nobel was a Swedish chemist, engineer, and industrialist most famously known for the invention of dynamite. He died in 1896. In his will, he bequeathed all of his "remaining realisable assets" to be used to establish five prizes which became known as "Nobel Prizes." Nobel Prizes were first awarded in 1901.
    Noble gas : Ramsay continued his search for these gases using the method of fractional distillation to separate liquid air into several components. In 1898, he discovered the elements krypton, neon, and xenon, and named them after the Greek words (, "hidden"), (, "new"), and (, "stranger"), respectively. Radon was first identified in 1898 by Friedrich Ernst Dorn, and was named "radium emanation", but was not considered a noble gas until 1904 when its characteristics were found to be similar to those of other noble gases. Rayleigh and Ramsay received the 1904 Nobel Prizes in Physics and in Chemistry, respectively, for their discovery of the noble gases; in the words of J. E. Cederblom, then president of the Royal Swedish Academy of Sciences, "the discovery of an entirely new group of elements, of which no single representative had been known with any certainty, is something utterly unique in the history of chemistry, being intrinsically an advance in science of peculiar significance".
    Nobel Prize in Literature : The Nobel Prize in Literature is not the only literary prize for which all nationalities are eligible. Other notable international literary prizes include the Neustadt International Prize for Literature, the Franz Kafka Prize, the International Booker Prize when it was previously awarded for a writer's entire body of work, and in the 1960s the Formentor Prix International. In contrast to the other prizes mentioned, the Neustadt International Prize is awarded biennially. The journalist Hephzibah Anderson has noted that the International Booker Prize "is fast becoming the more significant award, appearing an ever more competent alternative to the Nobel". However since 2016 the International Booker Prize now recognises an annual book of fiction translated into English. Previous winners of the International Booker Prize who have gone on to win the Nobel Prize in Literature include Alice Munro and Olga Tokarczuk. The Neustadt International Prize for Literature is regarded as one of the most prestigious international literary prizes, often referred to as the American equivalent to the Nobel Prize. Like the Nobel Prize, it is awarded not for any one work, but for an entire body of work. It is frequently seen as an indicator of who may be awarded the Nobel Prize in Literature. Gabriel García Márquez (1972 Neustadt, 1982 Nobel), Czesław Miłosz (1978 Neustadt, 1980 Nobel), Octavio Paz (1982 Neustadt, 1990 Nobel), Tomas Tranströmer (1990 Neustadt, 2011 Nobel) were first awarded the Neustadt International Prize for Literature before being awarded the Nobel Prize in Literature.
    D.C. United : Following Soehn's replacement, the organization hired Curt Onalfo as the head coach, who has recently been terminated as manager for Kansas City Wizards (now Sporting Kansas City). United had approached then University of Akron men's soccer head coach, Caleb Porter, but Porter rejected their offer. Recently retired club midfielder, Ben Olsen, joined Onalfo's staff as an assistant coach, along with Kris Kelderman, who served as an assistant to Onfalo at Kansas City. Additionally, Soehn's assistant coaches of Chad Ashton and Mark Simpson remained on Onalfo's coaching staff for the 2010 season. Ahead of the season the club saw the departures of Luciano Emilio and Fred, two key contributors to the club during the late 2000s. The club, marred by injuries, and poor tactics, had a historically poor start to the 2010 MLS season, having a record of 3-12-3 in the clubs first 16 matches. In August 2010, United fired Onalfo and named Ben Olsen as the club's interim manager for the remainder of the 2010 season. The club would finish the season out with a 3-8-1 record, finishing with a historically poor 6-20-4 record, the worst in MLS during the 2010 season. During the 2010 season, the highlights of the season included the rise of two homegrown signings, Bill Hamid, who took over as starting goalkeeper to Troy Perkins during the season, and became the club's first choice goalkeeper throughout the 2010s, along with Andy Najar, who won the MLS Rookie of the Year Award (now Young Player of the Year), becoming the first homegrown player to win the honor. Following the end of the 2010 season, long-time United striker Jamie Moreno retired from professional soccer.
    Nobel Prize in Literature : Alfred Nobel stipulated in his last will and testament that his money be used to create a series of prizes for those who confer the "greatest benefit on mankind" in physics, chemistry, peace, physiology or medicine, and literature. Though Nobel wrote several wills during his lifetime, the last was written a little over a year before he died, and signed at the Swedish-Norwegian Club in Paris on 27 November 1895. Nobel bequeathed 94% of his total assets, 31 million Swedish "kronor" (US$198 million, €176 million in 2016), to establish and endow the five Nobel Prizes. Due to the level of scepticism surrounding the will, it was not until 26 April 1897 that the Storting (Norwegian Parliament) approved it. The executors of his will were Ragnar Sohlman and Rudolf Lilljequist, who formed the Nobel Foundation to take care of Nobel's fortune and organise the prizes.
    2021–22 Manchester United F.C. season : November began with Manchester United playing host to their local rivals Manchester City at Old Trafford. Eric Bailly started in place of Varane, who had been injured in the Champions League match against Atalanta four days earlier, and it was the Ivorian defender who opened the scoring, albeit for the away side, as he put João Cancelo's cross into his own net. Bernardo Silva doubled City's lead just before half-time, when Bailly was substituted by Jadon Sancho. City remained the more likely of the two sides to score in the second half, but De Gea was able to keep them out for the remainder of the game, and United went into the international break nine points behind league leaders Chelsea as City won a league match against United for the first time since 24 April 2019. On 20 November 2021, United suffered a 4–1 defeat to newly promoted Watford, leaving the Red Devils seventh in the table. United academy graduate Joshua King opened the scoring before De Gea saved a penalty from Ismaïla Sarr (as well as the original, which had to be retaken for encroachment); however, Sarr did eventually score just before half-time. Donny van de Beek scored his first goal of the season five minutes into the second half, but Maguire was sent off for a second yellow card midway through the period. As United searched for an equaliser, João Pedro and Emmanuel Dennis scored in added time to confirm Watford's victory. It was announced the following day that Solskjær had left his role by mutual consent and that Michael Carrick had replaced him as caretaker manager. In Carrick's first Premier League match in charge, which made him the first English manager to lead United in a league match since Ron Atkinson in November 1986, United visited Chelsea at Stamford Bridge. United opened the scoring after Jorginho miscontrolled a long clearance from Fernandes, allowing Sancho to take advantage of a two-on-one with Édouard Mendy and score his first league goal for United; however, Jorginho made up for his mistake from the penalty spot, after Aaron Wan-Bissaka had fouled Thiago Silva in the penalty area, and the match finished 1–1, making Chelsea still seeking their first league win against United since November 2017.
    Nobel Prize : Alfred Nobel left his fortune to finance annual prizes to be awarded "to those who, during the preceding year, shall have conferred the greatest benefit on mankind". He stated that the Nobel Prizes in Physics should be given "to the person who shall have made the most important 'discovery' or 'invention' within the field of physics". Nobel did not emphasise discoveries, but they have historically been held in higher respect by the Nobel Prize Committee than inventions: 77% of the Physics Prizes have been given to discoveries, compared with only 23% to inventions. Christoph Bartneck and Matthias Rauterberg, in papers published in "Nature" and "Technoetic Arts", have argued this emphasis on discoveries has moved the Nobel Prize away from its original intention of rewarding the greatest contribution to society.
    Nobel Prize : Nobel wrote several wills during his lifetime. He composed the last over a year before he died, signing it at the Swedish–Norwegian Club in Paris on 27 November 1895. To widespread astonishment, Nobel's last will specified that his fortune be used to create a series of prizes for those who confer the "greatest benefit on mankind" in physics, chemistry, physiology or medicine, literature, and peace. Nobel bequeathed 94% of his total assets, 31 million SEK (c. US$186 million, €150 million in 2008), to establish the five Nobel Prizes. Owing to skepticism surrounding the will, it was not approved by the Storting in Norway until 26 April 1897. The executors of the will, Ragnar Sohlman and Rudolf Lilljequist, formed the Nobel Foundation to take care of the fortune and to organise the awarding of prizes.
    Zach LaVine : On July 6, 2018, the restricted free agent LaVine received a four-year, $80 million offer sheet from the Sacramento Kings. Two days later, the Bulls exercised their right of first refusal and matched the offer sheet extended to LaVine by the Kings. LaVine scored at least 30 points in each of the Bulls' first three games of the season, becoming the third Chicago player to do so, joining Michael Jordan (1986) and Bob Love (1971). On October 24, he made two free throws with 0.5 seconds left to lift the Bulls to a 112–110 win over the Charlotte Hornets. He finished with 32 points for his fourth straight 30-point game to start the season. On November 5, he scored a career-high 41 points, including the game-winning free throw with 0.2 seconds left, as the Bulls beat the New York Knicks 116–115 in double overtime. On November 10, he scored 24 points in a 99–98 win over the Cleveland Cavaliers, thus scoring 20 or more points in each of Chicago's 13 games to begin the season and in a career-high 14 straight overall, dating to his final game of 2017–18. The last Bulls player to score 20-plus points in 14 consecutive games was Jimmy Butler, who did it 15 straight times in 2016. He scored 26 points against the Dallas Mavericks on November 12 for 15 straight, before a 10-point game on November 14 against the Boston Celtics ended the streak. On December 26, after missing five games with a sprained left ankle, LaVine had 28 points in 26 minutes off the bench in a 119–94 loss to the Timberwolves.
    2011 Formula One World Championship : At the , Vettel took once again pole position, beating Hamilton by half a second, but it was the fourth-starting Fernando Alonso who led the race going into the first corner. Vitantonio Liuzzi made contact with Kovalainen and lost control, sliding off the grass and crashing heavily into Rosberg and Petrov and triggering the safety car. Vettel took the lead from Alonso one lap after the restart, while Schumacher overtook Hamilton. Mark Webber attempted to pass Felipe Massa, but the two made contact, pitching Massa into a spin. Webber continued with a broken front wing, crashing at Parabolica as he attempted to return to pit. Further down the order, Schumacher received several carefully worded instructions from team principal Ross Brawn, reminding him not to cut across the track to defend against Hamilton. Schumacher's duel with Hamilton slowed them down enough for Jenson Button to catch up; where Hamilton took thirty laps to pass Schumacher, Button passed him on his first attempt and started catching the second-placed Alonso. Vettel went on to win the race, extending his lead enough that he would need just one more win to win his second World Championship. Webber's failure to finish meant that he fell to fourth in the drivers' standings, behind Alonso and Button, while Hamilton's fourth place meant he fell further behind in the championship.
    2021–22 Manchester United F.C. season : As a Premier League side, Manchester United entered the FA Cup in the Third Round Proper. The draw took place on 6 December, and United were given a home draw with Aston Villa. The match was played on 10 January 2022. Villa had two goals disallowed for offside as Scott McTominay scored the only goal in a 1–0 win for United. United drew Championship side Middlesbrough in the Fourth Round Proper. Cristiano Ronaldo missed a penalty five minutes before Jadon Sancho opened the scoring. A handball by former United academy player Duncan Watmore was correctly ruled accidental by referee Anthony Taylor and video assistant referee Stuart Attwell per the new IFAB rule, meaning the 64th-minute equaliser from Matt Crooks, who also formerly a United academy player, stood. After going through extra time, United and Middlesbrough scored all their first seven penalties in the shoot-out, including one from former United defender Paddy McNair. Lee Peltier scored the eighth penalty before Anthony Elanga missed his and condemned United to their earliest FA Cup exit since the third round defeat in the 2013–14 season and the first time in the fourth round since 2011–12. This was also United's first FA Cup elimination by a lower division side since their elimination by Leeds United, then a Championship side as well, in the 2009–10 third round and the first FA Cup defeat on penalties since the 2008–09 semi-finals, as they are yet to win an FA Cup match shoot-out. For Middlesbrough, this was their second consecutive cup triumph over United, having also won on penalties at Old Trafford in the 2015–16 League Cup fourth round.
    Christians : Christians have made noted contributions to a range of fields, including philosophy, science and technology, medicine, fine arts and architecture, politics, literatures, music, and business. According to "100 Years of Nobel Prizes" a review of the Nobel Prizes award between 1901 and 2000 reveals that (65.4%) of Nobel Prizes Laureates, have identified Christianity in its various forms as their religious preference.



```python
reranked_keyword_responses = rerank_responses(hard_query, keyword_searches_to_improve, num_responses=3)
```


```python
for idx, r in enumerate(reranked_keyword_responses.results):
    print(f"Document Rank: {idx + 1}, Document Index: {r.index}")
    print(f"Title: {r.document.title}")
    print(f"URL: {r.document.url}")
    print(f"Document: {r.document.text}")
    print(f"Relevance Score: {r.relevance_score:.2f}")
    print("\n")
```

    Document Rank: 1, Document Index: 30
    Title: Nobel Prize
    URL: https://en.wikipedia.org/wiki?curid=21201
    Document: Five people have received two Nobel Prizes. Marie Curie received the Physics Prize in 1903 for her work on radioactivity and the Chemistry Prize in 1911 for the isolation of pure radium, making her the only person to be awarded a Nobel Prize in two different sciences. Linus Pauling was awarded the 1954 Chemistry Prize for his research into the chemical bond and its application to the structure of complex substances. Pauling was also awarded the Peace Prize in 1962 for his activism against nuclear weapons, making him the only laureate of two unshared prizes. John Bardeen received the Physics Prize twice: in 1956 for the invention of the transistor and in 1972 for the theory of superconductivity. Frederick Sanger received the prize twice in Chemistry: in 1958 for determining the structure of the insulin molecule and in 1980 for inventing a method of determining base sequences in DNA. Karl Barry Sharpless was awarded the 2001 Chemistry Prize for his research into chirally catalysed oxidation reactions, and the 2022 Chemistry Prize for click chemistry.
    Relevance Score: 1.00
    
    
    Document Rank: 2, Document Index: 7
    Title: Nobel Prize
    URL: https://en.wikipedia.org/wiki?curid=21201
    Document: In terms of the most prestigious awards in STEM fields, only a small proportion have been awarded to women. Out of 210 laureates in Physics, 181 in Chemistry and 216 in Medicine between 1901 and 2018, there were only three female laureates in physics, five in chemistry and 12 in medicine. Factors proposed to contribute to the discrepancy between this and the roughly equal human sex ratio include biased nominations, fewer women than men being active in the relevant fields, Nobel Prizes typically being awarded decades after the research was done (reflecting a time when gender bias in the relevant fields was greater), a greater delay in awarding Nobel Prizes for women's achievements making longevity a more important factor for women (one cannot be nominated for the Nobel Prize posthumously), and a tendency to omit women from jointly awarded Nobel Prizes. Despite these factors, Marie Curie is to date the only person awarded Nobel Prizes in two different sciences (Physics in 1903, Chemistry in 1911); she is one of only three people who have received two Nobel Prizes in sciences (see Multiple laureates below). Malala Yousafzai is the youngest person ever to be awarded the Nobel Peace Prize. When she received it in 2014, she was only 17 years old.
    Relevance Score: 0.97
    
    
    Document Rank: 3, Document Index: 46
    Title: Nobel Prize in Literature
    URL: https://en.wikipedia.org/wiki?curid=23385442
    Document: There are also prizes for honouring the lifetime achievement of writers in specific languages, like the Miguel de Cervantes Prize (for Spanish language, established in 1976) and the Camões Prize (for Portuguese language, established in 1989). Nobel laureates who were also awarded the Miguel de Cervantes Prize include Octavio Paz (1981 Cervantes, 1990 Nobel); Mario Vargas Llosa (1994 Cervantes, 2010 Nobel); and Camilo José Cela (1995 Cervantes, 1989 Nobel). José Saramago is the only author to receive both the Camões Prize (1995) and the Nobel Prize (1998) to date.
    Relevance Score: 0.87
    
    


# Generating responses

This section accompanies the [Generating Answers](https://docs.cohere.com/docs/generating-answers) chapter of LLM University.

Generative models are great at talking, but when it comes to answer questions with facts, they are prone to hallucinations. In other words, they can answer with the wrong answer. To prevent this, we first search for the documents that are relevant to the query (using dense retrieval, but we can use any method). We then feed them to the generative model, and instruct it to answer the question from the information from those documents.

The query is "How many people have won more than one Nobel prize?". You will notice that the model generates wrong answers, but when combined with search, it'll generate the correct answers.


```python
query = "How many people have won more than one Nobel prize?"
```


```python
prediction_without_search = [
    co.chat(
        message=query,
        max_tokens=50,
    ) for _ in range(5)
]
```


```python
for p in prediction_without_search:
    print(p.text)
```

    Marie Skłodowska-Curie, a Polish and naturalized French physicist and chemist, won the Nobel Prize twice. She received the Nobel Prize in Physics in 1903 along with her husband Pierre Curie and Henri Becquerel for their pioneering work
    Marie Skłodowska-Curie, a Polish physicist and chemist, won the Nobel Prize twice: once in physics and once in chemistry. She was awarded the Nobel Prize in Physics in 1903 along with her husband, Pierre Curie, and
    Marie Skłodowska-Curie, a Polish and naturalized French physicist and chemist, won the Nobel Prize in Physics in 1903 and the Nobel Prize in Chemistry in 1911. She is the only person to have won multiple
    Marie Skłodowska-Curie, a Polish and naturalized French physicist and chemist, won the Nobel Prize twice. She received the Nobel Prize in Physics in 1903 along with her husband, Pierre Curie, and Henri Becquerel for their
    Marie Skłodowska-Curie, a Polish and naturalized French physicist and chemist, is the only person to have won multiple Nobel prizes. She won the Nobel Prize in Physics in 1903 and the Nobel Prize in Chemistry in 19



```python
responses = dense_retrieval(query, num_results=20)
print_result(responses)
```

    [95mNobel Peace Prize (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=26230922[0m
    , the Peace Prize has been awarded to 110 individuals and 27 organizations. 18 women have won the Nobel Peace Prize, more than any other Nobel Prize. Only two recipients have won multiple Prizes: the International Committee of the Red Cross has won three times (1917, 1944, and 1963) and the Office of the United Nations High Commissioner for Refugees has won twice (1954 and 1981). Lê Đức Thọ is the only person who refused to accept the Nobel Peace Prize.
    
    [95mNobel Prize (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=21201[0m
    The strict rule against awarding a prize to more than three people is also controversial. When a prize is awarded to recognise an achievement by a team of more than three collaborators, one or more will miss out. For example, in 2002, the prize was awarded to Koichi Tanaka and John Fenn for the development of mass spectrometry in protein chemistry, an award that did not recognise the achievements of Franz Hillenkamp and Michael Karas of the Institute for Physical and Theoretical Chemistry at the University of Frankfurt.
    
    [95mNobel Prize (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=21201[0m
    The prize ceremonies take place annually. Each recipient (known as a "laureate") receives a gold medal, a diploma, and a monetary award. In 2021, the Nobel Prize monetary award is 10,000,000 SEK. A prize may not be shared among more than three individuals, although the Nobel Peace Prize can be awarded to organizations of more than three people. Although Nobel Prizes are not awarded posthumously, if a person is awarded a prize and dies before receiving it, the prize is presented.
    
    [95mNobel Prize (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=21201[0m
    Candidates can receive multiple nominations the same year. Gaston Ramon received a total of 155 nominations in physiology or medicine from 1930 to 1953, the last year with public nomination data for that award . He died in 1963 without being awarded. Pierre Paul Émile Roux received 115 nominations in physiology or medicine, and Arnold Sommerfeld received 84 in physics. These are the three most nominated scientists without awards in the data published . Otto Stern received 79 nominations in physics 1925–1943 before being awarded in 1943.
    
    [95mNobel Prize in Literature (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=23385442[0m
    The Nobel Prize in Literature has been awarded 115 times between 1901 and 2022 to 119 individuals: 102 men and 17 women. The prize has been shared between two individuals on four occasions. It was not awarded on seven occasions. The laureates have included writers in 25 different languages. The youngest laureate was Rudyard Kipling, who was 41 years old when he was awarded in 1907. The oldest laureate to receive the prize was Doris Lessing, who was 88 when she was awarded in 2007. It has been awarded posthumously once, to Erik Axel Karlfeldt in 1931. On some occasions the awarding institution the Swedish Academy have awarded the prize to its own members; Verner von Heidenstam in 1916, the posthumous prize to Karlfeldt in 1931, Pär Lagerkvist in 1951 and the shared prize to Eyvind Johnson and Harry Martinson in 1974. Selma Lagerlöf was elected a member of the Swedish Academy in 1914, five years after she was awarded the Nobel Prize in 1909. Two writers have declined the prize, Boris Pasternak in 1958 ("Accepted first, later caused by the authorities of his country (Soviet Union) to decline the Prize", according to the Nobel Foundation) and Jean-Paul Sartre in 1964.
    
    [95mNobel Prize (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=21201[0m
    The Nobel Prizes, beginning in 1901, and the Nobel Memorial Prize in Economic Sciences, beginning in 1969, have been awarded 609 times to 975 people and 25 organizations. Five individuals and two organisations have received more than one Nobel Prize.
    
    [95mNobel Prize (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=21201[0m
    The laureates are given a sum of money when they receive their prizes, in the form of a document confirming the amount awarded. The amount of prize money depends upon how much money the Nobel Foundation can award each year. The purse has increased since the 1980s, when the prize money was 880,000 SEK per prize (c. 2.6 million SEK altogether, US$350,000 today). In 2009, the monetary award was 10 million SEK (US$1.4 million). In June 2012, it was lowered to 8 million SEK. If two laureates share the prize in a category, the award grant is divided equally between the recipients. If there are three, the awarding committee has the option of dividing the grant equally, or awarding one-half to one recipient and one-quarter to each of the others. It is common for recipients to donate prize money to benefit scientific, cultural, or humanitarian causes.
    
    [95mNobel Prize (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=21201[0m
    The institutions meet to choose the laureate or laureates in each field by a majority vote. Their decision, which cannot be appealed, is announced immediately after the vote. A maximum of three laureates and two different works may be selected per award. Except for the Peace Prize, which can be awarded to institutions, the awards can only be given to individuals.
    
    [95mUnited Nations (3000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=31769[0m
    A number of agencies and individuals associated with the UN have won the Nobel Peace Prize in recognition of their work. Two secretaries-general, Dag Hammarskjöld and Kofi Annan, were each awarded the prize (in 1961 and 2001, respectively), as were Ralph Bunche (1950), a UN negotiator, René Cassin (1968), a contributor to the Universal Declaration of Human Rights, and the US Secretary of State Cordell Hull (1945), the latter for his role in the organization's founding. Lester B. Pearson, the Canadian Secretary of State for External Affairs, was awarded the prize in 1957 for his role in organizing the UN's first peacekeeping force to resolve the Suez Crisis. UNICEF won the prize in 1965, the International Labour Organization in 1969, the UN Peacekeeping Forces in 1988, the International Atomic Energy Agency (which reports to the UN) in 2005, and the UN-supported Organisation for the Prohibition of Chemical Weapons in 2013. The UN High Commissioner for Refugees was awarded in 1954 and 1981, becoming one of only two recipients to win the prize twice. The UN as a whole was awarded the prize in 2001, sharing it with Annan. In 2007, IPCC received the prize "for their efforts to build up and disseminate greater knowledge about man-made climate change, and to lay the foundations for the measures that are needed to counteract such change."
    
    [95mNobel Peace Prize (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=26230922[0m
    In 2009, a record 205 nominations were received, but the record was broken again in 2010 with 237 nominations; in 2011, the record was broken once again with 241 nominations. The statutes of the Nobel Foundation do not allow information about nominations, considerations, or investigations relating to awarding the prize to be made public for at least 50 years after a prize has been awarded. Over time, many individuals have become known as "Nobel Peace Prize Nominees", but this designation has no official standing, and means only that one of the thousands of eligible nominators suggested the person's name for consideration. Indeed, in 1939, Adolf Hitler received a satirical nomination from a member of the Swedish parliament, mocking the (serious but unsuccessful) nomination of Neville Chamberlain. Nominations from 1901 to 1967 have been released in a database.
    
    [95mNobel Prize (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=21201[0m
    The Curie family has received the most prizes, with four prizes awarded to five individual laureates. Marie Curie received the prizes in Physics (in 1903) and Chemistry (in 1911). Her husband, Pierre Curie, shared the 1903 Physics prize with her. Their daughter, Irène Joliot-Curie, received the Chemistry Prize in 1935 together with her husband Frédéric Joliot-Curie. In addition, the husband of Marie Curie's second daughter, Henry Labouisse, was the director of UNICEF when he accepted the Nobel Peace Prize in 1965 on that organisation's behalf.
    
    [95mNobel Prize (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=21201[0m
    Other high-profile individuals with widely recognised contributions to peace have been overlooked. In 2009, an article in "Foreign Policy" magazine identified seven people who "never won the prize, but should have". The list consisted of Gandhi, Eleanor Roosevelt, Václav Havel, Ken Saro-Wiwa, Sari Nusseibeh, Corazon Aquino, and Liu Xiaobo. Liu Xiaobo would go on to win the 2010 Nobel Peace Prize while imprisoned.
    
    [95mUnitarianism (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=32164[0m
    Eleven Nobel Prizes have been awarded to Unitarians: Robert Millikan and John Bardeen (twice) in physics; Emily Green Balch, Albert Schweitzer and Linus Pauling for peace; George Wald and David H. Hubel in medicine; Linus Pauling in chemistry; and Herbert A. Simon in economics.
    
    [95mNobel Prize (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=21201[0m
    Five people have received two Nobel Prizes. Marie Curie received the Physics Prize in 1903 for her work on radioactivity and the Chemistry Prize in 1911 for the isolation of pure radium, making her the only person to be awarded a Nobel Prize in two different sciences. Linus Pauling was awarded the 1954 Chemistry Prize for his research into the chemical bond and its application to the structure of complex substances. Pauling was also awarded the Peace Prize in 1962 for his activism against nuclear weapons, making him the only laureate of two unshared prizes. John Bardeen received the Physics Prize twice: in 1956 for the invention of the transistor and in 1972 for the theory of superconductivity. Frederick Sanger received the prize twice in Chemistry: in 1958 for determining the structure of the insulin molecule and in 1980 for inventing a method of determining base sequences in DNA. Karl Barry Sharpless was awarded the 2001 Chemistry Prize for his research into chirally catalysed oxidation reactions, and the 2022 Chemistry Prize for click chemistry.
    
    [95mNobel Prize (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=21201[0m
    The interval between the award and the accomplishment it recognises varies from discipline to discipline. The Literature Prize is typically awarded to recognise a cumulative lifetime body of work rather than a single achievement. The Peace Prize can also be awarded for a lifetime body of work. For example, 2008 laureate Martti Ahtisaari was awarded for his work to resolve international conflicts. However, they can also be awarded for specific recent events. For instance, Kofi Annan was awarded the 2001 Peace Prize just four years after becoming the Secretary-General of the United Nations. Similarly Yasser Arafat, Yitzhak Rabin, and Shimon Peres received the 1994 award, about a year after they successfully concluded the Oslo Accords. The most recent controversy was caused by awarding the 2009 Nobel Peace Prize to Barack Obama in his first year as US president.
    
    [95mFrance (4000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=5843419[0m
    As of 2022, France ranks fourth in the number of Nobel laureates, with 70 French people having been awarded a Nobel Prize. Twelve French mathematicians have received a Fields Medal, considered the most prestigious award in the field, making up one-fifth of total recipients, and second only to the United States.
    
    [95mNobel Prize (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=21201[0m
    Although posthumous nominations are not presently permitted, individuals who died in the months between their nomination and the decision of the prize committee were originally eligible to receive the prize. This has occurred twice: the 1931 Literature Prize awarded to Erik Axel Karlfeldt, and the 1961 Peace Prize awarded to UN Secretary General Dag Hammarskjöld. Since 1974, laureates must be thought alive at the time of the October announcement. There has been one laureate, William Vickrey, who in 1996 died after the prize (in Economics) was announced but before it could be presented. On 3 October 2011, the laureates for the Nobel Prize in Physiology or Medicine were announced; however, the committee was not aware that one of the laureates, Ralph M. Steinman, had died three days earlier. The committee was debating about Steinman's prize, since the rule is that the prize is not awarded posthumously. The committee later decided that as the decision to award Steinman the prize "was made in good faith", it would remain unchanged.
    
    [95mLiterature (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=18963870[0m
    Nobel Prizes in Literature have been awarded between 1901 and 2020 to 117 individuals: 101 men and 16 women. Selma Lagerlöf (1858 – 1940) was the first woman to win the Nobel Prize in Literature, which she was awarded in 1909. Additionally, she was the first woman to be granted a membership in The Swedish Academy in 1914.
    
    [95mProtestantism (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=25814008[0m
    According to "100 Years of Nobel Prize (2005)", a review of Nobel prizes awarded between 1901 and 2000, 65% of Nobel Prize Laureates, have identified Christianity in its various forms as their religious preference (423 prizes). While 32% have identified with Protestantism in its various forms (208 prizes), although Protestants are 12% to 13% of the world's population.
    
    [95mNobel Prize in Literature (2000) [0m
    [4mhttps://en.wikipedia.org/wiki?curid=23385442[0m
    The prize's focus on European men, and Swedes in particular, has been the subject of criticism, even from Swedish newspapers. The majority of laureates have been European, with Sweden itself receiving more prizes (8) than all of Asia (7, if Turkish Orhan Pamuk is included), as well as all of Latin America (7, if Saint Lucian Derek Walcott is included). In 2009, Horace Engdahl, then the permanent secretary of the Academy, declared that "Europe still is the centre of the literary world" and that "the US is too isolated, too insular. They don't translate enough and don't really participate in the big dialogue of literature."
    



```python
context = [r['text'] for r in responses]
context[:10]
```




    [', the Peace Prize has been awarded to 110 individuals and 27 organizations. 18 women have won the Nobel Peace Prize, more than any other Nobel Prize. Only two recipients have won multiple Prizes: the International Committee of the Red Cross has won three times (1917, 1944, and 1963) and the Office of the United Nations High Commissioner for Refugees has won twice (1954 and 1981). Lê Đức Thọ is the only person who refused to accept the Nobel Peace Prize.',
     'The strict rule against awarding a prize to more than three people is also controversial. When a prize is awarded to recognise an achievement by a team of more than three collaborators, one or more will miss out. For example, in 2002, the prize was awarded to Koichi Tanaka and John Fenn for the development of mass spectrometry in protein chemistry, an award that did not recognise the achievements of Franz Hillenkamp and Michael Karas of the Institute for Physical and Theoretical Chemistry at the University of Frankfurt.',
     'The prize ceremonies take place annually. Each recipient (known as a "laureate") receives a gold medal, a diploma, and a monetary award. In 2021, the Nobel Prize monetary award is 10,000,000 SEK. A prize may not be shared among more than three individuals, although the Nobel Peace Prize can be awarded to organizations of more than three people. Although Nobel Prizes are not awarded posthumously, if a person is awarded a prize and dies before receiving it, the prize is presented.',
     'Candidates can receive multiple nominations the same year. Gaston Ramon received a total of 155 nominations in physiology or medicine from 1930 to 1953, the last year with public nomination data for that award . He died in 1963 without being awarded. Pierre Paul Émile Roux received 115 nominations in physiology or medicine, and Arnold Sommerfeld received 84 in physics. These are the three most nominated scientists without awards in the data published . Otto Stern received 79 nominations in physics 1925–1943 before being awarded in 1943.',
     'The Nobel Prize in Literature has been awarded 115 times between 1901 and 2022 to 119 individuals: 102 men and 17 women. The prize has been shared between two individuals on four occasions. It was not awarded on seven occasions. The laureates have included writers in 25 different languages. The youngest laureate was Rudyard Kipling, who was 41 years old when he was awarded in 1907. The oldest laureate to receive the prize was Doris Lessing, who was 88 when she was awarded in 2007. It has been awarded posthumously once, to Erik Axel Karlfeldt in 1931. On some occasions the awarding institution the Swedish Academy have awarded the prize to its own members; Verner von Heidenstam in 1916, the posthumous prize to Karlfeldt in 1931, Pär Lagerkvist in 1951 and the shared prize to Eyvind Johnson and Harry Martinson in 1974. Selma Lagerlöf was elected a member of the Swedish Academy in 1914, five years after she was awarded the Nobel Prize in 1909. Two writers have declined the prize, Boris Pasternak in 1958 ("Accepted first, later caused by the authorities of his country (Soviet Union) to decline the Prize", according to the Nobel Foundation) and Jean-Paul Sartre in 1964.',
     'The Nobel Prizes, beginning in 1901, and the Nobel Memorial Prize in Economic Sciences, beginning in 1969, have been awarded 609 times to 975 people and 25 organizations. Five individuals and two organisations have received more than one Nobel Prize.',
     'The laureates are given a sum of money when they receive their prizes, in the form of a document confirming the amount awarded. The amount of prize money depends upon how much money the Nobel Foundation can award each year. The purse has increased since the 1980s, when the prize money was 880,000 SEK per prize (c. 2.6\xa0million SEK altogether, US$350,000 today). In 2009, the monetary award was 10\xa0million SEK (US$1.4\xa0million). In June 2012, it was lowered to 8\xa0million SEK. If two laureates share the prize in a category, the award grant is divided equally between the recipients. If there are three, the awarding committee has the option of dividing the grant equally, or awarding one-half to one recipient and one-quarter to each of the others. It is common for recipients to donate prize money to benefit scientific, cultural, or humanitarian causes.',
     'The institutions meet to choose the laureate or laureates in each field by a majority vote. Their decision, which cannot be appealed, is announced immediately after the vote. A maximum of three laureates and two different works may be selected per award. Except for the Peace Prize, which can be awarded to institutions, the awards can only be given to individuals.',
     'A number of agencies and individuals associated with the UN have won the Nobel Peace Prize in recognition of their work. Two secretaries-general, Dag Hammarskjöld and Kofi Annan, were each awarded the prize (in 1961 and 2001, respectively), as were Ralph Bunche (1950), a UN negotiator, René Cassin (1968), a contributor to the Universal Declaration of Human Rights, and the US Secretary of State Cordell Hull (1945), the latter for his role in the organization\'s founding. Lester B. Pearson, the Canadian Secretary of State for External Affairs, was awarded the prize in 1957 for his role in organizing the UN\'s first peacekeeping force to resolve the Suez Crisis. UNICEF won the prize in 1965, the International Labour Organization in 1969, the UN Peacekeeping Forces in 1988, the International Atomic Energy Agency (which reports to the UN) in 2005, and the UN-supported Organisation for the Prohibition of Chemical Weapons in 2013. The UN High Commissioner for Refugees was awarded in 1954 and 1981, becoming one of only two recipients to win the prize twice. The UN as a whole was awarded the prize in 2001, sharing it with Annan. In 2007, IPCC received the prize "for their efforts to build up and disseminate greater knowledge about man-made climate change, and to lay the foundations for the measures that are needed to counteract such change."',
     'In 2009, a record 205 nominations were received, but the record was broken again in 2010 with 237 nominations; in 2011, the record was broken once again with 241 nominations. The statutes of the Nobel Foundation do not allow information about nominations, considerations, or investigations relating to awarding the prize to be made public for at least 50 years after a prize has been awarded. Over time, many individuals have become known as "Nobel Peace Prize Nominees", but this designation has no official standing, and means only that one of the thousands of eligible nominators suggested the person\'s name for consideration. Indeed, in 1939, Adolf Hitler received a satirical nomination from a member of the Swedish parliament, mocking the (serious but unsuccessful) nomination of Neville Chamberlain. Nominations from 1901 to 1967 have been released in a database.']




```python
prompt = f"""
Use the information provided below to answer the questions at the end. If the answer to the question is not contained in the provided information, say "The answer is not in the context".
---
Context information:
{context}
---
Question: How many people have won more than one Nobel prize?
"""
```


```python
prediction_with_search = [
    co.chat(
        message=prompt,
        max_tokens=50)
    for _ in range(5)]
```


```python
for p in prediction_with_search:
    print(p.text)
```

    Five people have won multiple Nobel prizes, according to the information provided. However, the source also states that another individual, Lê Đức Thọ, refused to accept the prize, and is therefore not counted among the winners. This brings the total number of multiple
    Five people have won multiple Nobel prizes, according to the information provided. However, the source also states that another individual, Lê Đức Thọ, refused to accept the prize, and is therefore not counted among the winners. This brings the total number of multiple
    Five people have won multiple Nobel prizes, according to the information provided. However, the source also states that another individual, Lê Đức Thọ, refused to accept the prize, and is therefore not counted among the winners. This brings the total number of multiple
    Five people have won multiple Nobel prizes, according to the information provided. However, the source also states that another individual, Linus Pauling, was awarded two prizes but these were of different types, in different years. Marie Curie is the only person to
    Five people have won multiple Nobel prizes, according to the information provided. However, the source also states that another individual, Lê Đức Thọ, refused to accept the prize, and is therefore not counted among the winners. This brings the total number of multiple


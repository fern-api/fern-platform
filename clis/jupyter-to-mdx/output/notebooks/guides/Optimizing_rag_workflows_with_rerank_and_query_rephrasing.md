![image.png](/Users/catherinedeskur/Documents/Fern/fern-platform/clis/jupyter-to-mdx/output/notebooks/guides/Optimizing_rag_workflows_with_rerank_and_query_rephrasing_files/image.png)

# What is RAG?
## To understand RAG, we will work with the example of a company that wants to deploy a chatbot as an intelligent knowledge assistant. For the chatbot to be useful, it will need to be connected to the company’s knowledge base.

![image.png](/Users/catherinedeskur/Documents/Fern/fern-platform/clis/jupyter-to-mdx/output/notebooks/guides/Optimizing_rag_workflows_with_rerank_and_query_rephrasing_files/image.png)
![image-2.png](/Users/catherinedeskur/Documents/Fern/fern-platform/clis/jupyter-to-mdx/output/notebooks/guides/Optimizing_rag_workflows_with_rerank_and_query_rephrasing_files/image-2.png)

## RAG at a high level is a simple process...but there is a lot of subtle complexity
![image.png](/Users/catherinedeskur/Documents/Fern/fern-platform/clis/jupyter-to-mdx/output/notebooks/guides/Optimizing_rag_workflows_with_rerank_and_query_rephrasing_files/image.png)

## Lets start by getting some data and building out our search process

### In this case, we already loaded some data into AI search, we have an index that we can use to compare some search methods
![image.png](/Users/catherinedeskur/Documents/Fern/fern-platform/clis/jupyter-to-mdx/output/notebooks/guides/Optimizing_rag_workflows_with_rerank_and_query_rephrasing_files/image.png)

## Note
For the purposes of this demo, we created a vector index in advance. We used the trec-covid dataset along with Azure AI Search. For more instructions and a walkthrough of creating this index, please reference the [Cohere AI Search example here](https://github.com/Azure/azureml-examples/blob/main/sdk/python/foundation-models/cohere/cohere-aisearch-rag.ipynb).


### First lets look at vector search with our data and compare to lexical and hybrid


```python
import os
import cohere
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.search.documents.models import VectorizedQuery
```


```python
co = cohere.Client(os.environ['COHERE_API_KEY'])
```


```python
# Some credentials
search_service_endpoint = os.environ['search_service_endpoint']
key_credential = AzureKeyCredential(os.environ['key_credential'])
index_name = os.environ['index_name']
```


```python
# Set up our search client
search_client = SearchClient(
    endpoint=search_service_endpoint,
    index_name='build_demo',
    credential=key_credential
    )
```

#### We will create a helper function to compare our different search methods. It will use the same index, but leverage different search approaches


```python
# Search function to encode the query and search the index
def search(query, mode, rerank=False, n_docs=75):
    """
    Searches for documents based on the given query.

    Args:
        query (str): The search query.
        mode (str): The search mode ('semantic', 'lexical', or 'hybrid').
        rerank (bool): Whether to re-rank the results. Defaults to False.
        n_docs (int): The number of documents to retrieve. Defaults to 75.

    Returns:
        list: A list of search results.
    """
    query_embedding = co.embed(texts=[query], input_type='search_query', model='embed-english-v3.0').embeddings[0]
    vector_query = VectorizedQuery(vector=query_embedding, k_nearest_neighbors=n_docs, fields="vector")

    search_params = {
        'semantic': {
            'search_text': None,
            'vector_queries': [vector_query],
        },
        'lexical': {
            'search_text': query,
            'vector_queries': None,
        },
        'hybrid': {
            'search_text': query,
            'vector_queries': [vector_query],
        }
    }

    params = search_params.get(mode, search_params['lexical'])
    search_results = search_client.search(
        select=["id", "title", "text"],
        top=n_docs,
        **params
    )

    return [doc for doc in search_results]

```


```python
# So lets search for something
query = 'Have there been any studies on natural treatment for diabetes?'
```


```python
vector_results = search(query, mode='semantic')
```

### We can also get the keyword search results


```python
keyword_results = search(query, mode='lexical')
```

### Or both using Reciprocal Rank Fusion (RRF)


```python
hybrid_results = search(query, mode='hybrid')
```

### So lets see how they compare


```python
import pandas as pd
from IPython.display import display, HTML

pd.set_option('display.max_colwidth', 0)

df = pd.DataFrame()
df['semantic'] = vector_results
df['lexical'] = keyword_results
df['hybrid'] = hybrid_results
```


```python
# Convert DataFrame to HTML with custom styles
html = df[:5].to_html(escape=False)

# Display the DataFrame with custom styles
display(HTML(html))
```


<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>semantic</th>
      <th>lexical</th>
      <th>hybrid</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>{'text': 'The morbidity of type 2 diabetes mellitus (T2DM) has been increasing rapidly worldwide. Tangminling pill, consisting of ten Chinese herbal medications, is usually prescribed for T2DM in mainland China. Whether treatment with Tangminling can improve clinical outcomes of T2DM patients was still debated. Four studies comparing Tangminling vs. placebo treatment in T2DM patients were included and 767 T2DM patients were enrolled in our analyses. Tangminling treatment exhibited better efficacy than placebo in reducing hemoglobin A1c (HbA1c) (1.11 vs. 0.32%; pooled weighted mean difference [WMD]: 0.80; 95% confidence interval [CI]: 0.65–0.96; P<0.001), fasting plasma glucose (0.82 vs. −0.40 mM; WMD: 1.10; 95% CI: 0.56–1.64; P<0.001), 2-h postprandial glucose (2-hr PG) (2.81 vs. 1.11 mM; WMD: 1.80; 95% CI: 1.72–1.88; P<0.001), homeostatic model assessment-β level (4.28 vs. 0.41; WMD: 0.44; 95% CI: 0.27–0.61; P<0.001), waist circumference (WC) (1.04 vs. 0.36 cm; WMD: 0.78; 95% CI: 0.37–1.19; P<0.001) and body weight index (0.37 vs. 0.11 kg/m(2); WMD: 0.30; 95% CI: −0.00 to 0.61; P=0.05). Tangminling pill might reduce glucose level and body weight and improve β-cell function in T2DM patients. Our study highlights the important role of Tangminling pill in the management of T2DM.', 'id': 'a334btay', 'title': 'Efficacy of traditional Chinese medication Tangminling pill in Chinese patients with type 2 diabetes', '@search.score': 0.6936568, '@search.reranker_score': None, '@search.highlights': None, '@search.captions': None}</td>
      <td>{'text': 'The high prevalence of type 2 diabetes mellitus in the world as well as the increasing reports about the adverse side effects of the existing diabetes treatment drugs have made developing new and effective drugs against the disease a very high priority. In this study, we report ten novel compounds found by targeting peroxisome proliferator-activated receptors (PPARs) using virtual screening and core hopping approaches. PPARs have drawn increasing attention for developing novel drugs to treat diabetes due to their unique functions in regulating glucose, lipid, and cholesterol metabolism. The reported compounds are featured with dual functions, and hence belong to the category of dual agonists. Compared with the single PPAR agonists, the dual PPAR agonists, formed by combining the lipid benefit of PPARα agonists (such as fibrates) and the glycemic advantages of the PPARγ agonists (such as thiazolidinediones), are much more powerful in treating diabetes because they can enhance metabolic effects while minimizing the side effects. This was observed in the studies on molecular dynamics simulations, as well as on absorption, distribution, metabolism, and excretion, that these novel dual agonists not only possessed the same function as ragaglitazar (an investigational drug developed by Novo Nordisk for treating type 2 diabetes) did in activating PPARα and PPARγ, but they also had more favorable conformation for binding to the two receptors. Moreover, the residues involved in forming the binding pockets of PPARα and PPARγ among the top ten compounds are explicitly presented, and this will be very useful for the in-depth conduction of mutagenesis experiments. It is anticipated that the ten compounds may become potential drug candidates, or at the very least, the findings reported here may stimulate new strategies or provide useful insights for designing new and more powerful dual-agonist drugs for treating type 2 diabetes.', 'id': 'icwhpbpj', 'title': 'Find novel dual-agonist drugs for treating type 2 diabetes by means of cheminformatics', '@search.score': 20.458666, '@search.reranker_score': None, '@search.highlights': None, '@search.captions': None}</td>
      <td>{'text': 'The high prevalence of type 2 diabetes mellitus in the world as well as the increasing reports about the adverse side effects of the existing diabetes treatment drugs have made developing new and effective drugs against the disease a very high priority. In this study, we report ten novel compounds found by targeting peroxisome proliferator-activated receptors (PPARs) using virtual screening and core hopping approaches. PPARs have drawn increasing attention for developing novel drugs to treat diabetes due to their unique functions in regulating glucose, lipid, and cholesterol metabolism. The reported compounds are featured with dual functions, and hence belong to the category of dual agonists. Compared with the single PPAR agonists, the dual PPAR agonists, formed by combining the lipid benefit of PPARα agonists (such as fibrates) and the glycemic advantages of the PPARγ agonists (such as thiazolidinediones), are much more powerful in treating diabetes because they can enhance metabolic effects while minimizing the side effects. This was observed in the studies on molecular dynamics simulations, as well as on absorption, distribution, metabolism, and excretion, that these novel dual agonists not only possessed the same function as ragaglitazar (an investigational drug developed by Novo Nordisk for treating type 2 diabetes) did in activating PPARα and PPARγ, but they also had more favorable conformation for binding to the two receptors. Moreover, the residues involved in forming the binding pockets of PPARα and PPARγ among the top ten compounds are explicitly presented, and this will be very useful for the in-depth conduction of mutagenesis experiments. It is anticipated that the ten compounds may become potential drug candidates, or at the very least, the findings reported here may stimulate new strategies or provide useful insights for designing new and more powerful dual-agonist drugs for treating type 2 diabetes.', 'id': 'icwhpbpj', 'title': 'Find novel dual-agonist drugs for treating type 2 diabetes by means of cheminformatics', '@search.score': 0.03306011110544205, '@search.reranker_score': None, '@search.highlights': None, '@search.captions': None}</td>
    </tr>
    <tr>
      <th>1</th>
      <td>{'text': 'The high prevalence of type 2 diabetes mellitus in the world as well as the increasing reports about the adverse side effects of the existing diabetes treatment drugs have made developing new and effective drugs against the disease a very high priority. In this study, we report ten novel compounds found by targeting peroxisome proliferator-activated receptors (PPARs) using virtual screening and core hopping approaches. PPARs have drawn increasing attention for developing novel drugs to treat diabetes due to their unique functions in regulating glucose, lipid, and cholesterol metabolism. The reported compounds are featured with dual functions, and hence belong to the category of dual agonists. Compared with the single PPAR agonists, the dual PPAR agonists, formed by combining the lipid benefit of PPARα agonists (such as fibrates) and the glycemic advantages of the PPARγ agonists (such as thiazolidinediones), are much more powerful in treating diabetes because they can enhance metabolic effects while minimizing the side effects. This was observed in the studies on molecular dynamics simulations, as well as on absorption, distribution, metabolism, and excretion, that these novel dual agonists not only possessed the same function as ragaglitazar (an investigational drug developed by Novo Nordisk for treating type 2 diabetes) did in activating PPARα and PPARγ, but they also had more favorable conformation for binding to the two receptors. Moreover, the residues involved in forming the binding pockets of PPARα and PPARγ among the top ten compounds are explicitly presented, and this will be very useful for the in-depth conduction of mutagenesis experiments. It is anticipated that the ten compounds may become potential drug candidates, or at the very least, the findings reported here may stimulate new strategies or provide useful insights for designing new and more powerful dual-agonist drugs for treating type 2 diabetes.', 'id': 'icwhpbpj', 'title': 'Find novel dual-agonist drugs for treating type 2 diabetes by means of cheminformatics', '@search.score': 0.6700704, '@search.reranker_score': None, '@search.highlights': None, '@search.captions': None}</td>
      <td>{'text': 'Zika virus (ZIKV) infection during pregnancy leads to severe congenital Zika syndrome, which includes microcephaly and other neurological malformations. No therapeutic agents have, so far, been approved for the treatment of ZIKV infection in humans; as such, there is a need for a continuous effort to develop effective and safe antiviral drugs to treat ZIKV-caused diseases. After screening a natural product library, we have herein identified four natural products with anti-ZIKV activity in Vero E6 cells, including gossypol, curcumin, digitonin, and conessine. Except for curcumin, the other three natural products have not been reported before to have anti-ZIKV activity. Among them, gossypol exhibited the strongest inhibitory activity against almost all 10 ZIKV strains tested, including six recent epidemic human strains. The mechanistic study indicated that gossypol could neutralize ZIKV infection by targeting the envelope protein domain III (EDIII) of ZIKV. In contrast, the other natural products inhibited ZIKV infection by targeting the host cell or cell-associated entry and replication stages of ZIKV. A combination of gossypol with any of the three natural products identified in this study, as well as with bortezomib, a previously reported anti-ZIKV compound, exhibited significant combinatorial inhibitory effects against three ZIKV human strains tested. Importantly, gossypol also demonstrated marked potency against all four serotypes of dengue virus (DENV) human strains in vitro. Taken together, this study indicates the potential for further development of these natural products, particularly gossypol, as the lead compound or broad-spectrum inhibitors against ZIKV and other flaviviruses, such as DENV.', 'id': 'qtwcbn7m', 'title': 'Identification of Novel Natural Products as Effective and Broad-Spectrum Anti-Zika Virus Inhibitors', '@search.score': 20.016642, '@search.reranker_score': None, '@search.highlights': None, '@search.captions': None}</td>
      <td>{'text': 'The morbidity of type 2 diabetes mellitus (T2DM) has been increasing rapidly worldwide. Tangminling pill, consisting of ten Chinese herbal medications, is usually prescribed for T2DM in mainland China. Whether treatment with Tangminling can improve clinical outcomes of T2DM patients was still debated. Four studies comparing Tangminling vs. placebo treatment in T2DM patients were included and 767 T2DM patients were enrolled in our analyses. Tangminling treatment exhibited better efficacy than placebo in reducing hemoglobin A1c (HbA1c) (1.11 vs. 0.32%; pooled weighted mean difference [WMD]: 0.80; 95% confidence interval [CI]: 0.65–0.96; P<0.001), fasting plasma glucose (0.82 vs. −0.40 mM; WMD: 1.10; 95% CI: 0.56–1.64; P<0.001), 2-h postprandial glucose (2-hr PG) (2.81 vs. 1.11 mM; WMD: 1.80; 95% CI: 1.72–1.88; P<0.001), homeostatic model assessment-β level (4.28 vs. 0.41; WMD: 0.44; 95% CI: 0.27–0.61; P<0.001), waist circumference (WC) (1.04 vs. 0.36 cm; WMD: 0.78; 95% CI: 0.37–1.19; P<0.001) and body weight index (0.37 vs. 0.11 kg/m(2); WMD: 0.30; 95% CI: −0.00 to 0.61; P=0.05). Tangminling pill might reduce glucose level and body weight and improve β-cell function in T2DM patients. Our study highlights the important role of Tangminling pill in the management of T2DM.', 'id': 'a334btay', 'title': 'Efficacy of traditional Chinese medication Tangminling pill in Chinese patients with type 2 diabetes', '@search.score': 0.030180182307958603, '@search.reranker_score': None, '@search.highlights': None, '@search.captions': None}</td>
    </tr>
    <tr>
      <th>2</th>
      <td>{'text': 'The leaves of Lagerstroemia speciosa (Lythraceae), a Southeast Asian tree more commonly known as banaba, have been traditionally consumed in various forms by Philippinos for treatment of diabetes and kidney related diseases. In the 1990s, the popularity of this herbal medicine began to attract the attention of scientists worldwide. Since then, researchers have conducted numerous in vitro and in vivo studies that consistently confirmed the antidiabetic activity of banaba. Scientists have identified different components of banaba to be responsible for its activity. Using tumor cells as a cell model, corosolic acid was isolated from the methanol extract of banaba and shown to be an active compound. More recently, a different cell model and the focus on the water soluble fraction of the extract led to the discovery of other compounds. The ellagitannin Lagerstroemin was identified as an effective component of the banaba extract responsible for the activity. In a different approach, using 3T3-L1 adipocytes as a cell model and a glucose uptake assay as the functional screening method, Chen et al. showed that the banaba water extract exhibited an insulin-like glucose transport inducing activity. Coupling HPLC fractionation with a glucose uptake assay, gallotannins were identified in the banaba extract as components responsible for the activity, not corosolic acid. Penta-O-galloyl-glucopyranose (PGG) was identified as the most potent gallotannin. A comparison of published data with results obtained for PGG indicates that PGG has a significantly higher glucose transport stimulatory activity than Lagerstroemin. Chen et al. have also shown that PGG exhibits anti-adipogenic properties in addition to stimulating the glucose uptake in adipocytes. The combination of glucose uptake and anti-adipogenesis activity is not found in the current insulin mimetic drugs and may indicate a great therapeutic potential of PGG.', 'id': 'odnpx3ib', 'title': 'Antidiabetes and Anti-obesity Activity of Lagerstroemia speciosa', '@search.score': 0.66543204, '@search.reranker_score': None, '@search.highlights': None, '@search.captions': None}</td>
      <td>{'text': 'Fat embolism syndrome (FES) is primarily a lung parenchymal disorder resulting from interstitial and alveolar inflammation triggered by the lipid metabolites in blood circulation. The 'low-dose' corticosteroid is supposed to have a prophylactic effect on the incidence of the FES and arterial hypoxemia by reducing this inflammatory response. It is expected that inhaled corticosteroids (ciclesonide aerosol) may prevent the development of hypoxemia or fat embolism syndrome in high-risk patients by reducing this inflammatory response. Metered-dose inhaler (MDI) steroid preparations can reach the lung parenchyma with minimal systemic effect. Sixty cases of polytrauma patients presenting within eight hours of injury were randomly allocated into one of the two groups. In Group 1 (n(1)=30) ciclesonide, 640 mcg, was given with a metered dose inhaler and repeated once again after 24 hours, whereas Group 2 (n(2)=30) was taken as control and observed for 72 hours for any episode of hypoxia. The outcome was assessed using Schonfeld’s criteria for the eventual outcome of subclinical or clinical FES. Out of 30 patients in each group, six patients developed subclinical FES, whereas three from ciclesonide prophylaxis group and eight from controls developed clinical FES. There is no statistical significance found between the eventual outcomes of subclinical or clinical FES between the ciclesonide prophylaxis and control group. Although there was a trend seen in the possible preventive efficacy of inhalational steroid in the present study, it did not reach the statistically significant level. The prophylactic role of inhalational steroid in post-traumatic subclinical and clinical FES is statistically insignificant in the present study.', 'id': 'lvvwa9ah', 'title': 'Is There Any Role of Inhalational Corticosteroids in the Prophylaxis of Post-Traumatic Fat Embolism Syndrome?', '@search.score': 19.368464, '@search.reranker_score': None, '@search.highlights': None, '@search.captions': None}</td>
      <td>{'text': 'Zika virus (ZIKV) infection during pregnancy leads to severe congenital Zika syndrome, which includes microcephaly and other neurological malformations. No therapeutic agents have, so far, been approved for the treatment of ZIKV infection in humans; as such, there is a need for a continuous effort to develop effective and safe antiviral drugs to treat ZIKV-caused diseases. After screening a natural product library, we have herein identified four natural products with anti-ZIKV activity in Vero E6 cells, including gossypol, curcumin, digitonin, and conessine. Except for curcumin, the other three natural products have not been reported before to have anti-ZIKV activity. Among them, gossypol exhibited the strongest inhibitory activity against almost all 10 ZIKV strains tested, including six recent epidemic human strains. The mechanistic study indicated that gossypol could neutralize ZIKV infection by targeting the envelope protein domain III (EDIII) of ZIKV. In contrast, the other natural products inhibited ZIKV infection by targeting the host cell or cell-associated entry and replication stages of ZIKV. A combination of gossypol with any of the three natural products identified in this study, as well as with bortezomib, a previously reported anti-ZIKV compound, exhibited significant combinatorial inhibitory effects against three ZIKV human strains tested. Importantly, gossypol also demonstrated marked potency against all four serotypes of dengue virus (DENV) human strains in vitro. Taken together, this study indicates the potential for further development of these natural products, particularly gossypol, as the lead compound or broad-spectrum inhibitors against ZIKV and other flaviviruses, such as DENV.', 'id': 'qtwcbn7m', 'title': 'Identification of Novel Natural Products as Effective and Broad-Spectrum Anti-Zika Virus Inhibitors', '@search.score': 0.02738245204091072, '@search.reranker_score': None, '@search.highlights': None, '@search.captions': None}</td>
    </tr>
    <tr>
      <th>3</th>
      <td>{'text': 'OBJECTIVE: To evaluate evidence for the efficacy of Traditional Chinese Medicine (TCM) in systematic reviews. METHODS: Chinese (TCMPeriodical Literature Database, Chinese Biological Medicine database, Chinese Medical Current Contents, China Hospital Knowledge Database journal fulltext database, Virtual Machining and Inspection System, and Wanfang) and English (Cochrane Database of Systematic Reviews, PubMed and Embase) databases were searched. RESULTS: Three thousand, nine hundred and fifty-five articles were initially identified, 606 of which met the inclusion criteria, including 251 in English (83 from the Cochrane Database) and 355 in Chinese. The number of articles published each year increased between 1989 and 2009. Cardiocerebrovascular disease was the most studied target disease. Intervention measures includedTCM preparations (177 articles), acupuncture (133 articles) and combinations of TCM and western medicine (38 articles). Control measures included positive medical (177 articles), basic treatment (100 articles), placebo (219 articles), and blank and mutual (107 articles). All articles included at least one reference; the greatest number was 268. Six of 10 articles with high quality references demonstrated curative effectsagainst target diseasesincludingupper respiratory tract infection, dementia and depression. Interventions that were not recommendedwere tripterygium for rheumatoid arthritis andTCM syndrome differentiation for pediatric nocturia. In 10.4% of the studies, the authors concluded that the intervention had a curative effect. The assessors agreed with the authors' conclusions in 88.32% of cases, but rejected 8.94% (54 articles). CONCLUSION: 1) Training in systematic review methods, including topic selection, study design, methods and technology, should be improved. 2) Upper respiratory tract infection, dementia and depression may become the predominant diseases treatedby TCM, and the corresponding interventions could be developed into practical applications. 3) Use of non-recommended interventions should be controlled, and there should be more research on side effects.', 'id': 'zssy3i4d', 'title': 'Content analysis of systematic reviews on the effectiveness of Traditional Chinese Medicine', '@search.score': 0.6599396, '@search.reranker_score': None, '@search.highlights': None, '@search.captions': None}</td>
      <td>{'text': 'There is an increasing demand for non-antibiotics solutions to control infectious disease in intensive pig production. Here, one such alternative, namely pig antibodies purified from slaughterhouse blood was investigated in order to elucidate its potential usability to control post-weaning diarrhoea (PWD), which is one of the top indications for antibiotics usage in the pig production. A very cost-efficient and rapid one-step expanded bed adsorption (EBA) chromatography procedure was used to purify pig immunoglobulin G from slaughterhouse pig plasma (more than 100 litres), resulting in >85% pure pig IgG (ppIgG). The ppIgG thus comprised natural pig immunoglobulins and was subsequently shown to contain activity towards four pig-relevant bacterial strains (three different types of Escherichia coli and one type of Salmonella enterica) but not towards a fish pathogen (Yersinia ruckeri), and was demonstrated to inhibit the binding of the four pig relevant bacteria to a pig intestinal cell line (IPEC-J2). Finally it was demonstrated in an in vivo weaning piglet model for intestinal colonization with an E. coli F4+ challenge strain that ppIgG given in the feed significantly reduced shedding of the challenge strain, reduced the proportion of the bacterial family Enterobacteriaceae, increased the proportion of families Enterococcoceae and Streptococcaceae and generally increased ileal microbiota diversity. Conclusively, our data support the idea that natural IgG directly purified from pig plasma and given as a feed supplement can be used in modern swine production as an efficient and cost-effective means for reducing both occurrence of PWD and antibiotics usage and with a potential for the prevention and treatment of other intestinal infectious diseases even if the causative agent might not be known.', 'id': '1tcpaigw', 'title': 'Natural Pig Plasma Immunoglobulins Have Anti-Bacterial Effects: Potential for Use as Feed Supplement for Treatment of Intestinal Infections in Pigs', '@search.score': 18.940382, '@search.reranker_score': None, '@search.highlights': None, '@search.captions': None}</td>
      <td>{'text': 'Human cytomegalovirus (HCMV) was recently demonstrated in the pancreas of about half the patients with type 2 diabetes mellitus in the absence of mumps, rubella or Coxsackie B virus. The present study addresses the question as to whether type 2 diabetes with an HCMV-positive pancreas differs from those with HCMV-negative pancreases with respect to age, sex, treatment, duration of disease, volume densities of B-cells and D-cells, mRNA levels of insulin and somatostatin, islet amyloid peptide deposits and major histocompatibility complex (MHC) class I and class II gene transcription, and protein expression. HCMV-positive type 2 diabetic patients showed a tendency towards a shorter duration of disease and significantly increased levels of MHC class II on RNA. In addition, expression of MHC class II product (HLA-DR) was identified in duct epithelial cells and/or islet cells in 9 diabetic pancreases and in 2 non-diabetic glands. No MHC class I expression could be detected. No other clinical differences between HCMV-positive and HCMV-negative glands were found. All 10 HCMV-positive diabetics showed a strong expression of MHC class II mRN in the pancreas. By immunocytochemistry, 4 of 10 demonstrated expression on the islets; three of ten also expressed MHC DRβ on ductal cells. This finding might be related to the viral infection, as only 2 of the 9 HCMV-negative patients were HLA-DRβ positive and none of the non-diabetic controls showed increased levels of MHC class II mRNA. These data suggest that HCMV infection in the pancreas is associated with type 2 diabetes. However, no conclusions as to a role of this virus in the aetiopathology of type 2 diabetes can be drawn at present.', 'id': 'agiqcmru', 'title': 'Human cytomegalovirus in the pancreas of patients with type 2 diabetes: Is there a relation to clinical features, mRNA and protein expression of insulin, somatostatin, and MHC class II?', '@search.score': 0.026905018836259842, '@search.reranker_score': None, '@search.highlights': None, '@search.captions': None}</td>
    </tr>
    <tr>
      <th>4</th>
      <td>{'text': 'The chronic low-grade inflammation in adipose tissue plays a causal role in obesity-induced insulin resistance and its associated pathophysiological consequences. In this study, we investigated the effects of extracts of Broussonetia papyrifera root bark (PRE) and its bioactive components on inflammation and insulin sensitivity. PRE inhibited TNF-α-induced NF-κB transcriptional activity in the NF-κB luciferase assay and pro-inflammatory genes’ expression by blocking phosphorylation of IκB and NF-κB in 3T3-L1 adipocytes, which were mediated by activating AMPK. Ten-week-high fat diet (HFD)-fed C57BL6 male mice treated with PRE had improved glucose intolerance and decreased inflammation in adipose tissue, as indicated by reductions in NF-κB phosphorylation and pro-inflammatory genes’ expression. Furthermore, PRE activated AMP-activated protein kinase (AMPK) and reduced lipogenic genes’ expression in both adipose tissue and liver. Finally, we identified broussoflavonol B (BF) and kazinol J (KJ) as bioactive constituents to suppress pro-inflammatory responses via activating AMPK in 3T3-L1 adipocytes. Taken together, these results indicate the therapeutic potential of PRE, especially BF or KJ, in metabolic diseases such as obesity and type 2 diabetes.', 'id': 'dvhkk405', 'title': 'Broussonetia papyrifera Root Bark Extract Exhibits Anti-inflammatory Effects on Adipose Tissue and Improves Insulin Sensitivity Potentially Via AMPK Activation', '@search.score': 0.6529153, '@search.reranker_score': None, '@search.highlights': None, '@search.captions': None}</td>
      <td>{'text': 'The world is celebrating the news that the SARS outbreak now seems to be contained. But the epidemic has revealed gaps in our defences against emerging viral diseases and the ever-looming threat of a flu pandemic.', 'id': 'wbjszxi2', 'title': 'We have been warned', '@search.score': 18.880285, '@search.reranker_score': None, '@search.highlights': None, '@search.captions': None}</td>
      <td>{'text': 'BACKGROUND: Diabetes mellitus is a chronic disease with a steadfast increase in prevalence. Due to the chronic course of the disease combining with devastating complications, this disorder could easily carry a financial burden. The early diagnosis of diabetes remains as one of the major challenges medical providers are facing, and the satisfactory screening tools or methods are still required, especially a population- or community-based tool. METHODS: This is a retrospective cross-sectional study involving 15,323 subjects who underwent the annual check-up in the Department of Family Medicine of Shengjing Hospital of China Medical University from January 2017 to June 2017. With a strict data filtration, 10,436 records from the eligible participants were utilized to develop a prediction model using the J48 decision tree algorithm. Nine variables, including age, gender, body mass index (BMI), hypertension, history of cardiovascular disease or stroke, family history of diabetes, physical activity, work-related stress, and salty food preference, were considered. RESULTS: The accuracy, precision, recall, and area under the receiver operating characteristic curve (AUC) value for identifying potential diabetes were 94.2%, 94.0%, 94.2%, and 94.8%, respectively. The structure of the decision tree shows that age is the most significant feature. The decision tree demonstrated that among those participants with age ≤ 49, 5497 participants (97%) of the individuals were identified as nondiabetic, while age > 49, 771 participants (50%) of the individuals were identified as nondiabetic. In the subgroup where people were 34 < age ≤ 49 and BMI ≥ 25, when with positive family history of diabetes, 89 (92%) out of 97 individuals were identified as diabetic and, when without family history of diabetes, 576 (58%) of the individuals were identified as nondiabetic. Work-related stress was identified as being associated with diabetes. In individuals with 34 < age ≤ 49 and BMI ≥ 25 and without family history of diabetes, 22 (51%) of the individuals with high work-related stress were identified as nondiabetic while 349 (88%) of the individuals with low or moderate work-related stress were identified as not having diabetes. CONCLUSIONS: We proposed a classifier based on a decision tree which used nine features of patients which are easily obtained and noninvasive as predictor variables to identify potential incidents of diabetes. The classifier indicates that a decision tree analysis can be successfully applied to screen diabetes, which will support clinical practitioners for rapid diabetes identification. The model provides a means to target the prevention of diabetes which could reduce the burden on the health system through effective case management.', 'id': 'u9z8x4v9', 'title': 'Identification of Potential Type II Diabetes in a Chinese Population with a Sensitive Decision Tree Approach', '@search.score': 0.026356857270002365, '@search.reranker_score': None, '@search.highlights': None, '@search.captions': None}</td>
    </tr>
  </tbody>
</table>


#### The results are okay, but they can be improved further, as the result im looking for (talking about a particular tree) are too low in the list to get picked up

## Enter Semantic reranking
![image.png](/Users/catherinedeskur/Documents/Fern/fern-platform/clis/jupyter-to-mdx/output/notebooks/guides/Optimizing_rag_workflows_with_rerank_and_query_rephrasing_files/717af0e5-baa2-40f6-934c-09b48d31d750.png)

### Instead of taking just the semantic or lexical results, lets take both and run the results through rerank


```python
# We will create one list of our initial results
first_stage_results = vector_results + keyword_results
len(first_stage_results)
```


```python
# Rerank the results
reranked_results = co.rerank(query=query,
                             documents=first_stage_results,
                             top_n=10,
                             rank_fields=['text', 'title'],
                             model='rerank-english-v3.0',
                             return_documents=True)
```

## Now we can look at the updated results


```python
for doc in reranked_results.results:
    print(doc.document.title)
    print(doc.document.text)
    print(f"\n{'-'*50}\n")
```

    Antidiabetes and Anti-obesity Activity of Lagerstroemia speciosa
    The leaves of Lagerstroemia speciosa (Lythraceae), a Southeast Asian tree more commonly known as banaba, have been traditionally consumed in various forms by Philippinos for treatment of diabetes and kidney related diseases. In the 1990s, the popularity of this herbal medicine began to attract the attention of scientists worldwide. Since then, researchers have conducted numerous in vitro and in vivo studies that consistently confirmed the antidiabetic activity of banaba. Scientists have identified different components of banaba to be responsible for its activity. Using tumor cells as a cell model, corosolic acid was isolated from the methanol extract of banaba and shown to be an active compound. More recently, a different cell model and the focus on the water soluble fraction of the extract led to the discovery of other compounds. The ellagitannin Lagerstroemin was identified as an effective component of the banaba extract responsible for the activity. In a different approach, using 3T3-L1 adipocytes as a cell model and a glucose uptake assay as the functional screening method, Chen et al. showed that the banaba water extract exhibited an insulin-like glucose transport inducing activity. Coupling HPLC fractionation with a glucose uptake assay, gallotannins were identified in the banaba extract as components responsible for the activity, not corosolic acid. Penta-O-galloyl-glucopyranose (PGG) was identified as the most potent gallotannin. A comparison of published data with results obtained for PGG indicates that PGG has a significantly higher glucose transport stimulatory activity than Lagerstroemin. Chen et al. have also shown that PGG exhibits anti-adipogenic properties in addition to stimulating the glucose uptake in adipocytes. The combination of glucose uptake and anti-adipogenesis activity is not found in the current insulin mimetic drugs and may indicate a great therapeutic potential of PGG.
    
    --------------------------------------------------
    
    Efficacy of traditional Chinese medication Tangminling pill in Chinese patients with type 2 diabetes
    The morbidity of type 2 diabetes mellitus (T2DM) has been increasing rapidly worldwide. Tangminling pill, consisting of ten Chinese herbal medications, is usually prescribed for T2DM in mainland China. Whether treatment with Tangminling can improve clinical outcomes of T2DM patients was still debated. Four studies comparing Tangminling vs. placebo treatment in T2DM patients were included and 767 T2DM patients were enrolled in our analyses. Tangminling treatment exhibited better efficacy than placebo in reducing hemoglobin A1c (HbA1c) (1.11 vs. 0.32%; pooled weighted mean difference [WMD]: 0.80; 95% confidence interval [CI]: 0.65–0.96; P<0.001), fasting plasma glucose (0.82 vs. −0.40 mM; WMD: 1.10; 95% CI: 0.56–1.64; P<0.001), 2-h postprandial glucose (2-hr PG) (2.81 vs. 1.11 mM; WMD: 1.80; 95% CI: 1.72–1.88; P<0.001), homeostatic model assessment-β level (4.28 vs. 0.41; WMD: 0.44; 95% CI: 0.27–0.61; P<0.001), waist circumference (WC) (1.04 vs. 0.36 cm; WMD: 0.78; 95% CI: 0.37–1.19; P<0.001) and body weight index (0.37 vs. 0.11 kg/m(2); WMD: 0.30; 95% CI: −0.00 to 0.61; P=0.05). Tangminling pill might reduce glucose level and body weight and improve β-cell function in T2DM patients. Our study highlights the important role of Tangminling pill in the management of T2DM.
    
    --------------------------------------------------
    
    Efficacy of traditional Chinese medication Tangminling pill in Chinese patients with type 2 diabetes
    The morbidity of type 2 diabetes mellitus (T2DM) has been increasing rapidly worldwide. Tangminling pill, consisting of ten Chinese herbal medications, is usually prescribed for T2DM in mainland China. Whether treatment with Tangminling can improve clinical outcomes of T2DM patients was still debated. Four studies comparing Tangminling vs. placebo treatment in T2DM patients were included and 767 T2DM patients were enrolled in our analyses. Tangminling treatment exhibited better efficacy than placebo in reducing hemoglobin A1c (HbA1c) (1.11 vs. 0.32%; pooled weighted mean difference [WMD]: 0.80; 95% confidence interval [CI]: 0.65–0.96; P<0.001), fasting plasma glucose (0.82 vs. −0.40 mM; WMD: 1.10; 95% CI: 0.56–1.64; P<0.001), 2-h postprandial glucose (2-hr PG) (2.81 vs. 1.11 mM; WMD: 1.80; 95% CI: 1.72–1.88; P<0.001), homeostatic model assessment-β level (4.28 vs. 0.41; WMD: 0.44; 95% CI: 0.27–0.61; P<0.001), waist circumference (WC) (1.04 vs. 0.36 cm; WMD: 0.78; 95% CI: 0.37–1.19; P<0.001) and body weight index (0.37 vs. 0.11 kg/m(2); WMD: 0.30; 95% CI: −0.00 to 0.61; P=0.05). Tangminling pill might reduce glucose level and body weight and improve β-cell function in T2DM patients. Our study highlights the important role of Tangminling pill in the management of T2DM.
    
    --------------------------------------------------
    
    Sphaeranthus indicus Linn.: A phytopharmacological review
    Sphaeranthus indicus Linn. (Asteraceae) is widely used in Ayurvedic system of medicine to treat vitiated conditions of epilepsy, mental illness, hemicrania, jaundice, hepatopathy, diabetes, leprosy, fever, pectoralgia, cough, gastropathy, hernia, hemorrhoids, helminthiasis, dyspepsia and skin diseases. There are reports providing scientific evidences for hypotensive, anxiolytic, neuroleptic, hypolipidemic, immunomodulatory, antioxidant, anti-inflammatory, bronchodialatory, antihyperglycemic and hepatoprotective activities of this plant. A wide range of phytochemical constituents have been isolated from this plant including sesquiterpene lactones, eudesmenolides, flavanoids and essential oil. A comprehensive account of the morphology, phytochemical constituents, ethnobotanical uses and pharmacological activities reported are included in this review for exploring the immense medicinal potential of this plant.
    
    --------------------------------------------------
    
    Therapeutic Delivery of Ang(1–7) via Genetically Modified Probiotic: A Dosing Study
    In recent years a number of beneficial health effects have been ascribed to the renin-angiotensin system (RAS) that extend beyond lowering blood pressure, primarily mediated via the angiotensin-converting enzyme-2 (ACE2)/angiotensin (1–7) or Ang(1–7)/MAS receptor axis. Moreover, once thought as merely a systemic effector, RAS components exist within tissues. The highest tissue concentrations of ACE2 mRNA are located in the gut making it an important target for altering RAS function. Indeed, genetically engineered recombinant probiotics are promising treatment strategies offering delivery of therapeutic proteins with precision. An Ang(1–7) secreting Lactobacillus paracasei (LP) or LP-A has been described for regulation of diabetes and hypertension; however, we are the first to the best of our knowledge to propose this paradigm as it relates to aging. In this Research Practice manuscript, we provide proof of concept for using this technology in a well-characterized rodent model of aging: the Fisher344 x Brown Norway Rat (F344BN). Our primary findings suggest that LP-A increases circulating levels of Ang(1–7) both acutely and chronically (after 8 or 28 treatment days) when administered 3× or 7×/week over 4 weeks. Our future preclinical studies will explore the impact of this treatment on gut and other age-sensitive distal tissues such as brain and muscle.
    
    --------------------------------------------------
    
    Natural products: Designing Russian medications
    The study of natural products (low-molecular bioregulators) is an important research area that lies on the boundary of biology and chemistry. It involves searching, isolating, and identifying the structure and studying the biological functions of such substances, as well as investigating their chemical conversions, especially those that lead to highly active products. These research efforts play an important part in deepening biological and chemical knowledge and build the scientific groundwork for designing new drugs and biologically active food additives. Some results of the study of natural compounds were discussed in a paper read at a session of the RAS Presidium and are published below.
    
    --------------------------------------------------
    
    Natural products: Designing Russian medications
    The study of natural products (low-molecular bioregulators) is an important research area that lies on the boundary of biology and chemistry. It involves searching, isolating, and identifying the structure and studying the biological functions of such substances, as well as investigating their chemical conversions, especially those that lead to highly active products. These research efforts play an important part in deepening biological and chemical knowledge and build the scientific groundwork for designing new drugs and biologically active food additives. Some results of the study of natural compounds were discussed in a paper read at a session of the RAS Presidium and are published below.
    
    --------------------------------------------------
    
    Using Complementary and Alternative Medicines to Target the Host Response during Severe Influenza
    It is now accepted that an overwhelming inflammatory response is the cause of human deaths from avian H5N1 influenza infection. With this in mind we sought to examine the literature for examples of complementary and alternative medicines that reduce inflammation, and to place the results of this search in the context of our own work in a mouse model of influenza disease, using a pharmaceutical agent with anti-inflammatory properties. Two Chinese herbs, Angelica sinensis (Dang Gui) and Salvia miltiorrhiza (Danshen), have been recently shown to protect mice during lethal experimental sepsis via inhibition of the novel inflammatory cytokine High Mobility Group Box 1 protein (HMGB1). Biochanin A, a ligand of the peroxisome proliferator activated receptors (PPAR) alpha and gamma and the active isoflavone in Trifolium pratense (red clover), has anti-inflammatory properties, and thus could be used as an influenza treatment. This is of great interest since we have recently shown that gemfibrozil, a drug used to treat hyperlipidemia in humans and a synthetic ligand of PPAR alpha, significantly reduces the mortality associated with influenza infections in mice. The inflammation-modulating abilities of these natural agents should be considered in light of what is now known about the mechanisms of fatal influenza, and tested as potential candidates for influenza treatments in their own right, or as adjunct treatments to antivirals.
    
    --------------------------------------------------
    
    Role of Antioxidants and Natural Products in Inflammation
    Inflammation is a comprehensive array of physiological response to a foreign organism, including human pathogens, dust particles, and viruses. Inflammations are mainly divided into acute and chronic inflammation depending on various inflammatory processes and cellular mechanisms. Recent investigations have clarified that inflammation is a major factor for the progression of various chronic diseases/disorders, including diabetes, cancer, cardiovascular diseases, eye disorders, arthritis, obesity, autoimmune diseases, and inflammatory bowel disease. Free radical productions from different biological and environmental sources are due to an imbalance of natural antioxidants which further leads to various inflammatory associated diseases. In this review article, we have outlined the inflammatory process and its cellular mechanisms involved in the progression of various chronic modern human diseases. In addition, we have discussed the role of free radicals-induced tissue damage, antioxidant defence, and molecular mechanisms in chronic inflammatory diseases/disorders. The systematic knowledge regarding the role of inflammation and its associated adverse effects can provide a clear understanding in the development of innovative therapeutic targets from natural sources that are intended for suppression of various chronic inflammations associated diseases.
    
    --------------------------------------------------
    
    Role of Antioxidants and Natural Products in Inflammation
    Inflammation is a comprehensive array of physiological response to a foreign organism, including human pathogens, dust particles, and viruses. Inflammations are mainly divided into acute and chronic inflammation depending on various inflammatory processes and cellular mechanisms. Recent investigations have clarified that inflammation is a major factor for the progression of various chronic diseases/disorders, including diabetes, cancer, cardiovascular diseases, eye disorders, arthritis, obesity, autoimmune diseases, and inflammatory bowel disease. Free radical productions from different biological and environmental sources are due to an imbalance of natural antioxidants which further leads to various inflammatory associated diseases. In this review article, we have outlined the inflammatory process and its cellular mechanisms involved in the progression of various chronic modern human diseases. In addition, we have discussed the role of free radicals-induced tissue damage, antioxidant defence, and molecular mechanisms in chronic inflammatory diseases/disorders. The systematic knowledge regarding the role of inflammation and its associated adverse effects can provide a clear understanding in the development of innovative therapeutic targets from natural sources that are intended for suppression of various chronic inflammations associated diseases.
    
    --------------------------------------------------
    


## So what does this mean?
### To see the impact, lets set up our chat portion of the RAG flow so that we can respond to the user. This function will make it easier to test the chat portion of our RAG flow


```python
# We will create a basic chat helper function
import uuid

class Chat:
    def __init__(self, rerank=False, n_search_results=75):
        self.convo_id = uuid.uuid4()
        self.rerank = rerank
        self.n_search_results = n_search_results
    
    def _rerank_documents(self, query, keyword_docs, semantic_docs, top_n=10):
        """
        Re-ranks the combined keyword and semantic documents and formats them.

        Args:
            query (str): The search query.
            keyword_docs (List[Dict]): Keyword search results.
            semantic_docs (List[Dict]): Semantic search results.

        Returns:
            str: Formatted re-ranked documents as a string.
        """
        first_stage_results = keyword_docs + semantic_docs
        reranked_results = co.rerank(
            query=query,
            documents=first_stage_results,
            top_n=top_n,
            rank_fields=['text', 'title'],
            model='rerank-english-v3.0',
            return_documents=True
        )
        
        documents = [doc.document for doc in reranked_results.results]
        return documents
    
        
    def _search(self, query):
        # get the search results
        keyword_documents = search(query, mode='lexical')
        semantic_documents = search(query, mode='semantic')
        hybrid_documents = search(query, mode='hybrid')
        
        # If we want to use rerank
        if self.rerank:
            documents = self._rerank_documents(query, keyword_documents, semantic_documents)
        
        # otherwise default to hybrid
        else:
            documents = hybrid_documents[:self.n_search_results]
        
        return documents
        
    
    def chat(self, message):
        """
        Generates a chat response based on the given message.

        Args:
            message (str): The user's input message.

        Yields:
            str: The chat response generated by the model.
        """
        # get the search results
        documents = self._search(message)
        
        # If we want to use rerank
        if self.rerank:
            documents_str = '\n'.join([f"\nDocument: {i}\n{d.title}\n\n{d.text}" for i, d in enumerate(documents)])
        
        # otherwise default to hybrid
        else:
            documents_str = '\n'.join([f"\nDocument: {i}\n{d['title']}\n\n{d['text']}" for i, d in enumerate(documents)])
            
        # Chat model
        document_token_count = len(co.tokenize(text=documents_str, model='command-r-plus').tokens)
        print(f"{document_token_count} Tokens in the Prompt")
        
        model_response = co.chat_stream(
            message=f"Retrieved Documents:\n{documents_str}\n\nUser Message:\n{message}",
            preamble="Answer the user's question using information in the documents below",
            model="command-r-plus",
            temperature=0.1,
            conversation_id=self.convo_id
        )
        
        for token in model_response:
            if token.event_type == 'text-generation':
                yield token.text
```

### Lets try asking the model without reranking


```python
import time
```


```python
no_rerank_session = Chat(rerank=False)
```


```python
start_time = time.time()

# Asking our question
res = no_rerank_session.chat('Have there been any studies on natural treatment for diabetes?')

first_token = next(res)
end_time = time.time()
elapsed_time = end_time - start_time
print(f"Time before the response starts printing: {elapsed_time:.2f} seconds\n")
print(first_token, end='')
for r in res:
    print(r, end='')
```

    26369 Tokens in the Prompt
    Time before the response starts printing: 4.57 seconds
    
    There have been several studies on natural treatments for diabetes. Here are some of the findings:
    
    - A study on the efficacy of the Tangminling pill, a Chinese medication consisting of ten herbal medicines, found that it was more effective than a placebo in reducing glucose levels and body weight, and improving β-cell function in patients with type 2 diabetes.
    - Lagerstroemia speciosa, a Southeast Asian tree commonly known as banaba, has been traditionally consumed in the Philippines for treating diabetes and kidney-related diseases. Scientific studies have confirmed its antidiabetic activity.
    - A study on the effects of extracts from the root bark of Broussonetia papyrifera found that it improved glucose intolerance and decreased inflammation in adipose tissue, indicating its therapeutic potential for metabolic diseases such as type 2 diabetes.
    - A review of the use of herbal products in chronic liver disease found that quercetin and curcumin have beneficial effects as antioxidants, but noted the lack of randomized, placebo-controlled clinical trials to prove their efficacy.
    - A study on the effects of Sphaeranthus indicus Linn., a plant widely used in Ayurvedic medicine, found that it has antihyperglycemic and hepatoprotective activities, suggesting its potential for treating diabetes.
    - A study on the effects of Rosae Multiflorae Fructus and Lonicerae Japonicae Flos, two edible herbs used in traditional remedies for rheumatoid arthritis, found that they inhibited the production of inflammatory mediators in immune cells, providing a pharmacological justification for their use.
    - A study on the effects of hinokiflavone and glycyrrhizin, two natural compounds, found that their combination provided a protective effect on the liver and kidney, although less so than the standard drug silymarin.
    - A study on the effects of indirubin, a compound obtained from the Indigo plant, found that it enhanced brown adipose tissue activity and induced browning of white adipose tissue, suggesting its potential for preventing and treating obesity and its complications, including type 2 diabetes.

### What if we use rerank instead?


```python
rerank_session = Chat(rerank=True)
```


```python
start_time = time.time()

# Asking our question
res = rerank_session.chat('Have there been any studies on natural treatment for diabetes?')

first_token = next(res)
end_time = time.time()
elapsed_time = end_time - start_time
print(f"Time before the response starts printing: {elapsed_time:.2f} seconds\n")
print(first_token, end='')
for r in res:
    print(r, end='')
```

    3043 Tokens in the Prompt
    Time before the response starts printing: 1.54 seconds
    
    Yes, there have been studies on natural treatments for diabetes. Here are some examples:
    
    - The leaves of the Lagerstroemia speciosa (Lythraceae) tree, commonly known as banaba, have been used by Filipinos to treat diabetes and kidney-related diseases. Scientists have identified different components of banaba that are responsible for its antidiabetic activity.
    - The Tangminling pill, consisting of ten Chinese herbal medications, is prescribed for type 2 diabetes in mainland China. Studies have shown that it may reduce glucose levels and body weight and improve β-cell function in patients.
    - Sphaeranthus indicus Linn. (Asteraceae) is used in Ayurvedic medicine to treat diabetes, among other conditions. It has been reported to have antihyperglycemic activities.
    - Genetically engineered recombinant probiotics have been proposed as a treatment strategy for diabetes. A study found that an Ang(1–7)-secreting Lactobacillus paracasei (LP) or LP-A increased circulating levels of Ang(1–7) in a rodent model.

#### You can see we can effectively reduce both the latency and token count, while maintaining the high quality results

### But cant we pass in less documents with normal search?


```python
short_session = Chat(rerank=False, n_search_results=10)
```


```python
start_time = time.time()

# Asking our question
res = short_session.chat('Have there been any studies on natural treatment for diabetes?')

first_trerank_sessionoken = next(res)
end_time = time.time()
elapsed_time = end_time - start_time
print(f"Time before the response starts printing: {elapsed_time:.2f} seconds\n")
print(first_token, end='')
for r in res:
    print(r, end='')
```

    3960 Tokens in the Prompt
    Time before the response starts printing: 1.27 seconds
    
    Yes, there have been studies on natural treatments for diabetes. One study examined the efficacy of the Tangminling pill, a Chinese medication consisting of ten herbal medications, in treating type 2 diabetes. Another study looked at the potential of withanolides, particularly extracts from Withania somnifera, in treating chronic diseases, including diabetes.

#### So we can, but the quality slips

### Alright so lets continue our conversation


```python
res = rerank_session.chat("Can you tell me about some of the early symptoms of the disease?")
for r in res:
    print(r, end='')
```

    3369 Tokens in the Prompt
    Here are some early symptoms of various diseases:
    
    - Dengue Virus Infection: fever, headache, retro-orbital pain, myalgia, arthralgia, rash, petechiae, positive tourniquet test, vomiting, leukopenia, platelets ≤150,000 cells/mL, poor capillary refill, cold extremities, and hypotension.
    - Influenza: fever, respiratory symptoms, and myalgia.
    - Pandemic H1N1 2009 Influenza: high fever, cough, rhinorrhea, sore throat, myalgia, and diarrhea.
    - Swine-Origin Influenza A (H1N1): fever, cough, rhinorrhea, and headache.
    - Early Infantile Pertussis: apnoeas, seizures, respiratory failure, hypotension, pulmonary hypertension, pneumothoraces, and seizures.
    - Hantavirus Infection: disorientation, sinustachycardia, and hypotension.
    - Chronic Kidney Disease (CKD): There are often no apparent symptoms in the early stages, especially in normotensive individuals. However, some novel biomarkers have been identified to detect early renal tubular damage, such as urinary vanin-1 and neutrophil gelatinase-associated lipocalin (NGAL).
    
    It is important to note that these are not exhaustive lists, and the presence of these symptoms does not necessarily indicate a specific disease. Medical advice should be sought for an accurate diagnosis.

#### Now we have a new failure mode, the model doesnt have the context from my conversation, so the search didnt return the correct results as it didnt know I meant for it to search for diabetes still

## We need to improve the queries
![image.png](/Users/catherinedeskur/Documents/Fern/fern-platform/clis/jupyter-to-mdx/output/notebooks/guides/Optimizing_rag_workflows_with_rerank_and_query_rephrasing_files/dc8aee61-8731-42cd-afef-4ca51db04e4c.png)
### We can make a new version of our chat class with a modification to use a model to create our query


```python
class ContextChat(Chat):
    memory = []
    memory_str = ''
    
    def _set_context(self, message):
        self.memory.append(message)
        self.memory_str = '\n-'.join(self.memory)
        
    def _generate_query(self):
        prompt = f"Conversation:\n{self.memory_str} Use the context of the conversation above and return a rephrased query that takes into account the context of the conversation. Only return the query, nothing else"
        queries = []
        raw_generation = co.chat(message=prompt, model='command-r')
        query = raw_generation.text.strip()
        print(f"Generated Query: {query}")
        return query
        
    def chat(self, message):
        """
        Generates a chat response based on the given message.

        Args:
            message (str): The user's input message.

        Yields:
            str: The chat response generated by the model.
        """
        ###############################
        # Add a section to capture the context and get a new query
        #
        self._set_context(message)
        query = self._generate_query()
        ##############################
        
        # get the search results
        documents = self._search(query)
        
        # If we want to use rerank
        if self.rerank:
            documents_str = '\n'.join([f"\nDocument: {i}\n{d.title}\n\n{d.text}" for i, d in enumerate(documents)])
        
        # otherwise default to hybrid
        else:
            documents_str = '\n'.join([f"\nDocument: {i}\n{d['title']}\n\n{d['text']}" for i, d in enumerate(documents)])
            
        # Chat model
        document_token_count = len(co.tokenize(text=documents_str, model='command-r-plus').tokens)
        print(f"{document_token_count} Tokens in the Prompt")
        
        model_response = co.chat_stream(
            message=f"Retrieved Documents:\n{documents_str}\n\nUser Message:\n{message}",
            preamble="Answer the user's question using information in the documents below",
            model="command-r-plus",
            temperature=0.1,
            conversation_id=self.convo_id
        )
        
        response = ''                        
        for token in model_response:
            if token.event_type == 'text-generation':
                response += token.text
                yield token.text
        self._set_context(response)
```

### Lets try the same question loop again


```python
context_session = ContextChat(rerank=True)
```


```python
start_time = time.time()

# Asking our question
res = context_session.chat('Have there been any studies on natural treatment for diabetes?')

first_token = next(res)
end_time = time.time()
elapsed_time = end_time - start_time
print(f"Time before the response starts printing: {elapsed_time:.2f} seconds\n")
print(first_token, end='')
for r in res:
    print(r, end='')
```

    Generated Query: Do any studies exist on the effectiveness of natural diabetes remedies?
    3686 Tokens in the Prompt
    Time before the response starts printing: 1.84 seconds
    
    Yes, there have been several studies on natural treatments for diabetes. Here are some examples:
    
    - A study on the efficacy of the Tangminling pill, a traditional Chinese medication consisting of ten Chinese herbal medications, found that it may reduce glucose levels and body weight and improve β-cell function in patients with type 2 diabetes.
    - The leaves of Lagerstroemia speciosa (Lythraceae), a Southeast Asian tree commonly known as banaba, have been traditionally consumed by Filipinos in various forms to treat diabetes and kidney-related diseases. Scientists have identified different active compounds in banaba, such as corosolic acid and ellagitannin Lagerstroemin, which exhibit antidiabetic activity.
    - Broussonetia papyrifera root bark extract (PRE) has been found to exhibit anti-inflammatory effects on adipose tissue and improve insulin sensitivity, indicating its therapeutic potential in metabolic diseases like obesity and type 2 diabetes.
    - Sphaeranthus indicus Linn. is widely used in the Ayurvedic system of medicine to treat various conditions, including diabetes. It has been reported to possess antihyperglycemic properties, among other beneficial activities.
    - A novel Phenol-Rich Compounds Sweet Gel, prepared by blending four natural herbal extracts with a sweet gel medium, has been found to be effective in treating various types of wounds, including leg ulcers in diabetic patients.
    
    These studies suggest that natural treatments for diabetes may hold promise, but more research is likely needed to fully understand their efficacy and safety.


```python
res = context_session.chat("Can you tell me about some of the early symptoms of the disease?")
for r in res:
    print(r, end='')
```

    Generated Query: What are some early warning signs of diabetes, given the variety of natural treatments being studied for their effectiveness in managing the disease?
    2720 Tokens in the Prompt
    While I cannot provide medical advice, here is some general information about potential early signs and symptoms of diabetes:
    
    - Increased thirst and frequent urination: Diabetes is often associated with polyuria, which is the medical term for excessive urination. This is due to the body's attempt to get rid of the excess glucose in the blood by increasing urine production. Along with frequent urination, people may also experience increased thirst (polydipsia) as the body tries to replace the lost fluids.
    - Weight loss: Unexplained weight loss can be an early sign of diabetes, especially type 1 diabetes. This is because the body is unable to properly utilize glucose for energy, leading to weight loss despite a normal or increased appetite.
    - Fatigue and tiredness: Diabetes can cause fatigue due to the body's inability to properly utilize glucose for energy production. This can result in feelings of tiredness and a lack of energy.
    - Blurred vision: High blood sugar levels can affect the eyes, causing blurred vision or other visual disturbances. This is often a temporary symptom and can be managed with proper diabetes treatment.
    - Slow-healing wounds: Diabetes can affect the body's ability to heal wounds, so cuts, bruises, or sores may take longer than usual to heal.
    - Increased hunger: Diabetes can cause fluctuations in blood sugar levels, leading to frequent feelings of hunger, even after eating.
    
    It's important to note that these symptoms may vary depending on the type of diabetes and other individual factors. If you are experiencing any of these symptoms or have concerns about your health, it's always best to consult with a healthcare professional.

#### Great, so now we can continue the conversation with context-aware queries

## Now we can bring it all together with some more subtle improvements
![image.png](/Users/catherinedeskur/Documents/Fern/fern-platform/clis/jupyter-to-mdx/output/notebooks/guides/Optimizing_rag_workflows_with_rerank_and_query_rephrasing_files/40574cd0-f664-423f-b344-8b3925e86f3d.png)
### We will start by creating the context chat class again, but see how we can do it easier with the Cohere SDK
#### (notice no prompt engineering and fusion of multiple queries)


```python
class CohereContextChat(Chat):
    def _multi_search(self, queries):
        all_documents = []
        for query in queries:
            # get the search results
            keyword_documents = search(query, mode='lexical')
            semantic_documents = search(query, mode='semantic')
            hybrid_documents = search(query, mode='hybrid')
            
            # If we want to use rerank
            if self.rerank:
                documents = self._rerank_documents(query, keyword_documents, semantic_documents, top_n=5)
                all_documents.extend(documents)                             
                                          
        return all_documents
        
    def chat(self, message):
        """
        Generates a chat response based on the given message.

        Args:
            message (str): The user's input message.

        Yields:
            str: The chat response generated by the model.
        """
        # get search queries
        generated_queries = co.chat(message=message, model='command-r', search_queries_only=True)
        queries = [q.text for q in generated_queries.search_queries]
        print(f"Queries: {queries}")
        
        # get the search results
        documents = self._multi_search(queries)
        documents = [{'title': d.title, 'text': d.text} for d in documents]
            
        # Chat model        
        model_response = co.chat_stream(
            message=message,
            model="command-r-plus",
            documents=documents,
            temperature=0.1,
            conversation_id=self.convo_id
        )
        
        citations = []
        for token in model_response:
            if token.event_type == 'text-generation':
                yield token.text
            elif token.event_type == 'citation-generation':
                citations.append(token.citations)
        print(f"\n\n{citations}")
```


```python
cohere_session = CohereContextChat(rerank=True)
```

#### And we also get citations as part of our response now!


```python
start_time = time.time()

# Asking our question
res = cohere_session.chat('Have there been any studies on natural treatment for diabetes? Also can you search for some of the early signs')

first_token = next(res)
end_time = time.time()
elapsed_time = end_time - start_time
print(f"Time before the response starts printing: {elapsed_time:.2f} seconds\n")
print(first_token, end='')
for r in res:
    print(r, end='')
```

    Queries: ['natural treatment for diabetes', 'early signs of diabetes']
    Time before the response starts printing: 4.07 seconds
    
    There have been studies on natural treatments for diabetes. One such study focused on the efficacy of the Tangminling pill, a Chinese herbal medication consisting of ten herbal medications, which is usually prescribed for type 2 diabetes in mainland China. The study found that Tangminling treatment exhibited better efficacy than a placebo in reducing hemoglobin A1c, fasting plasma glucose, and 2-hour postprandial glucose. Another study focused on the antidiabetic properties of the leaves of Lagerstroemia speciosa (Lythraceae), a Southeast Asian tree more commonly known as banaba. Filipinos have traditionally consumed the leaves of this tree in various forms to treat diabetes and kidney-related diseases. In the 1990s, this herbal medicine began to attract the attention of scientists worldwide, who have since conducted numerous in vitro and in vivo studies that have consistently confirmed the antidiabetic activity of banaba.
    
    Additionally, here are some early signs of diabetes:
    - Frequent urination
    - Increased thirst
    - Hunger
    - Fatigue
    - Blurred vision
    - Slow-healing wounds
    - Weight loss
    - Tingling or numbness in hands or feet
    
    [[ChatCitation(start=90, end=122, text='efficacy of the Tangminling pill', document_ids=['doc_1', 'doc_2'])], [ChatCitation(start=126, end=151, text='Chinese herbal medication', document_ids=['doc_1', 'doc_2'])], [ChatCitation(start=166, end=188, text='ten herbal medications', document_ids=['doc_1', 'doc_2'])], [ChatCitation(start=199, end=256, text='usually prescribed for type 2 diabetes in mainland China.', document_ids=['doc_1', 'doc_2'])], [ChatCitation(start=278, end=340, text='Tangminling treatment exhibited better efficacy than a placebo', document_ids=['doc_1', 'doc_2'])], [ChatCitation(start=344, end=425, text='reducing hemoglobin A1c, fasting plasma glucose, and 2-hour postprandial glucose.', document_ids=['doc_1', 'doc_2'])], [ChatCitation(start=455, end=531, text='antidiabetic properties of the leaves of Lagerstroemia speciosa (Lythraceae)', document_ids=['doc_0'])], [ChatCitation(start=535, end=586, text='Southeast Asian tree more commonly known as banaba.', document_ids=['doc_0'])], [ChatCitation(start=587, end=712, text='Filipinos have traditionally consumed the leaves of this tree in various forms to treat diabetes and kidney-related diseases.', document_ids=['doc_0'])], [ChatCitation(start=720, end=725, text='1990s', document_ids=['doc_0'])], [ChatCitation(start=732, end=802, text='herbal medicine began to attract the attention of scientists worldwide', document_ids=['doc_0'])], [ChatCitation(start=819, end=936, text='conducted numerous in vitro and in vivo studies that have consistently confirmed the antidiabetic activity of banaba.', document_ids=['doc_0'])]]



```python

```

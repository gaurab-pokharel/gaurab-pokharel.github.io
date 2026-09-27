**Authors:** **Gaurab Pokharel**¹, Shafkat Farabi¹, Patrick J. Fowler², Sanmay Das¹

**Affiliations:** ¹Virginia Tech, ²Washington University in St. Louis

**Venue:** *AAAI/ACM Conference on AI, Ethics, and Society (AIES 2026)*

---

## Overview

> **Key takeaway:** A ranking can fail you in two independent ways: the judgments behind it can contradict one another, or the ranking can come out different every time you rebuild it. These two failures are caught by different diagnostics, leading LLMs trade one off against the other, and a practitioner should check both before trusting an LLM-built priority list.

From housing allocation for households experiencing homelessness to triage in emergency departments, LLMs are increasingly considered as judges for decisions that amount to ranking people for scarce resources. Asking a model to rank a large group in one shot is fragile: outputs are known to shift with presentation order, list length, and prompt framing. A natural fix, with deep roots in social choice theory, is to break the problem into many small ones — ask "which of these two cases is more urgent?" over and over — and then aggregate the pairwise answers into a total order with a method like Rank Centrality or Borda count.

Pairwise elicitation solves the fragility problem but raises a new question: once the aggregator hands you a ranking, how do you know whether to trust it, before you commit to it? We argue the answer has two independent parts. Intra-run consistency asks whether the comparisons inside a single run cohere, or whether the judge says a beats b, b beats c, and then c beats a. Inter-run variance asks whether the whole pipeline, run twice, gives the same answer. It is tempting to treat these as one property, but they are not: a judge that reports comparisons from a fresh random permutation every run is perfectly transitive yet wildly unstable, while one that always emits the same fixed cycle is perfectly stable yet internally incoherent. That observation gives a 2 × 2 taxonomy of ranking reliability, and the question becomes where real LLM judges actually land in it.

---

## Two diagnostics, no ground truth required

Intra-run consistency has a classical measure that deserves to be better known. The coefficient of consistency ζ, introduced by Kendall and Smith in 1940 to test the reliability of human judges, counts circular triads — triples with a ≻ b ≻ c ≻ a, the smallest possible unit of intransitivity — and normalizes the count: ζ = 1 − Tₙ/Tₘₐₓ, where Tₙ is the number of circular triads in the tournament and Tₘₐₓ is the most a tournament of that size can contain. A value of 1 means the comparisons are perfectly transitive; 0 means maximum cyclicity. Crucially, ζ comes straight from the comparison outcomes, in closed form from the win counts: no ground truth, no model of how the comparisons were generated, and no extra queries.

Two properties make ζ practical. First, it decomposes as ζ = 1 − r · f(n), where the inconsistency rate r is the probability that a randomly drawn triple is circular, and f(n) is a known scaling factor that rises toward 4 as the pool grows. If r holds constant as items are added, ζ settles onto a floor of 1 − 4r. Second, r can be estimated without bias from a partial tournament: sample a fraction of the pairs, keep the triples where all three comparisons happen to be observed, and count the circular ones. A cheap, sparse sample of comparisons is enough to learn the quality of a judge. Inter-run variance needs no new machinery — run the pipeline twice on independent comparisons and compute Kendall's τ between the two rankings. (The results are robust to swapping in other rank-distance measures.)

---

## What a controlled model predicts

To calibrate the two diagnostics, we generate tournaments from a Bradley–Terry–Luce model with equally spaced item strengths, so that a single parameter β controls how distinguishable neighboring items are, and aggregate with Rank Centrality.

<figure>
  <img src="assets/img/projects/can-llms-rank/synthetic-calibration.png"
       alt="Two panels plotting ranking accuracy and inter-run agreement against the coefficient of consistency for tournaments of 20, 50, and 100 items, with both quantities rising as consistency increases."
       width="800" loading="lazy" />
  <figcaption><strong>Figure 1.</strong> Synthetic calibration under the BTL model. <em>Left:</em> ζ is a strong predictor of ranking accuracy (Kendall τ against the known true order). <em>Right:</em> at the same ζ, larger tournaments agree more across independent runs, so intra-run consistency alone does not determine stability.</figcaption>
</figure>

Three lessons come out of the synthetic study. ζ is a strong predictor of ranking accuracy. But ζ does not determine stability: at the same consistency level, larger tournaments produce more stable rankings, simply because the aggregator sees more comparisons per item. And the cleanest dissociation comes from holding everything fixed while varying only the fraction of pairs observed: the sparse estimate of ζ stays flat, because it is unbiased at every budget, while agreement between independent runs climbs from about 0.55 at a 20% sample to perfect agreement when every pair is observed.

<figure>
  <img src="assets/img/projects/can-llms-rank/sparse-observation.png"
       alt="Two panels showing the sparse estimate of the consistency coefficient staying flat as the fraction of observed pairs grows, while agreement between independent runs climbs steadily toward one."
       width="800" loading="lazy" />
  <figcaption><strong>Figure 2.</strong> Varying only the comparison budget (n = 30, β = 0.3). <em>Left:</em> the sparse estimate of ζ is unbiased at every observation fraction; the dashed line marks the full-tournament value. <em>Right:</em> inter-run agreement rises steadily with the budget. ζ prices the quality of the signal, while τ mixes quality with quantity.</figcaption>
</figure>

The stylized model also makes a prediction that the real data will contradict. Under BTL, circular triads come almost entirely from near-neighbors in the true order, so the inconsistency rate falls like Θ(1/n²) and ζ drifts toward 1 as the pool grows.

---

## Three LLMs, two high-stakes domains

We then generate the comparisons with LLM judges on real prioritization data: household vulnerability assessments from St. Louis coordinated entry records (three instruments — VI-SPDAT for single adults, VIF-SPDAT for families, and TAY-VISPDAT for transition-age youth — with 325 to 698 households each) and emergency department triage records from MIMIC-IV (a 500-patient sample drawn from 180,057 eligible visits, with the nurse-assigned Emergency Severity Index as the reference). Three open models — LLaMA 3 8B, DeepSeek-R1-Distill-Llama-8B, and Qwen2.5-7B — run locally on the de-identified records, with the order of each pair randomized.

Real LLM comparisons do not behave like the stylized model. Across all four datasets and all three judges, the inconsistency rate r stays essentially flat as the pool grows — the constant-r regime — so ζ settles quickly onto its 1 − 4r floor while inter-run agreement keeps improving as comparisons accumulate. A bootstrap experiment makes the point sharply: resample the comparisons of a 30-item subtournament many times, and the full pipeline's inter-run agreement lands far to the right of the entire bootstrap distribution. Same judge, same noise, more data.

<figure>
  <img src="assets/img/projects/can-llms-rank/bootstrap-consistency.png"
       alt="A three-by-three grid of histograms of inter-run agreement for three language models on three homelessness instruments, with the full pipeline's agreement marked well to the right of each bootstrap distribution."
       width="800" loading="lazy" />
  <figcaption><strong>Figure 3.</strong> Bootstrap subsamples of a 30-household subtournament (rows: DeepSeek, LLaMA, Qwen; columns: VI-SPDAT, VIF-SPDAT, TAY-VISPDAT). The full pipeline's inter-run τ, the red line, sits to the right of every bootstrap distribution: rankings stabilize with quantity even when comparison quality is unchanged.</figcaption>
</figure>

<figure>
  <img src="assets/img/projects/can-llms-rank/scaling-with-n.png"
       alt="Four rows of plots, one per dataset, showing the cycle ratio and the consistency coefficient staying roughly flat as the number of items grows while inter-run agreement increases."
       width="800" loading="lazy" />
  <figcaption><strong>Figure 4.</strong> The real-data regime across all four datasets. The cycle ratio r and ζ (left and middle columns) are nearly flat in the number of items, so a small subtournament already prices judge quality, while inter-run τ (right column) keeps climbing as more comparisons accumulate.</figcaption>
</figure>

The comparison across models is the punchline: no model dominates. LLaMA produces the most internally consistent comparisons on every dataset, and middling-to-worst stability. Qwen produces the most stable rankings on every dataset, and the least internally consistent comparisons. DeepSeek sits in the middle on both axes. A practitioner who evaluated only inter-run stability would pick Qwen; one who evaluated only internal consistency would pick LLaMA. Neither choice is wrong, and neither is complete.

---

## Why this matters

The taxonomy pays off as a cheap, concrete protocol. Before committing to a model or a full pipeline, run a small complete subtournament and compute ζ exactly; because the estimate is unbiased regardless of budget, this step reliably prices the quality of the judge's comparisons. If ζ is low, the judgments themselves are incoherent, and no amount of additional data will fix them — change the judge, the prompt, or the plan. If ζ is high but rankings still disagree across runs, the comparisons are fine and there simply are not enough of them, so the remedy is more comparisons rather than a new model. The distinction matters because the remedies differ, and because in these settings — who receives a housing intervention, who is seen first in the emergency department — an incoherent or unstable ranking has direct human costs. The diagnosis is also aggregator-agnostic: Rank Centrality, Bradley–Terry maximum likelihood, and Borda count trace nearly identical curves, so ζ is a statement about the data, not about the algorithm that ranked it.

---

## Citation

```bibtex
@inproceedings{pokharel2026canllmsrank,
  title     = {Can LLMs Rank? A Tale of Triads and Triage},
  author    = {Pokharel, Gaurab and Farabi, Shafkat and Fowler, Patrick J. and Das, Sanmay},
  booktitle = {Proceedings of the AAAI/ACM Conference on AI, Ethics, and Society (AIES 2026)},
  year      = {2026},
  url       = {https://arxiv.org/abs/2606.30412}
}
```

*This work was supported by NSF Award 2533162.*

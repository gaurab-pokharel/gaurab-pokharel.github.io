---
layout: layouts/project.njk
title: "Two-Sided Bandits in Matching Markets"
description: >
  We study repeated two-sided matching when *both* sides must learn preferences over time (a “two-sided bandits” setting) and agents cannot explicitly communicate. Prior approaches typically assume that the receiving side (“arms”) has fixed, known preferences (often even common knowledge), which makes it possible for proposers to avoid conflicts and converge to stable outcomes. This project develops decentralized algorithms that provably converge to stable matchings in strictly harder regimes: (i) when arms’ preferences are known to arms but *not* to players (private), and (ii) when arms themselves are also uncertain about their preferences and must learn them from interaction. Our key idea is to combine optimistic beliefs about (a) reward/value estimates and (b) the probability a proposal will be accepted, so players learn while matching rather than in a separate “explore then commit” phase. The resulting methods (OCA-UCB for private arm preferences and PCA-SCA for fully unknown preferences) converge to stability and drive regret down in simulation, with Thompson-style belief tracking often converging faster and more smoothly than UCB-style tracking in the fully-unknown setting.
date: 2023-08-11
status: ["Preprint"]
tags: ["Matching markets", "Bandits", "Decentralized learning", "Stable matching", "UCB", "Thompson sampling"]
links:
  paper: "https://arxiv.org/abs/2302.06176"
---

## Converging to Stability in Two-Sided Bandits: The Case of Unknown Preferences on Both Sides of a Matching Market

**Authors:** **Gaurab Pokharel**¹, and Sanmay Das¹ 

**Affiliations:** ¹Virginia Tech

---

## Overview

Classic matching-market mechanisms (e.g., Gale–Shapley) assume agents know their preferences. In many real deployments, preferences must be learned from experience: repeated interactions reveal noisy signals about match quality, and agents must decide whom to propose to while anticipating competition and acceptance.

This project studies **two-sided bandits**: repeated matching where proposers must learn rewards for different partners *and* must reason about whether a proposal will be accepted—because acceptance depends on the receiving side’s preferences and other agents’ competing proposals.

---

## Setting (Players, Arms, and Stability)

At each round, each **player** proposes to an **arm**. Arms receive one or more proposals and choose at most one to accept; successful matches generate stochastic rewards and update beliefs. The goal is to converge to a **stable matching**, where no blocking pair prefers each other over their current matches.

We consider three information regimes:

1. **APCK (Arm Preferences Common Knowledge):** arms’ preferences are known and common knowledge.
2. **APKP (Arm Preferences Known but Private):** arms know their preferences, but players do not.
3. **APU (Arm Preferences Unknown):** arms also learn their preferences from interaction.

---

## Algorithms

### Baseline: CA-UCB (APCK)
When arm preferences are common knowledge, players can construct a “plausible set” of arms they could realistically win and propose using UCB-style optimism, avoiding unnecessary conflicts.

### OCA-UCB (APKP)
When arm preferences are private, players maintain optimistic beliefs about how arms rank them, and update those beliefs using minimal conflict feedback (who won a contested arm). This recovers a conflict-avoiding behavior similar to CA-UCB while learning arms’ rankings over time.


<figure style="
  margin: 1.25rem auto;
  width: fit-content;
  max-width: 95%;
  text-align: center;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.7);
  border-radius: 12px;
  padding: 14px 14px 10px;
">
  <img
    src="/images/two-sided-bandits/fig1_apck_apkp.png"
    alt="APCK (CA-UCB) vs APKP (OCA-UCB) stability"
    style="
      display: block;
      margin: 0 auto;
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      background: rgba(255,255,255,0.2);
    "
    width="500"
  />
  <figcaption style="
    margin-top: 10px;
    font-size: 0.95rem;
    line-height: 1.35;
    color: rgba(255,255,255,0.88);
  ">
    <strong>Figure 1.</strong> Left: APCK model with CA-UCB; Right: APKP model with OCA-UCB. Results averaged over 100 runs. Top row: varying market size with uniformly random preferences; bottom row: varying player preference heterogeneity at $N=K=10$. OCA-UCB converges to stability under dual-sided uncertainty, though more slowly due to increased complexity.nput.
  </figcaption>
</figure>




### PCA-SCA (APU)
When arms themselves do not know their preferences, conflict outcomes are initially noisy. PCA-SCA handles this by:
- having arms maintain reward estimates and confidence intervals over players,
- resolving overlaps probabilistically early on,
- having players choose arms by combining (i) reward optimism and (ii) optimistic estimates of **win probability** in contested proposals.

The framework supports both UCB-style and Thompson-style belief tracking.

<figure style="
  margin: 1.25rem auto;
  width: fit-content;
  max-width: 95%;
  text-align: center;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.7);
  border-radius: 12px;
  padding: 14px 14px 10px;
">
  <img
    src="/images/two-sided-bandits/apu_ucb.png"
    alt="Stability Under UCB"
    style="
      display: block;
      margin: 0 auto;
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      background: rgba(255,255,255,0.2);
    "
    width="500"
  />
  <figcaption style="
    margin-top: 10px;
    font-size: 0.95rem;
    line-height: 1.35;
    color: rgba(255,255,255,0.88);
  ">
    <strong>Figure 2.</strong> Results of APU model experiments using UCB to track preferences. The figure on the left shows uniformly random preferences, and the one on the right shows varied player preference heterogeneity ($N=K=10$). Both markets converge to stability in expectation, and there is no dependence on player preference heterogeneity on convergence.
  </figcaption>
</figure>

<figure style="
  margin: 1.25rem auto;
  width: fit-content;
  max-width: 95%;
  text-align: center;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.7);
  border-radius: 12px;
  padding: 14px 14px 10px;
">
  <img
    src="/images/two-sided-bandits/apu_ts.png"
    alt="Stability Under TS"
    style="
      display: block;
      margin: 0 auto;
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      background: rgba(255,255,255,0.2);
    "
    width="500"
  />
  <figcaption style="
    margin-top: 10px;
    font-size: 0.95rem;
    line-height: 1.35;
    color: rgba(255,255,255,0.88);
  ">
    <strong>Figure 3.</strong> Results of APU model experiments using Thompson Sampling to track preferences. Like Figure 2, the figure on the left shows uniformly random preferences, and the one on the right shows varied player preference heterogeneity ($N=K=10$). Both markets converge to stability in expectation, and there is no dependence on player preference heterogeneity on convergence. However, compared to Figure 2, PCA-TS converges to stability quicker than PCA-UCB and in a smoother manner.
  </figcaption>
</figure>


---

## Theory Highlights (High-Level)

- In APKP, optimistic belief updates are enough to preserve convergence guarantees similar to the common-knowledge case.
- In APU, as arms learn and their confidence intervals separate, feedback becomes effectively deterministic; players’ win-probability estimates converge, and the resulting behavior becomes equivalent to the idealized conflict-avoiding execution in the limit.

---

## Simulation Takeaways

Across market sizes and preference heterogeneity:
- The proposed algorithms converge toward stable matchings.
- Player regret declines as learning progresses.
- In the fully-unknown APU model, Thompson Sampling often converges **faster and more smoothly** than UCB.


<figure style="
  margin: 1.25rem auto;
  width: fit-content;
  max-width: 95%;
  text-align: center;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.7);
  border-radius: 12px;
  padding: 14px 14px 10px;
">
  <img
    src="/images/two-sided-bandits/fig3_convergence_proxy.png"
    alt="convergence proxy comparing UCB vs TS "
    style="
      display: block;
      margin: 0 auto;
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      background: rgba(255,255,255,0.2);
    "
    width="300"
  />
  <figcaption style="
    margin-top: 10px;
    font-size: 0.95rem;
    line-height: 1.35;
    color: rgba(255,255,255,0.88);
  ">
    <strong>Figure 4.</strong> Convergence comparison of UCB (solid) and Thompson Sampling (dotted) in the APU model with varying market sizes and uniformly random preferences. Thompson Sampling achieves stability faster and more reliably, while the UCB-based approach exhibits intermittent periods of instability before ultimately converging.
  </figcaption>
</figure>




**Visualization of the Optimism Function** 
<figure style="
  margin: 1.25rem auto;
  width: fit-content;
  max-width: 95%;
  text-align: center;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.7);
  border-radius: 12px;
  padding: 14px 14px 10px;
">
  <img
    src="/images/two-sided-bandits/fig_optimism_function.png"
    alt="Visualization of the Optimism Function"
    style="
      display: block;
      margin: 0 auto;
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      background: rgba(255,255,255,0.2);
    "
    width="300"
  />
  <figcaption style="
    margin-top: 10px;
    font-size: 0.95rem;
    line-height: 1.35;
    color: rgba(255,255,255,0.88);
  ">
    <strong>Figure 5.</strong> Visualization of different levels of "optimism" for different values of $\kappa$. Note that as $\kappa$ increases, the players are more optimistic about their chances of winning a conflict even if their empirical estimate is below 0.5
  </figcaption>
</figure>



---

## Why this matters

Learning in matching markets shows up in hiring pipelines, internships/residencies, platform matching, and school choice variants where preferences are implicit and noisy. This project offers a principled route to **decentralized**, **no-explicit-communication** learning dynamics that still converge to stable outcomes, even when *both* sides begin uncertain.

---

## Citation

```bibtex
 @article{Pokharel_Das_2023, 
    title={Converging to Stability in Two-Sided Bandits: 
    The Case of Unknown Preferences on Both Sides of a Matching Market}, 
    url={http://arxiv.org/abs/2302.06176}, 
    DOI={10.48550/arXiv.2302.06176}, 
    note={arXiv:2302.06176 [cs]}, 
    number={arXiv:2302.06176}, 
    publisher={arXiv}, 
    author={Pokharel, Gaurab and Das, Sanmay}, 
    year={2023}, 
    month=feb 
}

```

---

<div style="display:flex; justify-content:center; margin-top:18px;">
  <a href="https://ojs.aaai.org/index.php/AIES/article/view/36694" target="_blank" rel="noopener" aria-label="Paper (PDF)">
    <img src="/assets/icons/pdf.png" alt="Paper PDF" style="width:100px; height:100px; display:block;" />
  </a>
</div>

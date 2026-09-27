**Authors:** **Gaurab Pokharel**¹ and Sanmay Das¹

**Affiliations:** ¹Virginia Tech

---

## Overview

Classic matching-market mechanisms (e.g., Gale–Shapley) assume agents know their preferences. In many real deployments, preferences must be learned from experience: repeated interactions reveal noisy signals about match quality, and agents must decide whom to propose to while anticipating competition and acceptance.

This project studies **two-sided bandits**: repeated matching where proposers must learn rewards for different partners *and* must reason about whether a proposal will be accepted—because acceptance depends on the receiving side's preferences and other agents' competing proposals.

---

## Setting (players, arms, and stability)

At each round, each **player** proposes to an **arm**. Arms receive one or more proposals and choose at most one to accept; successful matches generate stochastic rewards and update beliefs. The goal is to converge to a **stable matching**, where no blocking pair prefers each other over their current matches.

We consider three information regimes:

1. **APCK (Arm Preferences Common Knowledge):** arms' preferences are known and common knowledge.
2. **APKP (Arm Preferences Known but Private):** arms know their preferences, but players do not.
3. **APU (Arm Preferences Unknown):** arms also learn their preferences from interaction.

---

## Algorithms

### Baseline: CA-UCB (APCK)

When arm preferences are common knowledge, players can construct a "plausible set" of arms they could realistically win and propose using UCB-style optimism, avoiding unnecessary conflicts.

### OCA-UCB (APKP)

When arm preferences are private, players maintain optimistic beliefs about how arms rank them, and update those beliefs using minimal conflict feedback (who won a contested arm). This recovers a conflict-avoiding behavior similar to CA-UCB while learning arms' rankings over time.

<figure>
  <img src="assets/img/projects/two-sided-matching/fig1_apck_apkp.png"
       alt="Stability results for CA-UCB in the APCK model and OCA-UCB in the APKP model across market sizes and preference heterogeneity"
       width="500" loading="lazy" />
  <figcaption><strong>Figure 1.</strong> Left: APCK model with CA-UCB; right: APKP model with OCA-UCB. Results averaged over 100 runs. Top row: varying market size with uniformly random preferences; bottom row: varying player preference heterogeneity at N = K = 10. OCA-UCB converges to stability under dual-sided uncertainty, though more slowly due to the increased complexity.</figcaption>
</figure>

### PCA-SCA (APU)

When arms themselves do not know their preferences, conflict outcomes are initially noisy. PCA-SCA handles this by:

- having arms maintain reward estimates and confidence intervals over players,
- resolving overlaps probabilistically early on,
- having players choose arms by combining (i) reward optimism and (ii) optimistic estimates of **win probability** in contested proposals.

The framework supports both UCB-style and Thompson-style belief tracking.

<figure>
  <img src="assets/img/projects/two-sided-matching/apu_ucb.png"
       alt="Stability results in the APU model when preferences are tracked with UCB"
       width="500" loading="lazy" />
  <figcaption><strong>Figure 2.</strong> Results of APU-model experiments using UCB to track preferences. Left: uniformly random preferences; right: varied player preference heterogeneity (N = K = 10). Both markets converge to stability in expectation, and convergence shows no dependence on player preference heterogeneity.</figcaption>
</figure>

<figure>
  <img src="assets/img/projects/two-sided-matching/apu_ts.png"
       alt="Stability results in the APU model when preferences are tracked with Thompson sampling"
       width="500" loading="lazy" />
  <figcaption><strong>Figure 3.</strong> Results of APU-model experiments using Thompson sampling to track preferences. As in Figure 2, the left panel shows uniformly random preferences and the right shows varied player preference heterogeneity (N = K = 10). Both markets converge to stability in expectation, with no dependence on preference heterogeneity—and compared with Figure 2, PCA-TS converges more quickly and smoothly than PCA-UCB.</figcaption>
</figure>

---

## Theory highlights (high-level)

- In APKP, optimistic belief updates are enough to preserve convergence guarantees similar to the common-knowledge case.
- In APU, as arms learn and their confidence intervals separate, feedback becomes effectively deterministic; players' win-probability estimates converge, and the resulting behavior becomes equivalent to the idealized conflict-avoiding execution in the limit.

---

## Simulation takeaways

Across market sizes and preference heterogeneity:

- The proposed algorithms converge toward stable matchings.
- Player regret declines as learning progresses.
- In the fully-unknown APU model, Thompson sampling often converges **faster and more smoothly** than UCB.

<figure>
  <img src="assets/img/projects/two-sided-matching/fig3_convergence_proxy.png"
       alt="Convergence comparison between UCB and Thompson sampling in the APU model"
       width="300" loading="lazy" />
  <figcaption><strong>Figure 4.</strong> Convergence comparison of UCB (solid) and Thompson sampling (dotted) in the APU model with varying market sizes and uniformly random preferences. Thompson sampling achieves stability faster and more reliably, while the UCB-based approach exhibits intermittent periods of instability before ultimately converging.</figcaption>
</figure>

<figure>
  <img src="assets/img/projects/two-sided-matching/fig_optimism_function.png"
       alt="Curves showing how the optimism function changes with the parameter kappa"
       width="300" loading="lazy" />
  <figcaption><strong>Figure 5.</strong> Different levels of "optimism" for different values of κ. As κ increases, players are more optimistic about their chances of winning a conflict even when their empirical estimate is below 0.5.</figcaption>
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

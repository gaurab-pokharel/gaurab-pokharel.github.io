**Authors:** **Gaurab Pokharel**¹, Diptangshu Sen², Sanmay Das¹, and Juba Ziani²

**Affiliations:** ¹Virginia Tech, ²Georgia Tech

---

## Overview

Many high-stakes allocation systems are *meritocratic* at the point of decision (admit the strongest applicants, hire the top candidates, etc.). But when the program itself **changes future "merit"** (e.g., college boosts future outcomes), meritocracy can create **feedback loops**.

This project studies a simple question:

> If two groups start out identical, can a merit-based, individually-fair selection rule still generate persistent group inequality over time?

---

## Setup (stylized inter-generational model)

We model two equally-sized groups that evolve across generations.

- A scarce program (think "college") has capacity **α** (a fixed fraction of the population per generation).
- Selection is **deterministic and meritocratic** each generation (a best-case setting for fairness).
- The "benefit" of admission is encoded by a success probability **p** (admitted individuals become "high-type" next generation with probability p).
- Non-admitted individuals evolve according to one of two transition models:

### Model 1: Equal Advantage (EA)

Both groups face the same dynamics. Randomness can create a temporary lead, but there is no feedback advantage for the leader.

### Model 2: Affinity Advantage (AA)

A minimal feedback loop: if one group is ahead, its non-admitted members get a small advantage **ε** in becoming high-type next generation.

---

## Main results (intuition)

### 1) Symmetry does *not* imply equal outcomes at all times

Even from identical starting conditions, stochasticity can produce sizeable group gaps—especially when populations are small.

### 2) Equal Advantage eventually returns to parity

Under EA, the system converges to a unique parity fixed point where both groups have the same long-run fraction of high-types.

<figure>
  <img src="assets/img/projects/stochastic-merit/parity_single_run_v2.png"
       alt="Sample trajectories of two groups under the Equal Advantage model, diverging temporarily and returning to parity"
       width="700" loading="lazy" />
  <figcaption><strong>Figure 1.</strong> (EA) Sample trajectories under Equal Advantage showing eventual return to parity.</figcaption>
</figure>

### 3) A tiny Affinity Advantage can lock in permanent separation

Under AA, even a small ε can create persistent long-run separation: stochastic leads appear, then the feedback loop reinforces them.

<figure>
  <img src="assets/img/projects/stochastic-merit/compare_ea_aa_v2.png"
       alt="Comparison of Equal Advantage and Affinity Advantage trajectories: EA returns to parity while AA separates permanently"
       width="700" loading="lazy" />
  <figcaption><strong>Figure 2.</strong> (EA vs AA) With a small affinity advantage, EA restores parity but AA yields persistent separation.</figcaption>
</figure>

### 4) A sharp threshold for extreme dominance

In the AA model (α < 1/2), there is a critical threshold ε* = 2α(1 − p) / (1 − 2α) that separates regimes where the leading group can eventually become overwhelmingly dominant.

---

## Richer simulation model

To test robustness beyond binary "types," we also simulate a richer continuous-ability model where:

- Admitted individuals get a stochastic ability boost,
- Ability transmits imperfectly across generations,
- The leading group's non-admits receive an additional stochastic "affinity" boost.

<figure>
  <img src="assets/img/projects/stochastic-merit/admit_proprotions_fullmodel_final.png"
       alt="Heatmap of the leading group's share of admissions as capacity and mean affinity advantage vary"
       width="500" loading="lazy" />
  <figcaption><strong>Figure 3.</strong> (Simulation) Heatmap of the leading group's share among admits versus capacity α and mean affinity advantage.</figcaption>
</figure>

---

## Why this matters (for algorithmic fairness)

Static, one-shot fairness can look "perfect" in each round, yet long-run disparities can still:

- arise due to randomness,
- persist due to feedback loops,
- worsen under scarcity.

This suggests fairness interventions should explicitly reason about **dynamics**, **scarcity**, and **long-run equilibria**, not only per-round constraints.

---

## Citation

```bibtex
@article{Pokharel_Sen_Das_Ziani_2025,
  title={Fixed Points and Stochastic Meritocracies: A Long-Term Perspective},
  author={Pokharel, Gaurab and Sen, Diptangshu and Das, Sanmay and Ziani, Juba},
  year={2025},
  url={http://arxiv.org/abs/2510.07478},
  doi={10.48550/arXiv.2510.07478}
}
```

*This work was supported by the US National Science Foundation (NSF) under grants IIS-2504990, IIS-2336236, and IIS-2533162.*

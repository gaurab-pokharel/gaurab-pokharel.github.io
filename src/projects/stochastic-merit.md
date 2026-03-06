---
layout: layouts/project.njk
title: "Fixed Points and Stochastic Meritocracies"
description: "Meritocratic selection into scarce opportunities (e.g., elite schools, jobs, or housing) is often treated as a best-case mechanism for fairness: choose the strongest candidates today, and do so symmetrically across groups. This project shows why that intuition can fail over time. We study an inter-generational selection process in which admission increases future “merit,” so that today’s selection changes tomorrow’s applicant pool. Even when two groups start identical and the per-period rule is deterministic and merit-based, stochastic shocks can create substantial transient gaps. In an Equal-Advantage benchmark, these gaps eventually wash out and the system converges back to parity, with the speed of convergence depending on program capacity and efficacy. But when we introduce a minimal feedback loop—an Affinity-Advantage in which the currently leading group’s non-admitted members receive even a tiny boost—random early leads become self-reinforcing, producing persistent long-run separation and, beyond a threshold, extreme dominance. Simulations in a richer continuous-ability model mirror the theory: small feedback advantages can entrench inequality despite individually fair decision rules. The results emphasize that static fairness at a single decision point is insufficient in dynamic settings, and that policy and algorithm design must explicitly account for long-run feedback, scarcity, and the stability properties of the induced process."
date: 2024-10-10
status: ["Upcoming", "FAccT '26"]
tags: ["Long-run fairness", "Feedback loops", "Stochastic processes", "Meritocratic selection", "Dynamics"]
links:
  paper: "https://arxiv.org/abs/2510.07478"
---

# Fixed Points and Stochastic Meritocracies: A Long-Term Perspective 

**Authors:** **Gaurab Pokharel**¹, Diptangshu Sen², Sanmay Das¹, and Juba Ziani² 

**Affiliations:** ¹Virginia Tech, ²Georgia Tech


---

## Overview

Many high-stakes allocation systems are *meritocratic* at the point of decision (admit the strongest applicants, hire the top candidates, etc.).  
But when the program itself **changes future “merit”** (e.g., college boosts future outcomes), meritocracy can create **feedback loops**.

This project studies a simple question:

> If two groups start out identical, can a merit-based, individually-fair selection rule still generate persistent group inequality over time?

---

## Setup (Stylized Inter-generational Model)

We model two equally-sized groups that evolve across generations.

- A scarce program (think “college”) has capacity **α** (a fixed fraction of the population per generation).
- Selection is **deterministic and meritocratic** each generation (a best-case setting for fairness).
- The “benefit” of admission is encoded by a success probability **p** (admitted individuals become “high-type” next generation with probability p).
- Non-admitted individuals evolve according to one of two transition models:

### Model 1: Equal Advantage (EA)
Both groups face the same dynamics. Randomness can create a temporary lead, but there is no feedback advantage for the leader.

### Model 2: Affinity Advantage (AA)
A minimal feedback loop: if one group is ahead, its non-admitted members get a small advantage **ε** in becoming high-type next generation.

---

## Main Results (Intuition)

### 1) Symmetry does *not* imply equal outcomes at all times
Even from identical starting conditions, stochasticity can produce sizeable group gaps—especially when populations are small.

### 2) Equal Advantage eventually returns to parity
Under EA, the system converges to a unique parity fixed point where both groups have the same long-run fraction of high-types.


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
    src="/images/stochastic-merit/parity_single_run_v2.png"
    alt="EA Return to Parity"
    style="
      display: block;
      margin: 0 auto;
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      background: rgba(255,255,255,0.2);
    "
    width="700"
  />
  <figcaption style="
    margin-top: 10px;
    font-size: 0.95rem;
    line-height: 1.35;
    color: rgba(255,255,255,0.88);
  ">
    <strong>Figure 1.</strong> (EA) Sample trajectories under Equal Advantage showing eventual return to parity.
  </figcaption>
</figure>


### 3) A tiny Affinity Advantage can lock in permanent separation
Under AA, even a small ε can create persistent long-run separation: stochastic leads appear, then the feedback loop reinforces them.

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
    src="/images/stochastic-merit/compare_ea_aa_v2.png"
    alt="EA vs. AA Return to Parity"
    style="
      display: block;
      margin: 0 auto;
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      background: rgba(255,255,255,0.2);
    "
    width="700"
  />
  <figcaption style="
    margin-top: 10px;
    font-size: 0.95rem;
    line-height: 1.35;
    color: rgba(255,255,255,0.88);
  ">
    <strong>Figure 2.</strong> (EA vs AA) With a small affinity advantage, EA restores parity but AA yields persistent separation.
  </figcaption>
</figure>



### 4) A sharp threshold for extreme dominance
In the AA model (α < 1/2), there is a threshold
$\tilde{\epsilon} = \frac{2\alpha(1-p)}{1-2\alpha}$
that separates regimes where the leading group can eventually become overwhelmingly dominant.

---

## Richer Simulation Model

To test robustness beyond binary “types,” we also simulate a richer continuous-ability model where:

- Admitted individuals get a stochastic ability boost,
- Ability transmits imperfectly across generations,
- The leading group’s non-admits receive an additional stochastic “affinity” boost.


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
    src="/images/stochastic-merit/admit_proprotions_fullmodel_final.png"
    alt="Full Model"
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
    <strong>Figure 2.</strong> (Simulation) Heatmap of leading-group share among admits versus capacity α and mean affinity advantage.
  </figcaption>
</figure>



## Why this matters (for algorithmic fairness)

Static, one-shot fairness can look “perfect” in each round, yet long-run disparities can still:
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
---

*Work supposed by US National Science Foundation (NSF) under grants IIS-2504990, IIS-2336236 and IIS-2533162.*

---

<div style="display:flex; justify-content:center; margin-top:18px;">
  <a href="https://arxiv.org/abs/2510.07478" target="_blank" rel="noopener" aria-label="Paper (PDF)">
    <img src="/assets/icons/pdf.png" alt="Paper PDF" style="width:100px; height:100px; display:block;" />
  </a>
</div>


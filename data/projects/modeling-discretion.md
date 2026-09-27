**Authors:** **Gaurab Pokharel**¹, Sanmay Das¹, and Patrick J. Fowler²

**Affiliations:** ¹Virginia Tech, ²Washington University in St. Louis

**Venue:** *Advances in Neural Information Processing Systems (NeurIPS 2026), spotlight paper*

---

## Overview

Street-level bureaucrats (caseworkers, triage nurses, etc.) constantly balance rigid policy rules with the complex reality of individual cases. While they often have the professional authority to override a default recommendation, this discretion is a finite resource—using it today reduces the ability to use it tomorrow.

In this paper, we formalize this dilemma as **Budgeted Discretion**. We model it as a dynamic allocation problem where an agent must choose when to spend a limited "override budget" over a finite time horizon to maximize total welfare.

> **Key takeaway:** Optimal agents follow a simple threshold rule—they "hold their fire" and conserve discretion for rare, high-stakes outliers when the potential welfare gains are fat-tailed (highly varied), but spend more routinely when gains are thin-tailed (more uniform).

---

## Theoretical contribution

### The behavioral invariance theorem

We identify a "behavioral invariance" in optimal decision-making. For location-scale families of improvement distributions, the rate at which an optimal agent exercises discretion is **independent of the scale of potential gains** and depends only on the distribution's **shape** (its tail profile).

This yields a unit-free prediction: changing the units of measurement (e.g., dollars vs. thousands) changes the numerical thresholds but **does not change the probability** that an agent will choose to override at a given state.

<figure>
  <img src="assets/img/projects/modeling-discretion/fig1.png"
       alt="Two panels: identical spending trajectories across scale parameters, and the evolution of patient versus aggressive override policies"
       width="800" loading="lazy" />
  <figcaption><strong>Figure 1.</strong> (a) The spending trajectory remains identical despite varying scale parameters. (b) How "patient" (fat-tailed) versus "aggressive" (thin-tailed) policies evolve over time.</figcaption>
</figure>

---

## Empirical evidence: homelessness services

Using operational data from the St. Louis Homeless Management Information System (HMIS) between 2008 and 2014, we test if real-world overrides track operational constraints. We recover a baseline "heuristic policy" using decision trees and define discretion as any instance where a caseworker deviates from this baseline.

### Key findings

- **Strategic rationing:** Caseworkers dynamically adjust their rationing based on inventory. The probability of "rationing" (moving a client from scarce housing back to the default shelter) rises when shelter exits create openings and falls when housing exits expand availability.
- **Operational bandwidth:** Discretion is not a frictionless exercise. It peaks on **Mondays** (reflecting start-of-week batching) and drops significantly on **weekends** when intake operations are effectively offline.
- **Seasonality:** Overrides are more "front-loaded" early in the federal fiscal year (starting in October), with the composition shifting toward more "upgrades" as the year progresses.

<figure>
  <img src="assets/img/projects/modeling-discretion/fig2.png"
       alt="Heatmap of optimal override thresholds across remaining time and remaining budget"
       width="800" loading="lazy" />
  <figcaption><strong>Figure 2.</strong> A heatmap of optimal thresholds T(τ, k). Darker regions indicate states where agents require a very high perceived gain to justify spending their remaining budget.</figcaption>
</figure>

---

## Implications for AI and decision support

Our results provide a foundation for designing decision-support systems that preserve beneficial human judgment without forgoing oversight. If overrides are scarce, systems should assist bureaucrats not just in *which* cases merit discretion, but *when* to deploy it given future option values and workflow constraints.

---

## Citation

```bibtex
@inproceedings{Pokharel_Das_Fowler_2026,
    title={Budgeting Discretion: Theory and Evidence on Street-Level Decision-Making},
    author={Pokharel, Gaurab and Das, Sanmay and Fowler, Patrick J.},
    booktitle={Advances in Neural Information Processing Systems (NeurIPS 2026)},
    year={2026},
    note={Spotlight paper},
    url={https://arxiv.org/abs/2602.10039}
}
```

*This work was supported by NSF Award 2533162.*

---
layout: layouts/project.njk
title: Budgeting Discretion
description: "This research formalizes street-level discretion as a finite-budget resource allocation problem, proving that optimal decision-makers follow a dynamic threshold rule determined by the tail-heaviness of potential welfare gains. By analyzing years of homelessness service data, the study demonstrates that human caseworkers strategically ration their discretionary authority in response to real-world capacity openings and operational timing. The findings highlight that discretion is a managed resource, offering a unit-free framework for comparing decision-making personalities across different institutional settings."
date: "2025-06-01"
status: ["Under Review", "Ongoing"]
tags: ["Dynamic programming", "Resource allocation", "Discretion", "Invariance", "Heavy tails"]
links: 
  paper: "https://arxiv.org/abs/2602.10039"
---

# Budgeting Discretion: Theory and Evidence on Street-Level Decision-Making

**Authors:** **Gaurab Pokharel**¹, Sanmay Das¹, and Patrick J. Fowler²

**Affiliations:** ¹Virginia Tech, ²Washington University in St. Louis

---

## **Overview**

Street-level bureaucrats (caseworkers, triage nurses, etc.) constantly balance rigid policy rules with the complex reality of individual cases. While they often have the professional authority to override a default recommendation, this discretion is a finite resource—using it today reduces the ability to use it tomorrow.

In this paper, we formalize this dilemma as **Budgeted Discretion**. We model it as a dynamic allocation problem where an agent must choose when to spend a limited "override budget" over a finite time horizon to maximize total welfare.


> **Key Takeaway:** Optimal agents follow a simple threshold rule—they "hold their fire" and conserve discretion for rare, high-stakes outliers when the potential welfare gains are fat-tailed (highly varied), but spend more routinely when gains are thin-tailed (more uniform).


---

## **Theoretical Contribution**

### **The Behavioral Invariance Theorem**

We identify a "behavioral invariance" in optimal decision-making. For location-scale families of improvement distributions, the rate at which an optimal agent exercises discretion is **independent of the scale of potential gains** and depends only on the distribution's **shape** (its tail profile).

This yields a unit-free prediction: changing the units of measurement (e.g., dollars vs. thousands) changes the numerical thresholds but **does not change the probability** that an agent will choose to override at a given state.

---

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
    src="/images/discmodel/fig1.png"
    alt="Spending Profiles"
    style="
      display: block;
      margin: 0 auto;
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      background: rgba(255,255,255,0.02);
    "
    width="800"
  />
  <figcaption style="
    margin-top: 10px;
    font-size: 0.95rem;
    line-height: 1.35;
    color: rgba(255,255,255,0.88);
  ">
    <strong>Figure 1.</strong> (a) Shows how the spending trajectory remains identical despite varying scale parameters. (b) Illustrates how "patient" (fat-tailed) versus "aggressive" (thin-tailed) policies evolve over 
  </figcaption>
</figure>


---

## **Empirical Evidence: Homelessness Services**

Using operational data from the St. Louis Homeless Management Information System (HMIS) between 2008 and 2014, we test if real-world overrides track operational constraints. We recover a baseline "heuristic policy" using decision trees and define discretion as any instance where a caseworker deviates from this baseline.

### **Key Findings:**

* **Strategic Rationing:** Caseworkers dynamically adjust their rationing based on inventory. The probability of "rationing" (moving a client from scarce housing back to the default shelter) rises when shelter exits create openings and falls when housing exits expand availability.


* **Operational Bandwidth:** Discretion is not a frictionless exercise. It peaks on **Mondays** (reflecting start-of-week batching) and drops significantly on **weekends** when intake operations are effectively offline.


* 
**Seasonality:** Overrides are more "front-loaded" early in the federal fiscal year (starting in October), with the composition shifting toward more "upgrades" as the year progresses.



---

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
    src="/images/discmodel/fig2.png"
    alt="The opportunity cost map"
    style="
      display: block;
      margin: 0 auto;
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      background: rgba(255,255,255,0.02);
    "
    width="800"
  />
  <figcaption style="
    margin-top: 10px;
    font-size: 0.95rem;
    line-height: 1.35;
    color: rgba(255,255,255,0.88);
  ">
    <strong>Figure 2.</strong> A heatmap of optimal thresholds ($\mathcal{T}_{\tau,k}$). Darker regions indicate states where agents require a very high perceived gain to justify spending their remaining budget.
  </figcaption>
</figure>

---

## **Implications for AI & Decision Support**

Our results provide a foundation for designing decision-support systems that preserve beneficial human judgment without forgoing oversight. If overrides are scarce, systems should assist bureaucrats not just in *which* cases merit discretion, but *when* to deploy it given future option values and workflow constraints.

---

## **Citation**

```bibtex
 @article{Pokharel_Das_Fowler_2026, 
     title={Budgeting Discretion: Theory and Evidence on Street-Level Decision-Making}, 
     rights={Creative Commons Attribution 4.0 International}, 
     url={https://arxiv.org/abs/2602.10039}, 
     DOI={10.48550/ARXIV.2602.10039}, 
     publisher={arXiv}, 
     author={Pokharel, Gaurab and Das, Sanmay and Fowler, Patrick J.}, 
     year={2026} 
}
```
---

*This work was supported by NSF Award 2533162.*

---

<div style="display:flex; justify-content:center; margin-top:18px;">
  <a href="https://arxiv.org/abs/2602.10039" target="_blank" rel="noopener" aria-label="Paper (PDF)">
    <img src="/assets/icons/pdf.png" alt="Paper PDF" style="width:100px; height:100px; display:block;" />
  </a>
</div>
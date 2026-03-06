---
layout: layouts/base.njk
title: "Eviction Prediction Framework"
description: "Modular pipeline for eviction risk modeling with strict temporal separation."
date: 2026-03-01
status: ["Active"]
tags: ["Temporal splits", "Feature engineering", "Model evaluation", "Reproducibility"]
---

## Problem statement
Eviction risk modeling is often undermined by **data leakage**, ad-hoc feature pipelines, and inconsistent train/test splits that do not reflect how the model would be used in production. The goal of this project is to build a reproducible framework that (1) enforces strict temporal separation, (2) supports rapidly iterating on feature sets and models, and (3) produces comparable evaluations across experiments.

## Solution approach
I built a modular, interface-driven pipeline with:
- **Configurable temporal cohorts** (train and multiple future test windows) to enforce leakage-free evaluation.
- A **feature-generator architecture** (pluggable “generators” for property-, owner-, and case-level features) with consistent naming, documentation, and validation.
- A modeling layer supporting baseline models and more expressive learners (e.g., gradient-boosted trees), with cross-validation and tracked hyperparameters.
- Evaluation utilities for **PR-AUC / ROC-AUC**, calibration checks, and cohort-level breakdowns.

## Results
- A single framework that can run repeated experiments across time windows and feature bundles without re-writing data prep logic.
- Clearer diagnosis of performance drops after refactors by isolating differences in **feature definitions**, **cohort construction**, and **training protocol**.
- A maintainable foundation for adding new feature families (e.g., recency/volatility trends, network/owner aggregation, and policy-relevant derived signals).

## Main conclusions
A rigorous eviction-risk workflow requires the pipeline to be as “auditable” as the model: when temporal splits and features are first-class objects, it becomes far easier to (a) prevent leakage, (b) compare experiments honestly, and (c) ship improvements without regressions.
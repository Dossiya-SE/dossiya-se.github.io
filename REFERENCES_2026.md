# 2026 frontier references

This file records current literature used to position the portfolio's frontier methods. These references support the **method-status statements** on the site; they do not validate the site's illustrative reduced-order infrastructure parameters.

## Operator learning

1. Subedi, U., & Tewari, A. (2026). **Operator Learning: A Statistical Perspective.** *Annual Review of Statistics and Its Application*, 13, 123–148. DOI: https://doi.org/10.1146/annurev-statistics-042424-070908

   Relevance: formalizes operator learning as function-to-function regression, reviews PDE-oriented operator learning, physics/mathematics-informed constraints, and identifies rigorous uncertainty quantification as an important continuing direction.

2. **Operator learning at machine precision** (2026), *Journal of Computational Physics*.

   Relevance: reinforces the many-query value of learned PDE operators while emphasizing limits relative to high-fidelity solvers, including training cost, out-of-distribution degradation, high-dimensional/multiscale difficulty, and weaker guarantees for error control, stability, and interpretability.

## Physics-informed machine learning for infrastructure

3. Sanit, P., & Prasittisopin, L. (2026). **A systematic review and thematic analysis of physics-informed machine learning in construction and infrastructure systems.** *Discover Artificial Intelligence*. Published 17 July 2026. https://link.springer.com/article/10.1007/s44163-026-01747-6

   Relevance: surveys physics-informed approaches for state estimation, digital twins, performance/deterioration prediction, multi-hazard response and maintenance decision support, while identifying computational cost, incomplete uncertainty quantification, limited multiphysics integration, benchmark scarcity and regulatory issues as persistent limitations.

## Kolmogorov–Arnold networks and scientific ML

4. **Kolmogorov-Arnold networks for data-driven, physics-informed, and deep-operator learning: a review, synthesis, and new analysis** (2026), *Neural Networks*. DOI: https://doi.org/10.1016/j.neunet.2026.108791

   Relevance: representative of the 2026 expansion of scientific ML beyond standard multilayer perceptrons toward alternative architectures for data-driven, physics-informed and operator-learning tasks.

## Portfolio policy derived from the literature

The site therefore follows five rules:

1. conservation and governing equations remain explicit when known;
2. learned surrogates are benchmarked against classical numerical solvers;
3. uncertainty and out-of-distribution behavior are reported rather than hidden;
4. inverse problems require identifiability analysis, not only low training loss;
5. no frontier method is presented as a mathematical guarantee merely because it produces accurate examples.

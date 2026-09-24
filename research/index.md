---
layout: research
title: Research Architecture
kicker: Seven-stage framework
description: A publication view of the research system from structural evidence to sustainable transformation.
permalink: /research/
---

<div class="research-grid">
{% assign ordered_stages = site.stages | sort: "stage" %}
{% for stage in ordered_stages %}
  <article class="research-card">
    <p class="research-kicker">Stage {{ stage.stage }}</p>
    <h3><a href="{{ stage.url | relative_url }}">{{ stage.title }}</a></h3>
    <p>{{ stage.question }}</p>
  </article>
{% endfor %}
</div>

## System boundary

\[
\boxed{
\text{Python computes}
\rightarrow
\text{structured files preserve}
\rightarrow
\text{Jekyll organizes}
\rightarrow
\text{TypeScript visualizes}
}
\]

The Jekyll layer publishes research objects. It does not replace simulation, inference, optimization, or scientific verification.

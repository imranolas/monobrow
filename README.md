# Monobrow
Change detection for Javascript mono repos

When working with a monorepo containing multiple build targets it can be difficult to determine which products are affected whenever a change is made. A naive solution is often to rebuild everything but this is wasteful on CI resources and can lead to timely delays in the feedback loop.


## What is this?
MonoBrow is a simple tool to identify which targets are affected given changes between git branches, typically a feature branch and master.

A use case for Monobrow might be a monorepo containing a UI library shared across mutiple deployable products. Whenever a change is made to a shared component we want any dependant products to be rebuilt.

### Repo layout

Monobrow makes some assumptions about the repo.

  - The repos contains JS projects only.
  - *Products* are top level folders in the monorepo root that contain a `package.json`.

  ## Usage

  Run `monobrow` from the monorepo root from the branch containing the changes. The STDOUT will display a list of folders/products that are affected by the changes. The use of STDOUT means you can integrate this into you own CI pipeline as desired.
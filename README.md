# Open bus ranking app

[![Netlify Status](https://api.netlify.com/api/v1/badges/d3ef62c2-b5bb-48ac-8299-71e5bd22b211/deploy-status)](https://app.netlify.com/sites/open-bus/deploys)

This app is created by the volunteers of [Public Knowledge Workshop](https://www.hasadna.org.il/)

## Developers:

### Running the project:

- clone the repo
- `yarn install`
- `yarn start`

### Generating OpenAPI client:

The app uses the [stride api](https://open-bus-stride-api.hasadna.org.il/), which is an OpenAPI endpoint that exposes public bus data.
The api clients are auto-generated, and may need regenerating as the api changes.
to generate the api client:

- `yarn generate:openapi`

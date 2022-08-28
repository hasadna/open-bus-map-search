# Open bus ranking app  

This app is created by th volunteers of [Public Knowledge Workshop](https://www.hasadna.org.il/)


## Developers:

### Running the project: 
- clone the repo
- `yarn install`
- `yarn start`


### Generating OpenAPI client:
The app uses the [stride api](https://open-bus-stride-api.hasadna.org.il/), which is an OpenAPI endpoint that exposes public bus data.
The api clients are auto-generated, and may need regenerating as the api changes.
to generate the api client:

`yarn openapi:generate`
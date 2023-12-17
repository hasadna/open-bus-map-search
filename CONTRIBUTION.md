# Contribution:

## Running the project:

- fork the repo
- clone the repo
- `yarn install`
- `yarn start`

## testing the project:

| command             | description                                                     |
| ------------------- | --------------------------------------------------------------- |
| `yarn test:unit`    | Run the unit tests using `watch` option (good for development). |
| `yarn test:unit:ci` | Run the unit tests (good for ci).                               |
| `yarn test:e2e`     | Run the e2e (playwright) tests (good for ci).                   |
| `yarn test:e2e:ui`  | Run the e2e (playwright) tests with user interface.             |
| `yarn test`         | Run all the kind of tests.                                      |

- additional helpful flags - https://playwright.dev/docs/test-cli

## useful resources:

- [the design file](https://www.figma.com/file/Plw8Uuu6U96CcX5tJyRMoW/Public-Transportation-visual-informaiton?type=design&node-id=0-1&mode=design&t=Dh8lI3EJ37unxvoe-0)
- [data model schema](https://github.com/hasadna/open-bus-stride-db/blob/main/DATA_MODEL.md)
- [API documentation and examples (swagger)](https://open-bus-stride-api.hasadna.org.il/docs)
- [the deployed website](https://open-bus-map-search.hasadna.org.il/dashboard)

## submitting pull requests

Thanks for your willingness to invest time and help us improve!

1. If you're new to GitHub, here is a [tutorial describing Pull Requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request). if you're familiarized with Merge Requests - it's the same concept.
2. Please make sure that the project works on your computer
3. Please tag one of the maintainers as reviewers
   we're here to help! feel free to join our [Slack channel](https://join.slack.com/t/hasadna/shared_invite/zt-21qipktl1-7yF4FYJVxAqXl0wE4DlMKQ)

# Related Repositories

- the API client
- the data API

## API client

The client is a JS library that provides methods and data models. for example:  
https://github.com/hasadna/open-bus-map-search/blob/main/src/model/busStop.ts#L4  
[link to repo](https://github.com/iliakap/open-bus-stride-client).

## data API

The API is backend code that provides us with data and aggregations from the DB
You can see it's endpoints here:  
https://open-bus-stride-api.hasadna.org.il/docs  
[link to repo](https://github.com/hasadna/open-bus-stride-api).

## FAQ

### Why do I get a red `x` commit status?

- lint - you have lint errors. fix them by running `yarn lint:fix`
- tests - you have test errors. see them by running `yarn test:unit:ci`
- build - you have build errors. see them by running `yarn build`
- pr title validation - you have an invalid pr title. please edit the title of your PR with conventional commit formatting. examples: `feat: add new feature`, `fix: fix a bug` or `docs: update README.md`

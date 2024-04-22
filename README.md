# Open bus ranking app

## Welcome!
This is the official repository of the open bus (תחב"צ פתוחה / דאטאבוס) project - also known as "ShameBus".
[link to the project](https://open-bus-map-search.hasadna.org.il/dashboard)

Please feel free to submit pull requests and contribute to the project.
For more details about contributing, see the [CONTRIBUTING.md](CONTRIBUTING.md) file.

# Running the project locally
An explanation how to run the project locally you can [read here](CONTRIBUTING.md#running-the-project-on-a-local-environment).

## View video (Hebrew language):
### The video will explain you how to contribute to the project:   
[![video (hebrew) about the project](https://img.youtube.com/vi/6H6jkJCVhgk/0.jpg)](https://www.youtube.com/watch?v=6H6jkJCVhgk)

# Easter eggs
We've hidden a couple of fun surprises in our web app, just for you. Discovering them is as easy as typing a few magic words on your keyboard.

## How to Find the Easter Eggs
1. Open our [web app](https://open-bus-map-search.hasadna.org.il/dashboard)
2. **Unleash the Magic Words:**
   To reveal the hidden gems, use your keyboard to type the following commands:

   - **Type "storybook":**
     Watch the magic unfold as you type "storybook" on your keyboard. You might just stumble upon our Storybook, a treasure trove of UI components showcasing the beauty and functionality of our app.
   - **Type "english":**
     Feel like switching up the language? Type "english" and see the language toggle in action. Our app is multilingual, and you can experience it by triggering this secret command.
   - **Type "geek":**
     To get some experimental charts with some additional data and aggregation


## deployments

This app is created by the volunteers of [Public Knowledge Workshop](https://www.hasadna.org.il/)

### submitting pull requests
Thanks for your willingness to invest time and help us improve!
1. If you're new to GitHub, here is a [tutorial describing Pull Requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request). if you're familiarized with Merge Requests - it's the same concept.
2. Please make sure that the project works on your computer
3. Please tag one of the maintainers as reviewers
we're here to help! feel free to join our [Slack channel](https://join.slack.com/t/hasadna/shared_invite/zt-21qipktl1-7yF4FYJVxAqXl0wE4DlMKQ) 

## Links for developers
* [figma file](https://www.figma.com/file/Plw8Uuu6U96CcX5tJyRMoW/Public-Transportation-visual-informaiton?node-id=0%3A1&t=EJCQpeg5zSbVXLUx-0)
* [data model schema](https://github.com/hasadna/open-bus-stride-db/blob/main/DATA_MODEL.md)
* [Slack channel](https://join.slack.com/t/hasadna/shared_invite/zt-21qipktl1-7yF4FYJVxAqXl0wE4DlMKQ)
* [Swagger](https://open-bus-stride-api.hasadna.org.il/docs)
* [Production](https://open-bus-map-search.hasadna.org.il/dashboard)

## Related Repositories 
- the API client
- the data API

### API client
The client is a JS library that provides methods and data models. for example:  
https://github.com/hasadna/open-bus-map-search/blob/main/src/model/busStop.ts#L4   
[link to repo](https://github.com/iliakap/open-bus-stride-client).


## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ShayAdler"><img src="https://avatars.githubusercontent.com/u/61648359?v=4?s=100" width="100px;" alt="Shay"/><br /><sub><b>Shay</b></sub></a><br /><a href="#code-ShayAdler" title="Code">💻</a> <a href="#doc-ShayAdler" title="Documentation">📖</a> <a href="#mentoring-ShayAdler" title="Mentoring">🧑‍🏫</a> <a href="#ideas-ShayAdler" title="Ideas, Planning, & Feedback">🤔</a> <a href="#research-ShayAdler" title="Research">🔬</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://noam-gaash.co.il"><img src="https://avatars.githubusercontent.com/u/11145132?v=4?s=100" width="100px;" alt="Noam Gaash"/><br /><sub><b>Noam Gaash</b></sub></a><br /><a href="#projectManagement-NoamGaash" title="Project Management">📆</a> <a href="#test-NoamGaash" title="Tests">⚠️</a> <a href="#code-NoamGaash" title="Code">💻</a> <a href="#doc-NoamGaash" title="Documentation">📖</a> <a href="#review-NoamGaash" title="Reviewed Pull Requests">👀</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/KirilCycle"><img src="https://avatars.githubusercontent.com/u/118115736?v=4?s=100" width="100px;" alt="Kiril Volskiy"/><br /><sub><b>Kiril Volskiy</b></sub></a><br /><a href="#code-KirilCycle" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

### data API
The API is backend code that provides us with data and aggregations from the DB
You can see it's endpoints here:   
https://open-bus-stride-api.hasadna.org.il/docs     
[link to repo](https://github.com/hasadna/open-bus-stride-api).
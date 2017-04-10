# Morning routine #

## Setup ##

1. Install [Node v6 (LTS)](https://nodejs.org/en/download/), and then run:

  ```console
  > npm install
  ```
2. Create a **craft ai** project and retrieve your tokens.
3. Setup the needed environments variables in a `.env` file with the following:

  ```
  CRAFT_OWNER=<your_craft_ai_owner>
  CRAFT_PROJECT=<your_craft_ai_projet>
  CRAFT_TOKEN=<your_craft_ai_write_token>

  REACT_APP_CRAFT_OWNER=<your_craft_ai_owner>
  REACT_APP_CRAFT_PROJECT=<your_craft_ai_owner>
  REACT_APP_CRAFT_TOKEN=<your_craft_ai_read_token>
  ```

## Agents creation ##

To recreate the agents from the input data, run:

```console
> PERSONA=all npm run start:create_agents
```

to re-create the agents for all the existing personas, run:

```console
> PERSONA=cadre,student npm run start:create_agents
```

to re-create the agents for the given personas (here 'cadre' and 'student').

> :warning: This operations create lots of agents and upload a ton of data, it takes a little while!

## Webapp ##

The webapp is developped upon [create-react-app](https://github.com/facebookincubator/create-react-app), for further info and documentation check [this guide](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

To launch the development mode, run:

```console
> npm run start:webapp
```

Debug's enable state is currently persisted by `localStorage` in the browser. You can enable it using:

```js
localStorage.debug = 'craft-ai:*'
```

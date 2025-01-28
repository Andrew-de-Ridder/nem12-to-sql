# nem12-to-sql

A simple node command line app that will transform NEM12 format files into a specific sql insert statements

## Context

Given a NEM12 CSV files as specified in this
[spec](https://aemo.com.au/-/media/files/electricity/nem/retail_and_metering/market_settlement_and_transfer_solutions/2022/mdff-specification-nem12-nem13-v25.pdf?la=en)
, this codebase will transform it to insert statements for the following table

```
create table meter_readings (
    id            uuid        default gen_random_uuid() not null,
    "nmi"         varchar(10) not null,
    "timestamp"   timestamp   not null,
    "consumption" numeric     not null,

    constraint meter_readings_pk primary key (id),
    constraint meter_readings_unique_consumption unique ("nmi", "timestamp")
);
```

## Setup

nem12-to-sql runs on node, and uses the current LTS version (v22.13.1) you should be on at least this also

```
node -v
```

`v22.13.1`

Once you have that, clone the repo code locally and install the dependencies

```
git clone https://github.com/Andrew-de-Ridder/nem12-to-sql.git
cd nem12-to-sql
npm install
```

The config (locations of input and output files) for the project is read in from a .env file.
Run the init command to copy the [.env.example](.env.example) file into .env

```
npm run init
```

You can configure the locations of the input and output for the project from this file

`INPUT_FILE="./sample/input.csv"`
`OUTPUT_FILE="./sample/output.sql"`

## Running

Once the setup is complete the project can be run with the start command

```
npm run start
```

This will provide feedback on the console as to how the processing is going.
Once complete, the output can be seed in the file specified in the OUTPUT_FILE variable of the .env file

## Full list of commands

| Command            | Description                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| npm run init       | Copies the `.env.example` file into `.env`. Should be run on first time setup                            |
| npm run start      | Starts the nem12-to-sql translation process using the input and output specified in `.env`               |
| npm run tsc        | Runs the TypeScript compiler to ensure the codebase is well typed. This runs as part of automated CI too |
| npm run lint       | Runs esLint and Prettier to ensure code is correctly formated and free of known syntax errors and bugs   |
| npm run lint:fix   | Runs esLint and Prettier with fix flags that will automatically fix trivial issues                       |
| npm run test       | Runs the unit tests using vitest                                                                         |
| npm run test:watch | Runs the unit tests using vitest every time code files are changed                                       |
| npm run e2e        | Runs end-to-end tests that check to see that the entire system is producing correct output               |

## Type-stripping

nem12-to-sql does use one experimental (although soon to be mainline) node feature; type-stripping.
Type-stripping allows node to parse and run typescript files without any extra transpiling or tooling.
It does this by ignoring the type syntax in the files at runtime.
IDEs and CI/CD tooling are still able to use the types to ensure a typesafe codebase, but node can be used directly.
Node will [unflag](https://www.totaltypescript.com/typescript-is-coming-to-node-23) this feature very soon

## Questions

### What are the advantages of the technologies you used for the project?

I chose a modern TypeScript tech stack that let me build a solution quickly without too much boilerplate code.
Admittedly, there is some effort required to ensure that all the types are defined correctly, but my IDE and
the use of already type aware libraries helps enormously.

There are already many battle-tested tools, libraries, and conventions that I used to ensure my code is of a very high
standard; it is linted, tested, and formatted automatically, and it was trivial to set up CI automations to ensure and
enforce the code quality on an ongoing basis

Another big advantage is familiarity, as I have quite a lot of recent experience with similar stacks. There is also a
large wider-community of typescript and web/node engineering to draw from as well. This means that I was quickly able to
get myself unstuck when I encountered issues during development

### How is the code designed and structured?

The app is structured around the main loop in the App entrypoint. The loop will loop over every line in the input file
and will perform processing to build up a Record based on the hierarchy of the NEM12 format. When a 200-record is
encountered a new Record will be initialised and the relevant information form the 200-record populated into it. When a
300-record is encountered the interval details are added to an array on the Record. When a 500-record is found, then it
is time to calculate the consumption for the now fully furnished Record. The logic for that is handled by a
RecordProcessor that will return an array of strings for each of the sql insert statements needed. Most of the remaining
codebase is utils and helpers in the package structure below

```
 /src
    |-- /config      // Fetching and validating configuration
    |-- /constants   // A collection of string and numbers that are constant
    |-- /io          // Concerned with reading and writing files
    |-- /parsers     // Parsers for complex fields such as intervalDate and intervalLength
    |-- /processors  // Concerned with various mapping and logic needed in the transformation
    |-- /types       // Typescript types and interfaces
    App.ts           // Main entrypoint to the app
```

### How does the design help to make the codebase readable and maintainable for other engineers?

So far the codebase is relatively flat and loosely organised. There are not that many concerns or features to warrant an
overly structured design. I think that it is readable and maintainable because of its simplicity and naming conventions.
As the codebase grows with more features I would look to refactor it to better house them

### Discuss any design patterns, coding conventions, or documentation practices you implemented to enhance readability and maintainability.

I have put a lot of things in place to make this codebase nice to work with. There are many tools, guardrails, and
conventions added such as

- Heavy use of async await for managing asynchronous calls in javascript
- Convention of having the test files next to their corresponding source file
- Tests are formally structured with setup, execution of system under test, and verification each segmented and commented
- Code linting and styling ensure readability
- Pull requests are required on main branch, with full branch protections configured
- Code can only be merged from a pull request using the squash strategy, this keeps the commit tree very easy to follow
- Typescript types _everywhere_
- Automated CI checks run on each pull request to ensure that linting, tests, and compilation pass
- End-to-end tests added to make sure that the system works as expected

### What would you do better next time?

I think that this tool is shiny enough for now 😉. There is `linting`, `type-safety`, `unit tests`,
`end-to-end tests`, `code styling`, `.env configuration`, `CI automation`, `Github repo setup and configuration`,
`project initialisation tooling`, `documentation` and more. I would seek feedback on the approach before embarking on
further improvements. Maybe a UI would be nice though

### Reflect on areas where you see room for improvement and describe how you would approach them differently in future projects.

I like to have access to the Product Owner, user, or domain expert when writing such tools. As I was writing this app, I
kept thinking that I was not sure if this approach would be what the users need. Before starting, I would have asked
questions such as

- Does it really just need to generate the insert statements?
- How often does this need to get run?
- Who or what, will be running the transform?
- How large can a NEM12 file be?
- What other systems are using the meter_readings table (in the hypothetical database)?
- How does this fit into the wider set of systems and processes in the org

All of these things would go to inform the choices made, and amount of effort taken, the interface, etc.

### What other ways could you have done this project?

I did consider creating a Kotlin or Java codebase for this tool. Both these JVM frameworks can be used together with
powerful ORMs such as Hibernate. I think I would have gone the same way of creating essentially a CLI for this task, but
in Java/Kotlin.

I didn't really consider other approaches, but I guess it could be done on a webpage via client side
javascript also, with the advantage being that no user installation/setup is required for that.

It could also be done as a deployable service, but that would need an API and a client UI to call that API, seems a bit
heavyweight given the requirement given

### Explore alternative approaches or technologies that you considered during the development of the project.

I did look at introducing a ORM that would be able to generate the SQL for me. In the end I decided against it, because
the sql that needed to be created was one line (repeated many times) and this could more effectively be done in code.
Actually, the choice not to use an ORM or other database tooling was a big part in choosing not to use Kotlin, but go
with Typescript instead

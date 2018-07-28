# nvmx

## Usage

```sh
nvmx add 10.7.0   # exact version
nvmx add 10.7     # latest 10.7.x
nvmx add 10       # latest 10.x.x
nvmx add 3.3.1    # io.js 3.1.1

nvmx add node     # latest Node.js
nvmx add iojs     # latest io.js
nvmx add lts      # latest LTS
nvmx add rc       # latest RC
nvmx add nightly  # latest nightly

nvmx add chakracore-10.6.0   # Node.js on ChakraCore
nvmx add cc-10.6.0           # `chakracore-` is too verbose, `cc-` also works
nvmx add cc-nightly          # add latest nightly of Node.js ChakraCore

nvmx list
nvmx remote
```

## Usage

```sh
nvmx install 10.7.0   # exact version
nvmx install 10.7     # latest 10.7.x
nvmx install 10       # latest 10.x.x
nvmx install 3.3.1    # io.js 3.1.1

nvmx install latest   # latest
nvmx install nodejs   # latest Node.js
nvmx install iojs     # latest io.js
nvmx install lts      # latest LTS
nvmx install rc       # latest RC
nvmx install nightly  # latest nightly

nvmx install --chakracore 8.9.4   # Install Node.js ChakraCore
nvmx install --chakracore nightly # Install latest nightly of Node.js ChakraCore

nvmx ls # List installed
nvmx ls-remote
```

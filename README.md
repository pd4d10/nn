# nvmx

nvmx is a Node.js version manager

- **Full featured**: Support stable, rc, nightly and v8-canary versions, support node-chakracore
- **Cross platform**: Support Windows, macOS and Linux, support x86 and x64
- **Zero dependencies**: No need to have Node.js or anything else before installation

## Installation

### macOS and Linux users

```sh
curl
```

### Windows users

## Usage

### Add a version

```sh
nvmx add 10.7.0   # Add exact version
nvmx add 10.7     # Add latest 10.7.x
nvmx add 10       # Add latest 10.x.x
nvmx add 3.3.1    # Add io.js 3.1.1

nvmx add node     # Add latest Node.js
nvmx add iojs     # Add latest io.js
nvmx add lts      # Add latest LTS
nvmx add rc       # Add latest RC
nvmx add nightly  # Add latest nightly

nvmx add --chakracore 10.6.0 # Add Node.js ChakraCore
nvmx add -c 10.6.0           # `--chakracore` is too verbose, `-c` also works
nvmx add -c nightly          # Add latest nightly of Node.js ChakraCore

nvmx list   # List added versions

nvmx remote # List remove versions
```

### Remove a version

```sh
nvmx remove 10.7.0 # Remove
```

### Use (activate) a version

```sh
nvmx use 10.7.0 # Use exact version
nvmx use 10     # Use latest installed 10.x.x
```

### List added versions

```sh
nvmx list # List all versions, including node and node-chakracore
```

### List remote available versions

```sh
nvmx remote
nvmx remote --chakracore
nvmx remote -c
```

### Alias

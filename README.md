# nvmx [![build status](https://img.shields.io/travis/pd4d10/nvmx.svg)](https://travis-ci.org/pd4d10/nvmx)

nvmx is a Node.js version manager. It is

- **Full featured**: Support node's release, rc, nightly, v8-canary, and node-chakracore's release, rc, nightly
- **Cross platform**: Support Windows x64, windows x86, macOS and Linux
- **Zero dependencies**: One command to install, no dependencies

## Installation

### macOS and Linux users

Open your terminal and run following command:

```sh
curl -o- https://raw.githubusercontent.com/pd4d10/nvmx/master/install.sh | bash
```

Or use wget:

```sh
wget -qO- https://raw.githubusercontent.com/pd4d10/nvmx/master/install.sh | bash
```

### Windows users

Open PowerShell and run following command:

```powershell
Invoke-Expression (Invoke-WebRequest https://raw.githubusercontent.com/pd4d10/nvmx/master/install.ps1)
```

**Notice**: If you have Node.js installed previously, version switch may not work because of PATH priority. Try to uninstall it, or increase priority of path `C:\Users\Your-User-Name\.nvmx\current`

## Usage

Use `-h` or `--help` to get help messages

```sh
nvmx --help      # Show all commands
nvmx add --help  # Show help message for add command
```

### Add a version

```sh
nvmx add v10.7.0    # Add exact version
nvmx add 10.7.0     # No leading `v` is OK
nvmx add 10.7       # Add latest 10.7.x
nvmx add 10         # Add latest 10.x.x
nvmx add 3.3.1      # Add io.js 3.1.1

# Some alias
nvmx add node       # Add latest Node.js
nvmx add iojs       # Add latest io.js
nvmx add lts        # Add latest LTS
nvmx add rc         # Add latest RC
nvmx add nightly    # Add latest nightly
nvmx add v8-canary  # Add latest v8-canary

# Add -a or --arch to specify arch
nvmx add --arch=x86 10.7.0     # Add x86 version

# Add -c or --chakracore to specify node-chakracore
nvmx add --chakracore 10.6.0   # Add node-chakracore
nvmx add --chakracore rc       # Add latest rc of node-chakracore
nvmx add --chakracore nightly  # Add latest nightly of node-chakracore

# Add -f or --force to remove old added same version then add
nvmx add --force 10.7.0
```

### Remove a version

```sh
nvmx remove v10.7.0  # Remove exact version
nvmx remove 10.7.0   # No leading `v` is OK

# Add -a or --arch to specify arch
nvmx remove --arch=x86 10.7.0    # Remove added x86 version

# Add -c or --chakracore to specify node-chakracore
nvmx remove --chakracore 10.6.0  # Remove node-chakracore
```

### Use (activate) a version

```sh
nvmx use v10.7.0  # Use exact version
nvmx use 10.7.0   # No leading `v` is OK

# Add -a or --arch to specify arch
nvmx use --arch=x86 10.7.0    # Use x86 version

# Add -c or --chakracore to specify node-chakracore
nvmx use --chakracore 10.6.0  # Use node-chakracore
```

### List versions (local and remote)

```sh
nvmx list  # List local versions, including node and node-chakracore

# Add -r or --remote to list remote versions
nvmx list --remote
nvmx list --remote rc            # List remote rc versions
nvmx list --remote nightly       # List remote nightly versions
nvmx list --remote v8-canary     # List remote v8-canary version

# Add -c or --chakracore to specify node-chakracore
nvmx list --remote --chakracore          # List remote versions of node-chakracore
nvmx list --remote --chakracore rc       # List remote rc versions of node-chakracore
nvmx list --remote --chakracore nightly  # List remote nightly versions of node-chakracore
```

### Run script with specific version

```sh
nvmx run 10.7.0 app.js              # Run app.js with specified version
nvmx run --arch=x86 10.7.0 app.js   # Run app.js with specified version and arch
nvmx run --chakracore 10.6.0 app.js # Run app.js with node-chakracore
```

### Set mirrors

nvmx support nightly, rc, and even node-chakracore. They are hosted on different mirror, it could be quite verbose to set them seperately. We have several builtin presets so no need to set them seperately.

```sh
# We have 3 presets currently:
# default (official mirror), taobao, tsinghua

nvmx mirror taobao  # Set mirror to taobao
```

### Upgrade nvmx

```sh
nvmx upgrade  # Downloading latest version of nvmx from GitHub and replace the old version
```

**Notice**: Seems that program at Windows can't delete itself while running. So you may need to download binary from [release page](https://github.com/pd4d10/nvmx/releases), rename to `nvmx.exe` and replace `C:\Users\Your-User-Name\.nvmx\bin\nvmx.exe` with it

### Uninstall nvmx

Just remove `~/.nvmx`(macOS, Linux) or `C:\Users\Your-User-Name\.nvmx`(Windows)

## Technical details

nvmx is written in JavaScript. We use [pkg](https://github.com/zeit/pkg) to bundle all JS files to a binary, to make it zero dependencies.

The installation script just download the latest version from [release](https://github.com/pd4d10/nvmx/releases), place it to `~/.nvmx`(macOS, Linux) or `C:\Users\Your-User-Name\.nvmx`(Windows), then add it to PATH so users could access it in shell directly.

# License

MIT

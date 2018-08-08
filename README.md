# nn [![Build status](https://travis-ci.org/pd4d10/nn.svg)](https://travis-ci.org/pd4d10/nn) [![Build status](https://ci.appveyor.com/api/projects/status/l045d5ysqmt4xoke?svg=true)](https://ci.appveyor.com/project/pd4d10/nn)

nn is a Node.js version manager. It is

- **Full featured**: Support node's release, rc, nightly, v8-canary, and node-chakracore's release, rc, nightly
- **Cross platform**: Support Windows x64, windows x86, macOS and Linux
- **Zero dependencies**: One command to install, no dependencies

## Installation

### macOS and Linux users

Open your terminal and run following command:

```sh
curl -o- https://raw.githubusercontent.com/pd4d10/nn/master/install.sh | bash
```

Or use wget:

```sh
wget -qO- https://raw.githubusercontent.com/pd4d10/nn/master/install.sh | bash
```

### Windows users

Open PowerShell and run following command:

```powershell
Invoke-Expression (Invoke-WebRequest https://raw.githubusercontent.com/pd4d10/nn/master/install.ps1)
```

**Notice**: If you have Node.js installed previously, version switch may not work because of PATH priority. Try to uninstall previous version, or increase priority of path `C:\Users\Your-User-Name\.nn\current`

## Usage

Use `-h` or `--help` to get help messages

```sh
nn --help      # Show all commands
nn add --help  # Show help message for add command
```

### Add a version

```sh
nn add v10.7.0    # Add exact version
nn add 10.7.0     # No leading `v` is OK
nn add 10.7       # Add latest 10.7.x
nn add 10         # Add latest 10.x.x
nn add 3.3.1      # Add io.js 3.1.1

# Some alias
nn add node       # Add latest Node.js
nn add iojs       # Add latest io.js
nn add lts        # Add latest LTS
nn add rc         # Add latest RC
nn add nightly    # Add latest nightly
nn add v8-canary  # Add latest v8-canary

# Add -a or --arch to specify arch
nn add --arch=x86 10.7.0     # Add x86 version

# Add -c or --chakracore to specify node-chakracore
nn add --chakracore 10.6.0   # Add node-chakracore
nn add --chakracore rc       # Add latest rc of node-chakracore
nn add --chakracore nightly  # Add latest nightly of node-chakracore

# Add -f or --force to remove old added same version then add
nn add --force 10.7.0
```

### Remove a version

```sh
nn remove v10.7.0  # Remove exact version
nn remove 10.7.0   # No leading `v` is OK

# Add -a or --arch to specify arch
nn remove --arch=x86 10.7.0    # Remove added x86 version

# Add -c or --chakracore to specify node-chakracore
nn remove --chakracore 10.6.0  # Remove node-chakracore
```

### Use (activate) a version

```sh
nn use v10.7.0  # Use exact version
nn use 10.7.0   # No leading `v` is OK

# Add -a or --arch to specify arch
nn use --arch=x86 10.7.0    # Use x86 version

# Add -c or --chakracore to specify node-chakracore
nn use --chakracore 10.6.0  # Use node-chakracore
```

### List versions (local and remote)

```sh
nn list  # List local versions, including node and node-chakracore

# Add -r or --remote to list remote versions
nn list --remote
nn list --remote rc            # List remote rc versions
nn list --remote nightly       # List remote nightly versions
nn list --remote v8-canary     # List remote v8-canary version

# Add -c or --chakracore to specify node-chakracore
nn list --remote --chakracore          # List remote versions of node-chakracore
nn list --remote --chakracore rc       # List remote rc versions of node-chakracore
nn list --remote --chakracore nightly  # List remote nightly versions of node-chakracore
```

### Run script with specific version

```sh
nn run 10.7.0 app.js              # Run app.js with specified version
nn run --arch=x86 10.7.0 app.js   # Run app.js with specified version and arch
nn run --chakracore 10.6.0 app.js # Run app.js with node-chakracore
```

### Set mirrors

nn support nightly, rc, and even node-chakracore. They are hosted on different mirror, it could be quite verbose to set them seperately. We have several builtin presets so no need to set them seperately.

```sh
# We have 3 presets currently:
# default (official mirror), taobao, tsinghua

nn mirror taobao  # Set mirror to taobao
```

### Upgrade nn to latest

_Option 1_: run `nn upgrade`. Only for macOS and Linux because Windows program seems can't delete itself while running.

_Option 2_: Go to [Installation](#installation) and run it again.

### Uninstall nn

Just remove `~/.nn`(macOS, Linux) or `C:\Users\Your-User-Name\.nn`(Windows)

## Technical details

nn is written in JavaScript. We use [pkg](https://github.com/zeit/pkg) to bundle all JS files to a binary, to make it zero dependencies.

The installation script just download the latest version from [release](https://github.com/pd4d10/nn/releases), place it to `~/.nn`(macOS, Linux) or `C:\Users\Your-User-Name\.nn`(Windows), then add it to PATH so users could access it in shell directly.

## Alternatives

- [nvm](https://github.com/creationix/nvm)
- [n](https://github.com/tj/n)
- [nvs](https://github.com/jasongin/nvs)
- [nvm-windows](https://github.com/coreybutler/nvm-windows)

## License

MIT

#!/bin/bash

ROOT_DIR=$HOME/.nn
BIN_DIR=$ROOT_DIR/bin
NODE_DIR=$ROOT_DIR/current/bin
VERSION=v0.0.5
PATH_TO_ADD=$BIN_DIR:$NODE_DIR
LINE_TO_ADD="export PATH=$PATH_TO_ADD:\$PATH"

if [ ! -d $BIN_DIR ]; then
  echo "$BIN_DIR not exists, creating it..."
  mkdir -p $BIN_DIR
fi

# https://stackoverflow.com/a/3466183
case "$(uname -s)" in
  Linux*)     platform=linux;;
  Darwin*)    platform=macos;;
  *)          echo "unknown platform, exiting..."; exit 1;
esac

url="https://github.com/pd4d10/nn/releases/download/$VERSION/nn-$platform-x64"
echo "Downloading nn $VERSION..."
echo $url
curl -L -o $BIN_DIR/nn $url
echo "Download complete"

chmod a+x $BIN_DIR/nn

# https://stackoverflow.com/a/229606
if [[ $SHELL = *"zsh"* ]]; then
  default_shell="zsh"
else
  default_shell="bash"
fi

echo "Guess your default shell is $default_shell"

profile=$HOME/.${default_shell}rc

echo "Adding path to $profile ..."
echo $LINE_TO_ADD >> $profile
echo "Path added, please reopen shell to activate nn"
echo ""
echo "Notice: If you are using shell other than bash and zsh, please add following line to your profile:"
echo -e "\033[32m$LINE_TO_ADD\033[0m"
echo ""
echo "If something went wrong please submit an issue:"
echo "https://github.com/pd4d10/nn/issues/new"

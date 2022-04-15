# Initial Flash of CM4 via usbboot

follow [https://www.raspberrypi.com/documentation/computers/compute-module.html#setting-up-the-cmio-board](Setting up the CMIO board)

The image can be copied via:
```
sudo bmaptool copy ./build/tmp/deploy/images/io-board/goldi-dev-image-io-board.wic.bz2 /dev/sdX
```

# VS Code SSH Remote Development

if you want to connect to the board via VS Code Remote-SSH follow these steps:

first expand the /data drive:
```

```

then you will need to link /home/root/.vscode-server to the data drive
```
ssh root@io-board.local -T "ln -s /data/.vscode-server /home/root/.vscode-server"
```

copy your project to the target (inside the projectdirectory )
```
rsync -rlptzv --progress --delete --exclude=.git --exclude=node_modules . "root@io-board.local:/data/workspace/"
```

now you are able to connect via the vscode Remote-SSH extension. Develop application in /data/workspace directory

copy your project back to your pc (inside the project directory)
```
rsync -rlptzv --progress --delete --exclude=.git --exclude=node_modules "root@io-board.local:/data/workspace/" .
```
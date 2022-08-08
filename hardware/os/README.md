# Initial Flash of CM4 via usbboot

follow [https://www.raspberrypi.com/documentation/computers/compute-module.html#setting-up-the-cmio-board](Setting up the CMIO board)

The image can be copied via:
```
sudo bmaptool copy ./build/tmp/deploy/images/io-board/goldi-dev-image-io-board.wic.bz2 /dev/sdX
```

# VS Code SSH Remote Development

copy your project to the target (inside the projectdirectory )
```
rsync -rlptzv --progress --delete --exclude=.git --exclude=node_modules . "root@io-board.local:/data/workspace/"
```

now you are able to connect via the vscode Remote-SSH extension. Develop application in /data/workspace directory

copy your project back to your pc (inside the project directory)
```
rsync -rlptzv --progress --delete --exclude=.git --exclude=node_modules "root@io-board.local:/data/workspace/" .
```

# PKI

To generate a signing key follow these steps:

1. install easy-rsa

    ```sh
    wget https://github.com/OpenVPN/easy-rsa/releases/download/v3.0.8/EasyRSA-3.0.8.tgz -O - | tar -xz
    ```

2. init easy-rsa

    ```sh
    ./EasyRSA-3.0.8/easyrsa init-pki
    ```

3. generate certificate request

    ```sh
    ./EasyRSA-3.0.8/easyrsa gen-req dev-signing nopass
    ```

4. let the certificate request be signed

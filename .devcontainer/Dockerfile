FROM crosslab/devcontainer:latest

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y \
        alien \
        rpm \
        fakeroot

# install Lattice Diamond
COPY ./diamond/diamond-3-12-base_3.12-241_amd64.deb /tmp/diamond-3-12-base_3.12-241_amd64.deb
#COPY ./diamond/diamond-3-12-sp1_3.12-455_amd64.deb /tmp/diamond-3-12-sp1_3.12-455_amd64.deb
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y \
        csh \
        libusb-0.1-4 \
    && dpkg -i /tmp/diamond-3-12-base_3.12-241_amd64.deb \
    #&& dpkg -i /tmp/diamond-3-12-sp1_3.12-455_amd64.deb \
    && rm /tmp/diamond-3-12-base_3.12-241_amd64.deb
    #&& rm /tmp/diamond-3-12-sp1_3.12-455_amd64.deb

ENV DIAMOND_DIR="/usr/local/diamond/3.12" \
    bindir="/usr/local/diamond/3.12/bin/lin64"

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y \
        sshpass pv

# install ghdl
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y gnat \
    && git clone https://github.com/ghdl/ghdl.git /tmp/ghdl \
    && cd /tmp/ghdl \
    && ./configure --prefix=/usr/local \
    && make \
    && make install \
    && rm -rf /tmp/ghdl

# licence update (change build hash)
COPY diamond/lattice.dat /usr/local/diamond/3.12/license/license.dat

RUN echo "sudo ip link add bond0 type dummy && sudo ifconfig bond0 hw ether 08:00:27:3a:52:9f || true" >> $DIAMOND_DIR/bin/lin64/diamond_env

# YOCTO
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y \
        gawk \
        wget \
        git-core \
        subversion \
        diffstat \
        unzip \
        sysstat \
        texinfo \
        build-essential \
        chrpath \
        socat \
        python3 \
        python3-pip \
        python3-pexpect \
        xz-utils  \
        locales \
        cpio \
        screen \
        tmux \
        sudo \
        iputils-ping \
        python3-git \
        python3-jinja2 \
        libegl1-mesa \
        libsdl1.2-dev \
        pylint \
        xterm \
        iproute2 \
        fluxbox \
        tightvncserver \
        lz4 \
        zstd \
        file

RUN pip3 install kas

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y wireguard pwgen rpiboot bmap-tools

USER vscode
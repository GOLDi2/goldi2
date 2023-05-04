FROM crosslab-devcontainer:build

ARG USERNAME=dev
ARG USER_UID=1000
ARG USER_GID=$USER_UID

USER root

# Yocto Dependencies
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

# install rpiboot
RUN cd /opt/ \
    && DEBIAN_FRONTEND=noninteractive apt-get -y install git libusb-1.0-0-dev pkg-config bmap-tools \
    && git clone --depth=1 https://github.com/raspberrypi/usbboot \
    && cd usbboot \
    && make \
    && chmod +s rpiboot
ENV PATH="$PATH:/opt/usbboot"

# install alien for building this image
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y \
        alien \
        rpm

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

RUN mv /entrypoint.sh /crosslab-entrypoint.sh
COPY container-scripts/entrypoint.sh /

COPY licenses/lattice.dat /usr/local/diamond/3.12/license/license.dat

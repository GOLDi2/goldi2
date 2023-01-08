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

USER $USERNAME

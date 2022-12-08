#!/bin/bash

#kas build kas.yml
kas shell kas.yml -c "bitbake -c build goldi-dev-image goldi-dev-update-bundle goldi-image goldi-update-bundle"
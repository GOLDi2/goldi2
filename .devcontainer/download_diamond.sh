mkdir -p diamond
if [ ! -f diamond/diamond_3_12-base-240-2-x86_64-linux.rpm ]; then
  wget https://files.latticesemi.com/Diamond/3.12/diamond_3_12-base-240-2-x86_64-linux.rpm -O diamond/diamond_3_12-base-240-2-x86_64-linux.rpm
fi
if [ ! -f diamond/diamond_3_12-sp1-454-2-x86_64-linux.rpm ]; then
  wget https://files.latticesemi.com/Diamond/3.12.1/diamond_3_12-sp1-454-2-x86_64-linux.rpm -O diamond/diamond_3_12-sp1-454-2-x86_64-linux.rpm
fi
if [ ! -f diamond/diamond-3-12-base_3.12-241_amd64.deb ]; then
  (cd diamond && fakeroot alien --scripts diamond_3_12-base-240-2-x86_64-linux.rpm)
fi
if [ ! -f diamond/diamond-3-12-sp1_3.12-455_amd64.deb ]; then
  (cd diamond && fakeroot alien --scripts diamond_3_12-sp1-454-2-x86_64-linux.rpm)
fi

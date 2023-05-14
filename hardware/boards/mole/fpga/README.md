```
sshpass -p $PASSWORD scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null dist/bitstream.svf root@169.254.79.79:/lib/firmware/lattice/firmware.svf
sshpass -p $PASSWORD ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@169.254.79.79 "systemctl start load-fpga-firmware"
```

```
./scripts/build.sh && sshpass -p $PASSWORD scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null dist/bitstream.svf root@169.254.79.79:/lib/firmware/lattice/firmware.svf && sshpass -p $PASSWORD ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@169.254.79.79 "systemctl start load-fpga-firmware"
```

```
import spidev
spi = spidev.SpiDev()
spi.open(0, 0)
spi.max_speed_hz = 5000000
spi.mode=3
```

```
'{0:b}'.format(spi.xfer2([3,0])[1])
```
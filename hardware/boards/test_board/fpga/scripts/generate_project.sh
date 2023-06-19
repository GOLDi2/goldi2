#!/bin/bash

cat <<EOF > project.ldf
<?xml version="1.0" encoding="UTF-8"?>
<BaliProject version="3.2" title="Project" device="LCMXO2-7000HC-4TG144C" default_implementation="impl1">
    <Options>
        <Option name="HDL type" value="VHDL"/>
    </Options>
    <Implementation title="impl1" dir="build" description="impl1" synthesis="lse" default_strategy="Strategy1">
        <Options top="top_level"/>
        <Source name="constraints.lpf" type="Logic Preference" type_short="LPF">
            <Options/>
        </Source>
EOF

for f in $(find -L src -name "*.vhd"); do
    cat <<EOF >> project.ldf
        <Source name="$f" type="VHDL" type_short="VHDL">
            <Options/>
        </Source>
EOF
done

cat <<EOF >> project.ldf
    </Implementation>
    <Strategy name="Strategy1" file="strategy.sty"/>
</BaliProject>
EOF
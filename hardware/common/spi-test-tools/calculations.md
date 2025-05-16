Assuming we start with a zero velocity and a constant acceleration, the velocity can be calculated using the formula:

$$v(c)=\left\lfloor \frac{c}{a}\right\rfloor$$

where $c$ is the clock cycles and $a$ is the acceleration from the (register + 1)*acceleration_scaling.

The distance (steps) can be calculated using the formula:
$$d=\left\lfloor \frac{\sum_{i=1..c}{v(i)}}{\text{velocity\_scaling}}\right\rfloor$$


If we accelerate to a certain velocity $v_\text{max}$ we therefore need 
$$c_\text{max} = v_\text{max} \cdot a$$
clock cycles to reach that velocity.

In that time we will have moved a distance of:
$$d_\text{max}=
\left\lfloor \frac{\sum_{i=1..v_\text{max} \cdot a}{v(i)}}{\text{velocity\_scaling}}\right\rfloor
=\left\lfloor \frac{\sum_{i=1..v_\text{max} \cdot a}{\left\lfloor \frac{i}{a}\right\rfloor}}{\text{velocity\_scaling}}\right\rfloor
=\left\lfloor \frac{\sum_{i=1..v_\text{max} \cdot a}{\left\lfloor \frac{i}{a}\right\rfloor}}{\text{velocity\_scaling}}\right\rfloor$$

We take a closer look to the series sum:
Let $q=\left\lfloor \frac{v_\text{max} \cdot a}{a}\right\rfloor$ and $r=v_\text{max} \cdot a \mod a$.
Then we can rewrite the sum as:
$$\sum_{i=1..v_\text{max} \cdot a}{\left\lfloor \frac{i}{a}\right\rfloor}
=\sum_{i=0..q-1}{i\cdot a} + q\cdot (r+1)
=\frac{(q-1)\cdot q}{2}\cdot a + q\cdot (r+1)
$$

Because $r=v_\text{max} \cdot a \mod a \equiv 0$ and by replacing  $q=\left\lfloor \frac{v_\text{max} \cdot a}{a}\right\rfloor = v_\text{max}$ we get:
$$\sum_{i=1..v_\text{max} \cdot a}{\left\lfloor \frac{i}{a}\right\rfloor}
=\frac{(v_\text{max}-1)\cdot v_\text{max}}{2}\cdot a + v_\text{max}
$$

Substituting this into the distance formula we get:
$$d_\text{max}=
\left\lfloor \frac{\sum_{i=1..v_\text{max} \cdot a}{\left\lfloor \frac{i}{a}\right\rfloor}}{\text{velocity\_scaling}}\right\rfloor
=\left\lfloor \frac{\frac{(v_\text{max}-1)\cdot v_\text{max}}{2}\cdot a + v_\text{max}}{\text{velocity\_scaling}}\right\rfloor
$$

$v_\text{max}$ is either the target velocity or the maximum velocity we can reach by half the distance available distance $\frac{d}{2}$, so that we can accelerate and descelerate.
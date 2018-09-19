# Amorphous Computing Simulation

Amorphous computing leverages the collective behavior of locally interacting
processing units to produce complex computation and behavior. Each cell
interacts only with its immediate neighbors by passing small messages called
**pings**. Cell behavior is programmed by defining how to respond to pings of
different types. The cells are programmed identically, but can store local state
information to differentiate behavior. Pings originate from cell neighbors or
from the user's mouse events.

Click or drag to interact with the simulation. Use the drop-down menu to change
the trigger mode.


### Example 0

The simplest program prints `hello world` to the browser console when a cell is
clicked.

```
@hello_world()
    PUTS 'hello world'
```


### Example 1

Here is a simple ping definition that turns a cell green when clicked:

```
@turn_green()
  !'color' -> (0, 1, 0)
```

Ping definitions are marked with the `@` symbol. In this example, we define a
new ping called `turn_green` with no arguments. Upon recieving this ping, a cell
will set its `color` attribute to the RGB tuple `(0, 1, 0)`. The amorphous
simulator automatically renders this as the color green. In the simulator, you
can use this ping to change the color of a single cell by clicking on it. If
instead you wish for all cells to automatically turn green on reset, you can use
the special `_init` ping.

```
@_init()
  !'color' -> (0, 1, 0)
```


### Example 2

Data can be associated with a cell or with an individual ping with a
dictionary-like interface. Cell data is referenced with the `!` operator; for
example, `!'color'` returns the cell's color. Ping data is referenced with the
`?` operator; for example `?'delay'` could be the number of cycles to delay
before resending this ping. Here is an example of setting and accessing cell and
ping data:

```
@propogate_red()
  NQUE ._propogate_color((1, 0, 0))

@propogate_green()
  NQUE ._propogate_color((0, 1, 0))

@propogate_blue()
  NQUE ._propogate_color((0, 0, 1))

@_propogate_color(color)
  IF !'color' <> ?'color' \ if not already the color
    !'color' -> ?'color'  \ change the color
    PING .?               \ broadcast the same ping to neighbors
```

The `NQUE` command adds (enqueues) a new ping to the current cell's own queue.
The `PING` command adds the specified ping to all of the cell's neighbors'
queues. The first three methods can be triggered by the user, but the fourth
method is hidden from the user because it begins with an underscore. It is
advisable to make any methods with arguments hidden, since the behavior is
undefined when no argument is provided. Here, the `propogate_red`,
`propogate_green`, and `propogate_blue` methods all simply enqueue a new ping of
type `_propogate_color` with different arguments. The hidden method checks if
the cell's color has already been changed (`<>` is the "not equals" operator);
if not, it modifies its color to that specified by the ping (`->` is the
assignment operator) and sends copies of the same message to its neighbors. Note
that the last line is a shorthand equivalent to
`PING ._propogate_color(?'color')`. Inline comments begin with a backlash.


### Preventing Explosions

In Example 2, we checked if the color had already been changed before
    propogating the message further. Consider what would have happened if we
    excluded this check; since every step would multiply the number of pings in
    circulation, the total number of pings would grow exponentially. Even after
    all the cells had changed colors, extraneous pings would continue flying
    about left and right. Such &quot;ping explosions&quot; are the amorphous
    computing equivalent of infinite loops. Builtin language support to
    automatically suppress explosions has not yet been implemented.


### Example 3

Ping can loop over iterables with a supplied temporary variable. The syntax
`LOOP <i>iterable</i> WITH <i>variable</i>` is equivalent to Python's
`for <i>variable</i> in <i>iterable</i>`. Iterables objects include
tuples like `(1, 2, 3)` and the builtins `KEYS` and
`VALS` which iterate over the cell data keys and values respectively.

```
@layer_one()
  NQUE ._layer((0.154, 0.583, 1.0), 'layer_one', 3)

@layer_two()
  NQUE ._layer((1, 0.64, 0.04), 'layer_two', 3)

@_layer(color, layer, radius)
  IF ?'radius' >> 0
    !'color' -> ?'color'
    !'resetcolor' -> ?'color'
    !?'layer' -> 'standby'
    ?'radius' -= 1
    PING .?

@pulse()
  color -> (RAND, RAND, RAND)
  LOOP KEYS WITH key
    IF key <= 'layer_'
      NQUE ._pulse_color(color, key)

@_pulse_color(color, layer)
  IF !?'layer' == 'standby'
    !?'layer' -> 'pulsing'
    NQUE ._resetcolor(?'layer', 1)
    !'color' -> ?'color'
    PING .?

@_resetcolor(layer, delay)
  IF !?'layer' == 'pulsing'
    IF ?'delay' >> 0
      ?'delay' -= 1
      NQUE .?
    ELSE
      !'color' -> !'resetcolor'
      !?'layer' -> 'standby'
```

Here `RAND` returns a random number between 0 and 1.

#### Handling Collisions

In addition to explosions, collisions between multiple propogating pings are a
common cause of unsuspected behavior. In Example 3, we use the `!'resetcolor'`
attribute to ensure the proper color is obtained.


## Language Reference


###  Keywords

```
PUTS     \ prints to the browser console log
PING     \ send copies of ping to all neighboring cells
NQUE     \ enqueues ping to current cell's queue
IF       \ starts an if conditional
ELIF     \ starts an else-if conditional
ELSE     \ starts an else conditional
LOOP     \ used with the WITH keyword for loops
WITH     \ used with the LOOP keyword for loops
```


###  Constants

```
RAND     \ random number between 0 and 1
NULL     \ default value associated with all unassigned keys
KEYS     \ list of keys in local cell data
VALS     \ list of values in local cell data
```


###  Symbols and Operators

```
&&    \ logical and
||    \ logical or
==    \ equal (data, not reference)
<>    \ not equal
>>    \ greater than
<<    \ less than
>=    \ ints: less than or equal to, strings: ends with
<=    \ ints: greater than or equal to, strings: starts with
+     \ ints: addition, strings: concatenation
-     \ ints: subtraction, strings: undefined
*     \ multiplication
/     \ division
+=    \ increase by
-=    \ decrease by
*=    \ muiltiply by
/=    \ divide by
->    \ assignment (a -> assigns a the value of b)
!     \ cell data accessor
?     \ ping data accessor
@     \ new ping definition
.     \ new ping instantiation
(     \ tuple or arg list open
)     \ tuple or arg list close
[     \ conditional expression open
]     \ conditional expression close
\     \ start of inline comment
```

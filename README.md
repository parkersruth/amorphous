
See the full site at [parkersruth.github.io/amorphous/](https://parkersruth.github.io/amorphous/).

## Getting Started

### Amorphous Computing

Amorphous computing leverages the collective behavior of locally interacting
processing units to produce complex computation and behavior. Each cell
interacts only with its immediate neighbors by passing small messages called
**pings**. Cell behavior is programmed by defining how to respond to pings of
different types. The cells are programmed identically, but can store local state
information to differentiate behavior. Pings originate from cell neighbors or
from the user's mouse events.


### The Ping Programming language

The simulation is programmed in Ping, a language designed for specifically
for amorphous computing. Ping uses semantic whitespace, dynamic typing, and
deliberately peculiar syntax.


### Basics

This simple Ping program prints `hello world` to the browser's debug console
when a cell is clicked.

```ping
@hello_world()
    PUTS 'hello world'
```

A more visual example is this Ping program that turns a cell green when clicked:

```ping
@turn_green()
  !'color' -> (0, 1, 0)
```

Ping definitions are marked with the `@` symbol. In this example, we define a
new ping called `turn_green` with no arguments. Upon receiving this ping, a cell
will set its `color` attribute to the RGB tuple `(0, 1, 0)`. The amorphous
simulator automatically renders this as the color green. In the simulator, you
can use this ping to change the color of a single cell by clicking on it. If
instead you wish for all cells to automatically turn green on reset, you can use
the special `_init` ping.

```ping
@_init()
  !'color' -> (0, 1, 0)
```

Data can be associated with a cell or with an individual ping with a
dictionary-like interface. Cell data is referenced with the `!` operator; for
example, `!'color'` returns the cell's current color. Ping data is referenced
with the `?` operator; for example `?'color'` could be the color a cell is
instructed to change to. Here is an example of setting and accessing cell and
ping data:

```ping
@propagate_red()
  NQUE ._propagate_color((1, 0, 0))

@propagate_green()
  NQUE ._propagate_color((0, 1, 0))

@propagate_blue()
  NQUE ._propagate_color((0, 0, 1))

@_propagate_color(color)
  IF !'color' <> ?'color' \ if not already the color
    !'color' -> ?'color'  \ change the color
    PING .?               \ re-broadcast the same ping to neighbors
```

The `NQUE` command pushes (enqueues) a new ping to the current cell's own queue.
The `PING` command pushes the specified ping to all of the cell's neighbors'
queues. The first three methods can be triggered by the user, but the fourth
method is hidden from the user because it begins with an underscore. It is
advisable to make any methods with arguments hidden. (An unspecified ping
arguments will default to `NULL`). Here, the `propagate_red`, `propagate_green`,
and `propagate_blue` methods all simply enqueue a new ping of type
`_propagate_color` with different arguments. The hidden method checks if the
cell's color has already been changed (`<>` is the "not equals" operator); if
not, it modifies its color to that specified by the ping (`->` is the assignment
operator) and sends copies of the same message to its neighbors. Note that the
last line is a shorthand equivalent to `PING ._propagate_color(?'color')`.
Inline comments begin with a backlash.

In the program above, we checked if the color had already been changed before
propagating the message further. Consider what would have happened if we
excluded this check; since every step would multiply the number of pings in
circulation, the total number of pings would grow exponentially. Even after all
the cells had changed colors, extraneous pings would continue flying about left
and right. Such "ping explosions" are the amorphous computing equivalent of
infinite loops.


### Example 1 - Global Geometry

Example 1 demonstrates the ability to measure long-range distances by drawing
a Vornoi pattern from cells.

```ping
@_init()
  !'id' -> RAND

\\ place a Vornoi cell vertex
@vertex()
  NQUE ._vertex('dist_' + !'id', 0, (RAND, RAND, RAND))

@_vertex(id, dist, color)
  IF !?'id' == NULL || !?'id' >= ?'dist'
    !?'id' -> ?'dist'
    ?'dist' += 1
    NQUE ._color_if_closest(?'id', ?'color')
    PING .?

\\ match the color of the closest vertex
@_color_if_closest(id, color)
  dist -> !?'id'
  is_closest -> 1
  LOOP KEYS WITH key IF [key <= 'dist' && key <> ?'id']
    IF !key <= dist
      is_closest -> 0
  IF is_closest == 1
    !'color' -> ?'color'
```

Ping can loop over iterables with a supplied temporary variable. The syntax
`LOOP <iterable> WITH <variable>` is equivalent to Python's
`for <variable> in <iterable>`. To compactly iterate over a subset of
the iterable, use the syntax `LOOP <iterable> WITH <variable> IF <conditional>`
(this is similar to Python's list comprehension).
Iterables objects include tuples like `(1, 2, 3)` and the builtins `KEYS` and
`VALS` which iterate over the cell data keys and values respectively. `RAND`
returns a random number between 0 and 1.

When a cell modifies the data associated with a ping (e.g. `?'radius' -= 1`),
it does not affect any similar pings in the queues of neighboring cells. In
other words, the `PING` command creates copies of the local ping object to put
in the queues of neighboring cells.


### Example 2 - Differentiated Behavior

Example 1 demonstrates the use of local state to support cell differentiation.

```ping
@_init()
  start_color -> (0.516, 0.902, 0.106)
  !'color' -> start_color
  !'reset_color' -> start_color
  !'layer_zero' -> 'standby'

\\ paint a region of layer one
@layer_one()
  NQUE ._layer((0.154, 0.583, 1.0), 'layer_one', 3)

\\ paint a region of layer two
@layer_two()
  NQUE ._layer((1, 0.64, 0.04), 'layer_two', 3)

@_layer(color, layer, radius)
  IF ?'radius' >> 0
    !'color' -> ?'color'
    !'reset_color' -> ?'color'
    !?'layer' -> 'standby'
    !'layer_zero' -> NULL
    ?'radius' -= 1
    PING .?

\\ create a single propagating pulse
@pulse()
  color -> (RAND, RAND, RAND)
  LOOP KEYS WITH key IF key <= 'layer_'
    NQUE ._pulse_color(color, key)

@_pulse_color(color, layer)
  IF !?'layer' == 'standby'
    !?'layer' -> 'pulsing'
    NQUE ._reset_color(?'layer', 1)
    !'color' -> ?'color'
    PING .?

@_reset_color(layer, delay)
  IF !?'layer' == 'pulsing'
    IF ?'delay' >> 0
      ?'delay' -= 1
      NQUE .?
    ELSE
      !'color' -> !'reset_color'
      !?'layer' -> 'standby'

\\ create node emanating repeated pulses
@blinker()
  NQUE .pulse()
  NQUE ._blink_delay(5)

@_blink_delay(delay)
  IF ?'delay' <= 0
    NQUE .blinker()
  ELSE
    ?'delay' -= 1
    NQUE .?
```

In addition to explosions, collisions between multiple propagating pings are a
common cause of unexpected behavior. In Example 3, we use the `!'reset_color'`
attribute to ensure the proper color is obtained.

In Ping, booleans only exist implicitly inside of conditionals. This means that
variables cannot be assigned boolean values and there are no boolean primitives;
instead, you should use descriptive strings to store binary states.


### Example 3 - Gradient Descent

Example 3 demonstrates an optimization problem using gradient descent where
multiple particles can parallelize the traversal of a global loss function.
It is also reminiscent of biological cells navigating a chemical gradient.

```ping
@_init()
  !'id' -> RAND
  !'reset_delay' -> 0
  NQUE .__reset_color()

\\ this looping ping should only be called in init
@__reset_color()
  IF !'reset_delay' >> 0
    !'reset_delay' -= 1
  ELIF !'grad' <> NULL
    r -> 0.5 + [0.4 / !'grad']
    g -> 0.9
    b -> 0.1 + [0.8 * [1 - 1 / !'grad']]
    !'color' -> (r, g, b)
  NQUE .__reset_color()

@gradient()
  NQUE ._gradient(1)

@_gradient(grad)
  IF !'grad' == NULL || !'grad' >= ?'grad'
    !'grad' -> ?'grad'
    ?'grad' += 1
    \\ NQUE ._reset_color(3)
    PING .?

\\ spawn a new searching particle
@spawn()
  NQUE ._spawn(!'id', (RAND, RAND, RAND), 0)

@_spawn(id, color)
  IF !'grad' <> 1
    IF !'state' == NULL && ?'id' == !'id'
      PUTS !'id' + ' is active'
      !'state' -> 'alive'
      !'color' -> ?'color'
      !'reset_delay' -> 3
      PING ._poll_grad(!'color')

\\ poll neighboring cells to estimate local gradient
@_poll_grad(color)
  IF !'state' == NULL
    !'color' -> ?'color'
    !'reset_delay' -> 3
    PING ._reply_grad(!'id', !'grad')

\\ step in a direction of non-increasing gradient
@_reply_grad(id, grad)
  IF !'state' == 'alive'
    IF ?'grad' << !'grad'
      !'state' -> NULL
      PING ._spawn(?'id', !'color')
```

Ping uses square brackets `[` and `]` to disambiguate order of operations. When
ambiguity arises, Ping always executes operations right to left; there are no
operation priorities. For example `1 + 2 * 3` is equivalent to `1 + [2 * 3]`,
which evaluates to `7`, while `[1 + 2] * 3` evaluates to `9`.


## Language Reference

###  Keywords

```ping
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

```ping
RAND     \ random number between 0 and 1
NULL     \ default value associated with all unassigned keys
INFT     \ infinity evaluates larger than any other number
KEYS     \ list of keys in local cell data
VALS     \ list of values in local cell data
```


###  Symbols and Operators

```ping
&&       \ logical and
||       \ logical or
==       \ equal (data, not reference)
<>       \ not equal
>>       \ greater than
<<       \ less than
>=       \ ints: less than or equal to, strings: ends with
<=       \ ints: greater than or equal to, strings: starts with
+        \ ints: addition, strings: concatenation
-        \ ints: subtraction, strings: undefined
*        \ multiplication
/        \ division
+=       \ increase by
-=       \ decrease by
*=       \ multiply by
/=       \ divide by
->       \ assignment (a -> assigns a the value of b)
!        \ cell data accessor
?        \ ping data accessor
@        \ new ping definition
.        \ new ping instantiation
(        \ tuple or arg list open
)        \ tuple or arg list close
[        \ operation grouping open
]        \ operation grouping close
\        \ start of inline comment
```

### GRAMMAR

Following is a context-free grammar for the Ping programming language in
Backus-Naur form.

- `<identifier>` is a variable name (a letter or underscore followed by letters
	underscores and numbers).
- `<number>` is an integer or floating point decimal value.
- `<string>` is a string literal enclosed in single or double quotes.
- The pre-compiler tokenizes the input and converts indentation changes
into `"{"` and `"}"`braces. The grammar below contains brace symbols from the
tokenized pre-compiler output.

```code
<ping-defs>   ::= "" | <ping-defs> <ping-defs>
		            | "@" <identifier> "(" <arg-list> ")" <block>

<arg-list>    ::= "" | <identifier> | <identifier> "," <arg-list>

<block>       ::= "{" <statements> "}"

<statements>  ::= <statements> <statements>
                | "NQUE" <ping> | "PING" <ping>
                | <if> | <loop>
                | <value> <assignment> <expression>
                | "PUTS" <expression>

<ping>        ::= "." <identifier> <tuple>
		            | "." "?"

<if>          ::= "IF" <boolean> <block> <elifs> <else>

<elifs>       ::= "" | "ELIF" <boolean> <block> <elifs>

<else>        ::= "" | "ELSE" <boolean> <block>

<loop>        ::= "LOOP" <data> "WITH" <variable> <block>
                | "LOOP" <data> "WITH" <variable> "IF" <boolean> <block>

<boolean>     ::= <data> <comparator> <data>
                | <boolean> "&&" <boolean>
                | <boolean> "||" <boolean>
                | "[" <boolean> "]"

<comparator>  ::= "==" | "<<" | ">>" | "<=" | ">="

<value>       ::= <identifier>
		            | "!" + <data>
		            | "?" + <string>

<assignment>  ::= "->" | "+=" | "-="

<expression>  ::= <data>
		            | <expression> <bin-op> <expression>
                | "[" <expression> "]"

<bin-op>      ::= "+" | "-" | "*" | "/"

<data>        ::= "RAND" | "NULL" | "IMFT" | "KEYS" | "VALS"
            		| <number> | <string>
            		| "(" <data-list> ")"
            		| <value>

<data-list>   ::= "" | <data> | <data> "," <data-list>
```

### Additional Notes

Pinguin was inspired by the work of Hal Abelson, Daniel Coore, Radhika Nagpal,
Erik Rauch, Ron Weiss, and other amorphous computing researchers.

Cells are distributed using an implementation of Mitchell's Best Candidate
algorithm for Poisson-disc sampling (based on  Mike Bostock's [d3.js implementation](https://bl.ocks.org/mbostock/d7bf3bd67d00ed79695b)).

This project is in beta; please report issues [here](https://github.com/parkersruth/amorphous/issues).

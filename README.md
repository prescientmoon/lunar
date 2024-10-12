# Lunarlang

Small programming language made for the code community code jam.

## Installation

Everything is available via a nix flake.

## Usage

Playground:

```sh
lunar playgruond
```

Run the examples:

```sh
lunar exec examples/hello.lun
lunar exec examples/functions.lun
```

## Help

```sh
lunar --help
```

## Docs

### Comments:

-   Any line which stats with `#` will be ignored

### Expressions:

-   In lunar lang most things are considered expression. An expression has one, and only one return value.
-   A expression can be single line:

```
1 + 1
# returns 2
```

-   Or multi line:

```
{
    1 + 1
    2 + 2
} # returns 4
```

### Declaring variables:

-   To declare variables use the `declare` keyword followed by a list of name value pairs:

```

declare a = 1, b = 2, c = 3

```

-   You can replace declare with const to make all of them immutable:

```

const a = 1, b = 2, c = 3

```

-   For non constant values the initial value is optional:

```

declare a, b = 7, c

```

### Asigning to variables:

-   Use the `=` operator:

```

declare a = 3

a = 4

```

-   Note: you cannot assign to constant variables

### Calling functions:

-   To call a function write the name of the function followed by a list of arguments delimited by paranthesis:

```

println('1' 2 1 + 1)

```

-   For readability you can also add commas:

```

println('1', 2, 1 + 1)

```

-   You can also use the pipe operator:

```

1 + 1 |> println

# Same as println(1 + 1)
```

### Declaring functions:

-   To declare a function, use the `fn` keyword followed by the list of arguments and a expression

```
const a = fn (a b c) a + b + c

a(1 2 3) # 6
```

-   The return is an expression so you can add brackets:

```
const a = fn (a b c) {
    const sum = a + b + c
    sum
}

a (1 2 3) # 6
```

-   You can add commas for readability:

```
const a = fn (a b) a + b

# Same as
const a = fn (a, b) a + b
```

### Async

In lunar everything looks sync by default but is async under the hood:

For example:

```
sleep(0.5)
println("a")
sleep(0.5)
println("b")
```

will wait half a second, print `a`, wait another half a second and print `b`.

### Running stuff in parallel

You can run stuff in parallel with the `parallel` function:

For example:

```
const waitAndPrint = fn (time msg) fn () { sleep(time) msg |> println }

parallel(waitAndPrint(0.5 "a") waitAndPrint(1 "b"))
```

will print "a" after half a second and "b" after 1 second

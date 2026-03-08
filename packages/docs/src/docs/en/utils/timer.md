---
title: Timer
source: packages/abm-utils/src/timer.ts
---

```ts
import 'abm-utils/timer';
```

# Function `sleep`
Generates a `Promise` that resolves after a specified time.
```ts
await sleep(1000);
console.log('Executed after 1 second');

sleep(500).then(() => {
  console.log('Executed after 500 milliseconds');
});
```

# Class `Debounce`
Debounce function class, used to execute an operation only once within a specified time interval.

## Constructor Parameters
- `fn`: Function to be executed
- `thisArg`: `this` context (optional)
- `delay`: Delay time, default 100 milliseconds

## Properties
- `result`: Execution result
- `thisArg`: `this` context

## Methods
### `clean()`
Clears the timer.

### `exe(...args)`
Executes the function.
- Parameters: Function arguments

### `exec()`
Executes the function.

## Static Methods
### `new(fn, delay?)`
Creates a debounce function.
- Parameters:
  - `fn`: Function to be executed
  - `delay`: Delay time, default 100 milliseconds
- Return value: Debounce function

## Example
```ts
// Create a debounce instance
const debounce = new Debounce((value) => {
  console.log('Executing debounce function:', value);
  return value * 2;
}, undefined, 300);

// Continuous calls, only executed once 300ms after the last call
debounce.exe(1);
debounce.exe(2);
debounce.exe(3);
// Output: Executing debounce function: 3

// Create a debounce function using static method
const debounceFn = Debounce.new((value) => {
  console.log('Executing static debounce function:', value);
}, 200);

debounceFn(1);
debounceFn(2);
debounceFn(3);
// Output: Executing static debounce function: 3
```

# Class `Throttle`
Throttle function class, used to limit the execution frequency of functions.

## Constructor Parameters
- `fn`: Function to be executed
- `thisArg`: `this` context
- `delay`: Delay time, default 100 milliseconds

## Properties
- `result`: Execution result
- `thisArg`: `this` context
- `delay`: Delay time
- `fn`: Function to be executed
- `args`: Function arguments

## Methods
### `clean()`
Clears the timer.

### `exe(...args)`
Executes the function.
- Parameters: Function arguments

### `exec()`
Executes the function.

## Static Methods
### `new(fn, delay?)`
Creates a throttle function.
- Parameters:
  - `fn`: Function to be executed
  - `delay`: Throttle delay time, default 100 milliseconds
- Return value: Throttle function

## Example
```ts
// Create a throttle instance
const throttle = new Throttle((value) => {
  console.log('Executing throttle function:', value);
  return value * 2;
}, undefined, 300);

// Continuous calls, executed at most once every 300ms
throttle.exe(1); // Executed
throttle.exe(2); // Ignored
throttle.exe(3); // Ignored
setTimeout(() => {
  throttle.exe(4); // Executed
}, 350);

// Create a throttle function using static method
const throttleFn = Throttle.new((value) => {
  console.log('Executing static throttle function:', value);
}, 200);

throttleFn(1); // Executed
throttleFn(2); // Ignored
setTimeout(() => {
  throttleFn(3); // Executed
}, 250);
```

# Class `Interval`
Manages the start/stop of setInterval timers, supports dynamic adjustment of interval time.

## Constructor Parameters
- `fn`: Function to be executed periodically
- `interval`: Execution interval time (milliseconds)
- `thisArgs`: `this` binding object for the function (optional)

## Properties
- `fn`: Target function to be executed periodically
- `thisArgs`: `this` binding object for the target function
- `isRunning`: Whether the timer is running (read-only)
- `interval`: Current timer interval time (milliseconds)

## Methods
### `start()`
Starts the timer.

### `stop()`
Stops the timer.

## Example
```ts
// Create a timer instance
let count = 0;
const interval = new Interval(() => {
  console.log('Executing timer:', ++count);
}, 1000);

// Start the timer
interval.start();

// Stop the timer after 5 seconds
setTimeout(() => {
  interval.stop();
  console.log('Timer stopped');
}, 5000);

// Dynamically adjust interval time
setTimeout(() => {
  interval.interval = 500; // Change to 500 milliseconds
  console.log('Interval time adjusted to 500ms');
}, 2000);
```

# Class `Timeout`
Delay timer, manages the start/stop of setTimeout timers.

## Constructor Parameters
- `fn`: Function to be executed after delay
- `timeout`: Execution delay time (milliseconds), default 0
- `thisArgs`: `this` binding object for the function (optional)

## Properties
- `fn`: Target function to be executed periodically
- `thisArgs`: `this` binding object for the target function
- `running`: Whether the timer is running (read-only)
- `timeout`: Current timer delay time (milliseconds)

## Methods
### `start(timeout?)`
Starts the timer.
- Parameters: Override original delay time (optional)
- Return value: Whether the timer was successfully created

### `stop()`
Stops the timer.
- Return value: Returns false if no timer

### `restart(timeout?)`
Restarts the timer.
- Parameters: Override original delay time (optional)

## Example
```ts
// Create a timeout timer instance
const timeout = new Timeout(() => {
  console.log('Executing timeout timer');
}, 2000);

// Start the timer
timeout.start();

// Restart the timer after 1 second
setTimeout(() => {
  timeout.restart(3000); // Restart and change to 3 seconds
  console.log('Timer restarted');
}, 1000);

// Stop the timer after 2 seconds
setTimeout(() => {
  timeout.stop();
  console.log('Timer stopped');
}, 2000);
```

# Class `RepeatingTriggerController`
Controller that simulates key long-press repeated triggering.

## Constructor Parameters
- `fn`: Function to be executed
- `initialDelay`: Initial delay time, optional, default 500 milliseconds
- `repeatInterval`: Time interval for repeated triggering, optional, default 100 milliseconds

## Properties
- `isRunning`: Whether it is running (read-only)
- `fn`: Function to be executed
- `initialDelay`: Initial delay
- `repeatInterval`: Time interval for repeated triggering

## Methods
### `start()`
Starts triggering.

### `stop()`
Stops triggering.

### `restart()`
Restarts.

## Example
```ts
// Create a repeating trigger controller
let count = 0;
const trigger = new RepeatingTriggerController(() => {
  console.log('Trigger executed:', ++count);
}, 500, 100);

// Start triggering
trigger.start();

// Stop triggering after 3 seconds
setTimeout(() => {
  trigger.stop();
  console.log('Trigger stopped');
}, 3000);
```

# Type `AnimationFrameHandler`
Animation frame handler type.

## Parameters
- `time`: Current time
- `diff`: Time difference from the previous frame (0 for the first frame after controller startup)

# Class `AnimationFrameController`
Manages the start/stop of requestAnimationFrame, supports synchronous/asynchronous callbacks.

## Constructor Parameters
- `fn`: Callback function to be executed every frame, parameter is timestamp
- `async`: Whether to execute the callback function asynchronously, optional, default `false`

## Properties
- `isRunning`: Whether the animation frame loop is running (read-only)
- `ignoreErrors`: Whether to ignore errors in the callback function
- `fn`: Current frame callback function
- `async`: Whether to run the callback function in asynchronous mode

## Methods
### `start()`
Starts the animation frame loop.

### `stop()`
Stops the animation frame loop.

## Example
```ts
// Create an animation frame controller
let lastTime = 0;
const animationController = new AnimationFrameController((time, diff) => {
  // Calculate frame rate
  const fps = diff ? 1000 / Math.abs(diff) : 0;
  console.log(`Current frame rate: ${Math.round(fps)} FPS`);
  
  // Simple animation logic
  const progress = (time - lastTime) / 1000;
  console.log(`Animation progress: ${progress.toFixed(2)}s`);
});

// Start animation
animationController.start();

// Stop animation after 5 seconds
setTimeout(() => {
  animationController.stop();
  console.log('Animation stopped');
}, 5000);
```

# Class `Timer`
Timer, used to measure time intervals.

## Properties
- `duration`: Duration
- `isRunning`: Whether it is running (read-only)

## Methods
### `start()`
Starts/resumes timing.
- **Return value**: Returns false if already running

### `pause()`
Pauses timing.
- **Return value**: Returns false if not running

### `clear()`
Stops and resets timing.
- **Return value**: Returns false if already stopped and duration is 0

## Example
```ts
// Create a timer instance
const timer = new Timer();

// Start timing
timer.start();

// Simulate some operations
setTimeout(() => {
  // Pause timing
  timer.pause();
  console.log(`Elapsed time: ${timer.duration}ms`);
  
  // Resume timing
  timer.start();
  
  // Simulate operations again
  setTimeout(() => {
    // Stop and reset
    timer.clear();
    console.log(`Final elapsed time: ${timer.duration}ms`);
  }, 1000);
}, 2000);
```
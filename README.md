# js-to-reanimated.macro

## Intro

Based on [reanimated-math.macro](https://github.com/futuun/reanimated-math.macro#readme) by [futuun](https://github.com/futuun).

This macro will transform a javascript block to be reanimated. Example:

```javascript
re(() => {
	if(this.gestureState == State.ACTIVE){
		stopClock(this.clock);
		this.transX = this.transX + (this.dragX - this.prevDragX);
		this.prevDragX = this.dragX;
		this.transX;
	}
	else if(this.gestureState != -1){
		this.prevDragX = 0;
		this.transX = () => {
			if(defined(this.transX)){
				if(clockRunning(this.clock) == 0){
					this.animatedState.finished = 0;
					this.animatedState.velocity = this.dragVX;
					this.animatedState.position = this.transX;
					startClock(this.clock);
				}
			}
			decay(this.clock,this.animatedState,{
				deceleration: 0.999
			});
			if(this.animatedState.finished){
				stopClock(this.clock);
			}
			this.animatedState.position;
		}
	}
});
```

Will transform to:

```javascript
Animated.block([
  Animated.cond(
    Animated.eq(this.gestureState, State.ACTIVE),
    [
      Animated.stopClock(this.clock),
      Animated.set(
        this.transX,
        Animated.add(this.transX, Animated.sub(this.dragX, this.prevDragX))
      ),
      Animated.set(this.prevDragX, this.dragX),
      this.transX
    ],
    Animated.cond(Animated.neq(this.gestureState, Animated.multiply(1, -1)), [
      Animated.set(this.prevDragX, 0),
      Animated.set(this.transX, [
        Animated.cond(Animated.defined(this.transX), [
          Animated.cond(Animated.eq(Animated.clockRunning(this.clock), 0), [
            Animated.set(this.animatedState.finished, 0),
            Animated.set(this.animatedState.velocity, this.dragVX),
            Animated.set(this.animatedState.position, this.transX),
            Animated.startClock(this.clock)
          ])
        ]),
        Animated.decay(this.clock, this.animatedState, {
          deceleration: 0.999
        }),
        Animated.cond(this.animatedState.finished, [
          Animated.stopClock(this.clock)
        ]),
        this.animatedState.position
      ])
    ])
  )
]);
```

## Config

Define the identifier to the reanimated config name to tell the macro what identifier holds the Reanimated value.

```javascript
const plugins = [
	['macros',{
		jsToReanimated: {
			identifier: 'Animated'
		}
	}]
];
````
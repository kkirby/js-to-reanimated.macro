import Animated from 'react-native-reanimated';

let a = () => null;

Animated.multiply(a(), 12);
Animated.startClock();
Animated.multiply(Animated.divide(distX, Animated.sub(endTime, startTime)), 1000);
Animated.block([Animated.cond(Animated.eq(this.gestureState, State.ACTIVE), [Animated.stopClock(this.clock), Animated.set(this.transX, Animated.add(this.transX, Animated.sub(this.dragX, this.prevDragX))), Animated.set(this.prevDragX, this.dragX), this.transX], Animated.cond(Animated.or(Animated.and(Animated.neq(this.gestureState, -1), Animated.neq(this.gestureState, 12)), Animated.eq(this.gestureState, 5)), [Animated.set(this.prevDragX, 0), Animated.set(this.transX, [Animated.cond(Animated.defined(this.transX), [Animated.cond(Animated.eq(Animated.clockRunning(this.clock), 0), [Animated.set(this.animatedState.finished, 0), Animated.set(this.animatedState.velocity, this.dragVX), Animated.set(this.animatedState.position, this.transX), Animated.startClock(this.clock)])]), Animated.decay(this.clock, this.animatedState, {
  deceleration: 0.999
}), Animated.cond(this.animatedState.finished, [Animated.stopClock(this.clock)]), this.animatedState.position])]))]);

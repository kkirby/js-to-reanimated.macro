import re from '../../macro';
import Animated from 'react-native-reanimated';

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
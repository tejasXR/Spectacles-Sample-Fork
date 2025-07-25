import { LSTween } from "LSTween.lspkg/LSTween";
import Easing, { EasingFunction } from "LSTween.lspkg/TweenJS/Easing";

@component
export class MapAnimator extends BaseScriptComponent {
    
    public onMapVisibilityChanged? : (scale : vec3) => void;

    @input container: SceneObject;
    @input tweenTime: number;

    constructor()
    {
        super();

        this.createEvent('OnEnableEvent').bind (() => this.onEnable());
        // this.createEvent('OnDisableEvent').bind (() => this.onDisable());
    }

    private onEnable() 
    {
        this.show();
    }

    public show()
    {
        this.container.getTransform().setLocalScale(vec3.zero());
        var targetScale = vec3.one();
        this.scaleContainer(targetScale, Easing.Back.Out);
    }

    public hide()
    {
        this.container.getTransform().setLocalScale(vec3.one());
        var targetScale = vec3.zero();
        this.scaleContainer(targetScale, Easing.Back.In);
    }

    private scaleContainer(targetScale:vec3, easingFunc : EasingFunction)
    {
        LSTween.scaleToLocal
        (
            this.container.getTransform(),
            targetScale,
            this.tweenTime
        )
        .easing(easingFunc)
        .start()
        .onComplete(()=>
        {
            this.container.getTransform().setLocalScale(targetScale);
            
            if (this.onMapVisibilityChanged)
            {
                this.onMapVisibilityChanged(targetScale);
            }
        });
    }
}

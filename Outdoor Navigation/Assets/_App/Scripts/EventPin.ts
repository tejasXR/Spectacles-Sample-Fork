import { LSTween } from "LSTween.lspkg/LSTween";
import Easing, { EasingFunction } from "LSTween.lspkg/TweenJS/Easing";
import { PinchButton } from "SpectaclesInteractionKit.lspkg/Components/UI/PinchButton/PinchButton";
import { InteractorEvent } from "SpectaclesInteractionKit.lspkg/Core/Interactor/InteractorEvent";

@component
export class EventPin extends BaseScriptComponent 
{    
    // @input
    // tooltip: SceneObject;

    @input
    button: PinchButton;

    @input
    tooltipLine: SceneObject;

    @input
    navigationLines: RenderMeshVisual[];

    @input
    userPin: SceneObject;

    @input
    ("float", "500") animationTime: number;


    // @input
    // debugText: Text;

    // @input
    // debugObj1: SceneObject;

    // @input
    // debugObj2: SceneObject;

    private angleToShow: number = .5;

    private isAnimating : boolean;
    private isSelected : boolean;
    private originalButtonScale :vec3;

    constructor()
    {
        super();
        this.createEvent('OnAwakeEvent').bind(() => this.onAwake());
        this.createEvent('OnStartEvent').bind(() => this.onStart());
        this.createEvent('UpdateEvent').bind(() => this.onUpdate());
    }

    onAwake()
    {
        this.originalButtonScale = this.button.getTransform().getLocalScale();
    }

    onStart()
    {
        let buttonPressed = (state : InteractorEvent) => { this.onButtonPinched(); }
        this.button.onButtonPinched.add(buttonPressed);

        this.fadeAllNavPaths(0);
    }

    private onUpdate()
    {
        if(this.isAnimating)
        {
            return;
        }

        if (this.isSelected)
        {
            return;
        }

        if (this.getAngleFromUserPin() < this.angleToShow)
        {
           this.show();
        }
        else
        {
            this.hide();
        }
    }

    private show()
    {
        if (this.isSelected)
        {
            return;
        }

        this.tooltipLine.enabled = true;
        this.scaleButton(this.originalButtonScale, Easing.Back.Out);
        this.fadeAllNavPaths(.3);
    }

    private hide()
    {
        if (this.isSelected)
        {
            return;
        }

        this.tooltipLine.enabled = false;

        var newScale = vec3.zero();
        this.scaleButton(newScale, Easing.Back.In);
        this.fadeAllNavPaths(0);
    }

    private fadeAllNavPaths(alpha: number)
    {
        this.navigationLines.forEach(navPath => 
        {
            this.fadeNavigationPath(navPath, alpha);    
        });
    }

    private scaleButton(newLocalScale: vec3, ease: EasingFunction)
    {
        this.isAnimating = true;

        LSTween.scaleFromToLocal
        (
                this.button.getTransform(),
                this.button.getTransform().getLocalScale(),
                newLocalScale,
                this.animationTime
        )
        .easing(ease)
        .start()
        .onComplete(() =>
        {
            this.isAnimating = false;
        });
    }

    private fadeNavigationPath(navLineMesh: RenderMeshVisual, alpha: number)
    {
        LSTween.alphaTo
        (   
            navLineMesh.mainMaterial,
            alpha,
            this.animationTime
        )
        .start();
    }

    getAngleFromUserPin(): number
    {
        var userPinPosition = this.userPin.getTransform().getWorldPosition();
        var eventPinPosition = this.getTransform().getWorldPosition();

        var pinForwardPoint = userPinPosition.add(this.userPin.getTransform().up.uniformScale(7));
        var pinForwardDirection = pinForwardPoint.sub(userPinPosition);

        var directionToEventPin = eventPinPosition.sub(userPinPosition);

        var rotationToEventPin = quat.lookAt(pinForwardDirection.normalize(), vec3.up());
        var rotationToUserPinForward = quat.lookAt(directionToEventPin.normalize(), vec3.up());

        // Forward User Pin
        // this.debugObj1.getTransform().setWorldPosition(pinForwardPoint);
        // this.debugObj1.getTransform().setWorldRotation(rotationToEventPin);


        var pinMidPoint = userPinPosition.add(directionToEventPin.uniformScale(.5));

        // From User Pin to Event Pin
        // this.debugObj2.getTransform().setWorldPosition(pinMidPoint);
        // this.debugObj2.getTransform().setWorldRotation(rotationToUserPinForward);

        var angle = quat.angleBetween(rotationToUserPinForward, rotationToEventPin);

        // this.debugText.text = angle.toFixed(2);

        return angle;
    }

    private onButtonPinched()
    {
        print("Button pressed");

        this.hide();
        this.fadeAllNavPaths(1);
        this.tooltipLine.enabled = false;

        this.isSelected = true;
    }
}

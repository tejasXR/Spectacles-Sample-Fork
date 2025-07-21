import { NavigationWorldDepth } from "./NavigationWorldDepth";

@component
export class NavigationPathHandler extends BaseScriptComponent {

    private gestureModule: GestureModule = require('LensStudio:GestureModule');

    @input
    public navigationWorldDepth: NavigationWorldDepth;

    @input
    public navObject1: SceneObject;

    @input 
    public navObject2: SceneObject;

     @input 
    public navObject3: SceneObject;

    @input
    camera: Camera;

    @input
    rightHand: SceneObject;

    private isFistClosed: boolean; 
    private handPosition : vec3;

    constructor()
    {
        super();
     
        this.createEvent('OnStartEvent').bind(() => this.onStart());
        Studio.log("Hands closed");
    }

    onStart()
    {
        this.navigationWorldDepth.onGetGroundPointCallback = (groundPoint) => (this.onCreateNavPath(groundPoint));

        this.gestureModule
        .getGrabBeginEvent(GestureModule.HandType.Right)
        .add((grabBeginArgs: GrabBeginArgs) => 
        {
            if (!this.isFistClosed)
            {
                this.isFistClosed = true;
                // this.navObject.enabled = true;
            }
        });

        this.gestureModule
        .getTargetingDataEvent(GestureModule.HandType.Right)
        .add((targetArgs: TargetingDataArgs) => 
        {
            this.handPosition = targetArgs.rayOriginInWorld;
        });

        this.gestureModule
        .getGrabEndEvent(GestureModule.HandType.Right)
        .add((grabEndArgs: GrabEndArgs) => 
        {
            // if (!this.isFistClosed)
            // {
            //     return;
            // }

            // let camera = global.deviceInfoSystem.getTrackingCameraForId(CameraModule.CameraId.Left_Color);

            Studio.log("Creating nav path");

        
            var rayStart = this.handPosition;
            var forwardDirection = this.rightHand.getTransform().forward.uniformScale(120);
            var downwardDirection = this.rightHand.getTransform().down.uniformScale(100)
            var handPosition = this.rightHand.getTransform().getWorldPosition();
 
            var rayEnd = handPosition.add(forwardDirection).add(downwardDirection);

            this.navObject1.getTransform().setWorldPosition(rayStart);
            this.navObject2.getTransform().setWorldPosition(rayEnd);

            this.navigationWorldDepth.onStartHitTest(rayStart, rayEnd);

            this.isFistClosed = false;
            // this.navObject.enabled = false;
        });
    }

    onCreateNavPath(groundPoint:vec3)
    {
        // Draw points
    
        this.navObject3.getTransform().setWorldPosition(groundPoint);
    }
}

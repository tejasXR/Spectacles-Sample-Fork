import { LineCreator } from "./LineCreator";
import { NavigationWorldDepth } from "./NavigationWorldDepth";

@component
export class NavigationPathHandler extends BaseScriptComponent {

    private gestureModule: GestureModule = require('LensStudio:GestureModule');

    @input
    public groundForwardDepth : number;

    @input
    public navigationWorldDepth: NavigationWorldDepth;

    @input
    public lineCreator: LineCreator;

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
    private lineStartPosition : vec3;
    private firstLineAnimated : boolean;

    private groundPoint : vec3;
    private groundForwardPoint : vec3;

    constructor()
    {
        super();
     
        this.createEvent('OnStartEvent').bind(() => this.onStart());
        Studio.log("Hands closed");
    }

    onStart()
    {
        this.navigationWorldDepth.onGetGroundPointCallback = (groundPoint, groundNormal) => (this.onCreateNavPath(groundPoint, groundNormal));
        this.lineCreator.onLineAnimatedCompleted = () => (this.onLineAnimated());

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

        
            this.lineStartPosition = this.handPosition.add(this.rightHand.getTransform().down.uniformScale(5));
            var forwardDirection = this.rightHand.getTransform().forward.uniformScale(120);
            var downwardDirection = this.rightHand.getTransform().down.uniformScale(100)
 
            var rayEnd = this.handPosition.add(forwardDirection).add(downwardDirection);

            this.navObject1.getTransform().setWorldPosition(this.lineStartPosition);
            this.navObject2.getTransform().setWorldPosition(rayEnd);

            this.navigationWorldDepth.onStartHitTest(this.lineStartPosition, rayEnd);

            this.isFistClosed = false;
            // this.navObject.enabled = false;
        });
    }

    onCreateNavPath(groundPoint: vec3, groundNormal: vec3)
    {
        // Draw points

        this.groundPoint = groundPoint;

    
        // Draw line from hand to ground
        this.navObject3.getTransform().setWorldPosition(groundPoint);
        this.lineCreator.createBaseLine(this.lineStartPosition, groundPoint);
        this.lineCreator.animateLine(this.handPosition, groundPoint);


        var lookDirection: vec3;
        // if (1 - Math.abs(groundNormal.normalize().dot(vec3.up())) < .01) 
        // {
        //     lookDirection = vec3.forward();
        // } 
        // else
        // {
        //     lookDirection = groundNormal.cross(vec3.up());
        // }

        // lookDirection = groundNormal.cross(vec3.up());

        // const toRotation = quat.lookAt(lookDirection, lookDirection);

        // Draw line from ground hit to ground forward
        // var groundForward = groundPoint.add(lookDirection.uniformScale(120));
        var groundForward = groundPoint.add(vec3.forward().uniformScale(this.groundForwardDepth));

        this.groundForwardPoint = groundForward;

        this.lineCreator.createBaseLine(groundPoint, groundForward);
    }

    onLineAnimated()
    {
        if (!this.firstLineAnimated)
        {
            this.lineCreator.animateLine(this.groundPoint, this.groundForwardPoint);
            this.firstLineAnimated = true;
            return;
        }

        this.firstLineAnimated = false;
    }
}
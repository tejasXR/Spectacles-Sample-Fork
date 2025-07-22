import { LineCreator } from "./LineCreator";
import { NavigationWorldDepth } from "./NavigationWorldDepth";
import { MapExpansionController } from "Scripts/MapExpansionController";

@component
export class NavigationPathHandler extends BaseScriptComponent {

    private gestureModule: GestureModule = require('LensStudio:GestureModule');

    @input
    public mapExpansionController : MapExpansionController;

    @input
    public groundForwardDepth : number;

    @input
    public navigationWorldDepth: NavigationWorldDepth;

    @input
    public lineCreator: LineCreator;

    // @input
    // public navObject1: SceneObject;

    // @input 
    // public navObject2: SceneObject;

    //  @input 
    // public navObject3: SceneObject;

    @input
    camera: Camera;

    @input
    rightHand: SceneObject;

    private isFistClosed: boolean; 
    private handPosition : vec3;
    // private lineStartPosition : vec3;
    private firstLineAnimated : boolean;

    private groundPoint : vec3;
    private groundForwardPoint : vec3;

    private lineCreationIndex : number;

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
            if (this.mapExpansionController.hasExpandedMap())
            {
                return;
            }

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

             if (this.mapExpansionController.hasExpandedMap())
            {
                return;
            }
        
            var lineStartPosition = this.handPosition.add(this.rightHand.getTransform().down.uniformScale(5));
            var forwardDirection = this.rightHand.getTransform().forward.uniformScale(120);
            var downwardDirection = this.rightHand.getTransform().down.uniformScale(100)
 
            var rayEnd = this.handPosition.add(forwardDirection).add(downwardDirection);

            // this.navObject1.getTransform().setWorldPosition(lineStartPosition);
            // this.navObject2.getTransform().setWorldPosition(rayEnd);

            this.navigationWorldDepth.onStartHitTest(lineStartPosition, rayEnd);

            this.isFistClosed = false;
            // this.navObject.enabled = false;
        });
    }

    onCreateNavPath(groundPoint: vec3, groundNormal: vec3)
    {
        this.groundPoint = groundPoint;

        // Line to ground
        var lineStartPosition = groundPoint.add(vec3.up().uniformScale(30));
        this.lineCreator.createBaseLine(lineStartPosition, groundPoint);

        var groundForward : vec3;
        if (this.lineCreationIndex == 0)
        {
            // Forward Line
            groundForward = groundPoint.add(vec3.forward().uniformScale(this.groundForwardDepth));
            this.lineCreator.createBaseLine(groundPoint, groundForward);

            this.lineCreationIndex = 1;
        }
        else
        {
            // Forward Line
            groundForward = groundPoint.add(vec3.forward().uniformScale(this.groundForwardDepth / 3));
            this.lineCreator.createBaseLine(groundPoint, groundForward);

            // Right Line
            var groundRight = groundForward.add(vec3.right().uniformScale(this.groundForwardDepth / 3));
            this.lineCreator.createBaseLine(groundForward, groundRight);

            this.lineCreationIndex = 0;
        }
      
        this.groundForwardPoint = groundForward;

        this.lineCreator.animateLine(lineStartPosition, groundPoint);
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
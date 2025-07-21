import { NavigationWorldDepth } from "./NavigationWorldDepth";
import {TextLogger} from "Text Logger V2/TextLogger/TextLogger/TextLogger";

@component
export class NavigationPathHandler extends BaseScriptComponent {

    private gestureModule: GestureModule = require('LensStudio:GestureModule');

    @input
    public navigationWorldDepth: NavigationWorldDepth;

    @input
    public navObject: SceneObject;

    @input
    cameraTransform: SceneObject;

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
            if (!this.isFistClosed)
            {
                return;
            }

            Studio.log("Creating nav path");

            var rayStart = this.handPosition;
            var rayEnd = this.cameraTransform.getTransform().forward
                .add(this.cameraTransform.getTransform().down);

            this.navigationWorldDepth.onStartHitTest(rayStart, rayEnd);

            this.isFistClosed = false;
            // this.navObject.enabled = false;
        });
    }

    onCreateNavPath(groundPoint:vec3)
    {
        // Draw points
        Studio.log(groundPoint);
        // global.textLogger.

        this.navObject.getTransform().setWorldPosition(groundPoint);
    }
}

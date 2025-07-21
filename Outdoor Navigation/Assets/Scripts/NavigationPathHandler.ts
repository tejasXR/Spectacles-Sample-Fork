import { NavigationWorldDepth } from "./NavigationWorldDepth";
// const SIK = require('SpectaclesInteractionKit.lspkg/SIK').SIK;

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
    }

    onStart()
    {
        this.navigationWorldDepth.onGetGroundPointCallback.bind(this.onCreateNavPath)

        this.gestureModule
        .getGrabBeginEvent(GestureModule.HandType.Right)
        .add((grabBeginArgs: GrabBeginArgs) => 
        {
            if (!this.isFistClosed)
            {
                print("Hands closed");
                this.isFistClosed = true;
                this.navObject.enabled = true;
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

            print("Creating nav path");

            var rayStart = this.handPosition;
            var rayEnd = this.cameraTransform.getTransform().forward.add(this.cameraTransform.getTransform().down);

            this.navigationWorldDepth.onStartHitTest(rayStart, rayEnd);

            this.isFistClosed = false;
            this.navObject.enabled = false;
        });
    }

    onCreateNavPath(groundPoint:vec3)
    {
        // Draw points
        print(groundPoint);
    }
}

import WorldCameraFinderProvider from "SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider";

@component
export class Compass extends BaseScriptComponent 
{
    private gestureModule: GestureModule = require('LensStudio:GestureModule');
    private worldCameraProvider = WorldCameraFinderProvider.getInstance()
    
    @input
    userPin: SceneObject

    @input
    handRayDebugObj: SceneObject;

    @input
    rightHand: SceneObject;

    // @input
    // cameraObj: Camera;

    // @input 
    // objectWithDeviceTracking: SceneObject ;


    constructor()
    {
        super();
        
        // For AI code-assisted testing!
        // this.createEvent('OnStartEvent').bind(this.onStart);
        
        this.createEvent('OnStartEvent').bind(() => this.onStart());
        // this.createEvent('UpdateEvent').bind(() => this.onUpdate());
    }

    onStart()
    {
        this.gestureModule
        .getTargetingDataEvent(GestureModule.HandType.Right)
        .add((targetArgs: TargetingDataArgs) => 
        {
            var handForwardPoint = targetArgs.rayOriginInWorld.add(this.rightHand.getTransform().forward.uniformScale(2));
            // this.handRayDebugObj.getTransform().setWorldPosition(handForwardPoint);

            // var cameraTransform = this.cameraObj.getSceneObject().getTransform();
            // var cameraPosition = cameraTransform.getWorldPosition();
            // var cameraForward = cameraTransform.forward.uniformScale(2);

            var direction = handForwardPoint.sub(targetArgs.rayOriginInWorld);
            direction.x = 0;
            direction.z = 0;
            // var projection = direction.projectOnPlane(vec3.up());
            // var rotation = quat.fromEulerVec(projection);
            var rotation = quat.fromEulerVec(direction);

            // this.handRayDebugObj.getTransform().setWorldRotation(rotation);


            var fakedRotation = quat.fromEulerVec(vec3.zero());
            // this.userPin.getTransform().setWorldRotation(rotation);
        });

        // var cameraTransform = this.cameraObj.getSceneObject().getTransform();
        // var cameraPosition = cameraTransform.getWorldPosition();
        // var cameraForward = cameraTransform.forward.uniformScale(20);

        // this.handRayDebugObj.getTransform().setWorldPosition(cameraPosition.add(cameraForward));

        var deviceCamera = global.deviceInfoSystem.getTrackingCamera();
        // deviceCamera.pose.

    }

    onUpdate()
    {
        var cameraTransform = this.worldCameraProvider.getTransform()
        var cameraPosition = cameraTransform.getWorldPosition();
        var cameraForward = cameraTransform.forward.uniformScale(20);

        this.handRayDebugObj.getTransform().setWorldPosition(cameraPosition.add(cameraForward));
    }
}

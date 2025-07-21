const WorldQueryModule = require('LensStudio:WorldQueryModule');

@component
export class NavigationWorldDepth extends BaseScriptComponent {

    public onGetGroundPointCallback?: (groundPoint : vec3) => void;

    private hitTestSession : HitTestSession;

    constructor()
    {
        super();
    }

    onAwake() 
    {
        // Create a session with default options (currently, filtering disabled by default)
       this.hitTestSession = WorldQueryModule.createHitTestSession();
    }

    public onStartHitTest(rayStart: vec3, rayEnd: vec3)
    {
        this.hitTestSession.hitTest(
        rayStart,
        rayEnd,
        this.onHitTestResult.bind(this));
    }

    private onHitTestResult(results)
     {
        if (results === null)
        {
            return;
        } 
        
        // get hit information
        const hitPosition = results.position;
        const hitNormal = results.normal;

        this.onGetGroundPointCallback(hitPosition);

        //identifying the direction the object should look at based on the normal of the hit location.

        // var lookDirection;
        // if (1 - Math.abs(hitNormal.normalize().dot(vec3.up())) < EPSILON)
        // {
        //     lookDirection = vec3.forward();
        // } 
        // else 
        // {
        //     lookDirection = hitNormal.cross(vec3.up());
        // }

        // const toRotation = quat.lookAt(lookDirection, hitNormal);

        // //set position and rotation
        // this.targetObject.getTransform().setWorldPosition(hitPosition);
        // this.targetObject.getTransform().setWorldRotation(toRotation);

        // if (
        //     this.primaryInteractor.previousTrigger !== InteractorTriggerType.None &&
        //     this.primaryInteractor.currentTrigger === InteractorTriggerType.None
        // ) {
        //     // Called when a trigger ends
        //     // Copy the plane/axis object
        //     this.sceneObject.copyWholeHierarchy(this.targetObject);
        // }
    }
}

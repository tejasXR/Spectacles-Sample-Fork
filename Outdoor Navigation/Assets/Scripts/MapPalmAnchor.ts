@component
export class MapPalmAnchor extends BaseScriptComponent 
{
    private gestureModule: GestureModule = require('LensStudio:GestureModule');

    @input
    public mapObject: SceneObject;

    @input
    public rightHand: SceneObject;

    @input
    public heightOffset: number;

    @input
    public forwardOffset: number;
    
    constructor()
    {
        super();
        this.createEvent('OnStartEvent').bind(()=> this.onStart());
    }

    onStart()
    {
        this.gestureModule
        .getTargetingDataEvent(GestureModule.HandType.Right)
        .add((targetArgs: TargetingDataArgs) => {

            var heightOffset = this.rightHand.getTransform().up.y * this.heightOffset;
            
            var forward = this.rightHand.getTransform().forward;
            forward.y = 0;
            forward.normalize();

            forward.uniformScale(this.forwardOffset);
            
            var destPoint = new vec3
            (
                targetArgs.rayOriginInWorld.x + forward.x,
                targetArgs.rayOriginInWorld.y - heightOffset,
                targetArgs.rayOriginInWorld.z + forward.z
            );

            var rightHandUp = this.rightHand.getTransform().up;
            var dotProduct = rightHandUp.dot(vec3.up());

            var isRightPalmUp = dotProduct  < 0;
            this.mapObject.enabled = isRightPalmUp;

            this.mapObject.getTransform().setWorldPosition(destPoint);
        });
    }
}

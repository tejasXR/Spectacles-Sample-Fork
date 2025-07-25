import { MapExpansionController } from "_App/Scripts/MapExpansionController";
import { MapAnimator } from "./MapAnimator";

@component
export class MapPalmAnchor extends BaseScriptComponent 
{
    private gestureModule: GestureModule = require('LensStudio:GestureModule');

    @input
    public mapAnimator : MapAnimator;

    @input
    public mapExpansionController : MapExpansionController;

    @input
    public mapObject: SceneObject;

    @input
    public rightHand: SceneObject;

    @input
    public heightOffset: number;

    @input
    public forwardOffset: number;

    @input
    public mapPositionLerpSpeed: number;

    private isMapVisible : boolean;
    
    constructor()
    {
        super();
        this.createEvent('OnStartEvent').bind(()=> this.onStart());
    }

    onStart()
    {
        this.mapAnimator.onMapVisibilityChanged = (scale : vec3) => this.onMapVisibilityChanged(scale);

        this.gestureModule
        .getTargetingDataEvent(GestureModule.HandType.Right)
        .add((targetArgs: TargetingDataArgs) => {

            if (this.mapExpansionController.hasExpandedMap())
            {
                return;
            }

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

            var isRightPalmUp = dotProduct < -0.7;

            if (!this.isMapVisible && isRightPalmUp)
            {
                 this.mapAnimator.show();
            }

            if (this.isMapVisible && !isRightPalmUp)
            {
               this.mapAnimator.hide();
            }

            var mapPosition =  this.mapObject.getTransform().getWorldPosition();
            var lerpVec = vec3.lerp(mapPosition, destPoint, getDeltaTime() * this.mapPositionLerpSpeed)
            this.mapObject.getTransform().setWorldPosition(lerpVec);
        });
    }

    private onMapVisibilityChanged(scale : vec3)
    {
        if (scale.x == 0)
        {
            this.isMapVisible = false;
        }
        else
        {
            this.isMapVisible = true;
        }
    }
}

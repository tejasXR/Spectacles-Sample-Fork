import { MapComponent } from "MapComponent/Scripts/MapComponent";

@component
export class MapExpansionController extends BaseScriptComponent {

    private gestureModule: GestureModule = require('LensStudio:GestureModule');

    @input
    public leftHand : SceneObject;

    @input
    public rightHand : SceneObject;

    @input
    public expansionButtons : SceneObject;

    // @input
    // public rightHandObj : SceneObject;

    // @input
    // public handCloseObj : SceneObject;

    // @input
    // public distanceText : Text;

    @input
    public mapComponent : MapComponent;

    private isLeftPalmUp : boolean;
    private isRightPalmUp : boolean;
    private leftHandPosition : vec3;
    private rightHandPosition : vec3;

    private hasExpanded = false;

    constructor()
    {
        super();
        this.createEvent('OnStartEvent').bind(() => this.onStart());
        this.createEvent('UpdateEvent').bind(() => this.onUpdate());

        this.leftHandPosition = vec3.zero();
        this.rightHandPosition = vec3.zero();
    }

    onStart()
    {
        // Left Palm Up
        this.gestureModule
        .getTargetingDataEvent(GestureModule.HandType.Left)
        .add((targetArgs : TargetingDataArgs) => 
        {
            this.leftHandPosition = targetArgs.rayOriginInWorld;
            var leftHandUp = this.leftHand.getTransform().up;
            var dotProduct = leftHandUp.dot(vec3.up());
            this.isLeftPalmUp = dotProduct < -0.7;

            // this.distanceText.text = dotProduct.toString();
            // this.distanceText.text =  this.leftHand.getTransform().up.y.toString();
           

        });

        // Right Palm Up
        this.gestureModule
        .getTargetingDataEvent(GestureModule.HandType.Right)
        .add((targetArgs : TargetingDataArgs) => 
        {
            this.rightHandPosition = targetArgs.rayOriginInWorld;
            var rightHandUp = this.rightHand.getTransform().up;
            var dotProduct = rightHandUp.dot(vec3.up());
            this.isRightPalmUp = dotProduct  < -0.7;

            // this.distanceText.text = dotProduct.toString();

        });
    }

    onUpdate()
    {
        if (!this.hasExpandedMap())
        {
            if (this.isLeftPalmUp && this.isRightPalmUp)
            {
                this.mapComponent.centerMap();
                this.mapComponent.toggleMiniMap(false);  
                this.expansionButtons.enabled = true;
                this.hasExpanded = true;
            }
        }

        var distance = this.leftHandPosition.sub(this.rightHandPosition).length;
        // this.distanceText.text = distance.toString();

        var areHandsClose =  distance < 10;

        if (this.hasExpandedMap())
        {
            // if (!this.isLeftPalmUp && !this.isRightPalmUp)
            if (areHandsClose)
            {
                this.mapComponent.centerMap();
                this.mapComponent.toggleMiniMap(true);  
                this.expansionButtons.enabled = false;
                this.hasExpanded = false;
            }
        }       

        // var direction = this.leftHandPosition.sub(this.rightHandPosition);
        // this.handCloseObj.getTransform().setWorldPosition(this.rightHandPosition.add(direction.uniformScale(.5)))
        // this.handCloseObj.enabled = areHandsClose;

        // this.leftHandObj.getTransform().setWorldPosition(this.leftHandPosition);
        // this.rightHandObj.getTransform().setWorldPosition(this.rightHandPosition);
    }

    public hasExpandedMap() : boolean
    {
        return this.hasExpanded;
    }
}
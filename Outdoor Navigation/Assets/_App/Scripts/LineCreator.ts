import { LSTween } from "LSTween.lspkg/LSTween";
import Easing from "LSTween.lspkg/TweenJS/Easing";

@component
export class LineCreator extends BaseScriptComponent {

    public onLineAnimatedCompleted?: () => void;

    @input
    baseRenderMesh : RenderMesh;

    @input
    animatedRenderMesh : RenderMesh;

    @input
    baseLineMaterial : Material;

    @input
    animatedLineMaterial : Material;

    @input
    lineThickness : number;

    @input
    animatedLineThickness : number;

    @input("float", "1")
    constantAnimationSpeed: number;

    @input("float", "5000")
    lineFadeDuration : number;

    public createBaseLine(lineStart: vec3, lineEnd: vec3)
    {
        var line = global.scene.createSceneObject("Line");
        var lineMesh = line.createComponent("RenderMeshVisual");
        lineMesh.mesh = this.baseRenderMesh;
        lineMesh.addMaterial(this.baseLineMaterial);

        var direction = lineEnd.sub(lineStart);
        var length = direction.length;

        var midPoint = lineStart.add(direction.uniformScale(0.5));
        var lineTransform = line.getTransform();
        lineTransform.setWorldPosition(midPoint);

        var lineRotation = quat.rotationFromTo(vec3.up(), direction.normalize());
        lineTransform.setWorldRotation(lineRotation);

        lineTransform.setWorldScale(new vec3(this.lineThickness, length, 0)); 

        LSTween.alphaFromTo
        (
            lineMesh.mainMaterial,
            1,
            0,
            this.lineFadeDuration
        )
        .easing(Easing.Linear.InOut)
        .start()
        .onComplete(() => 
        {
            line.destroy();
        });
    }

    public animateLine(lineStart: vec3, lineEnd: vec3)
    {
        var line = global.scene.createSceneObject("Line");
        var lineMesh = line.createComponent("RenderMeshVisual");
        lineMesh.mesh = this.animatedRenderMesh;
        lineMesh.addMaterial(this.animatedLineMaterial);

        var direction = lineEnd.sub(lineStart);
        var length = direction.length;

        var lineTransform = line.getTransform();
        lineTransform.setWorldPosition(lineStart);

        var lineRotation = quat.rotationFromTo(vec3.up(), direction.normalize());
        lineTransform.setWorldRotation(lineRotation);

        lineTransform.setWorldScale(new vec3(this.lineThickness, length, 0)); 

        var distanceToTravel = lineStart.distance(lineEnd);
        var timeInMillisecondsToTravel = distanceToTravel / this.constantAnimationSpeed * 1000;

        var currentScale = new vec3(this.animatedLineThickness, 0, 0);
        lineTransform.setWorldScale(currentScale); 

        var midPoint = lineStart.add(direction.uniformScale(0.5));

        // var fadeDuration = (timeInMillisecondsToTravel - 5000) < 0 ? 5000 : timeInMillisecondsToTravel;
        var fadeDuration = 10000;

        LSTween.moveFromToWorld
        (
            lineTransform,
            lineTransform.getWorldPosition(),
            midPoint,
            timeInMillisecondsToTravel
        )
        .easing(Easing.Linear.InOut)
        .start();

        LSTween.scaleFromToWorld
        (
            lineTransform,
            currentScale,
            new vec3(this.animatedLineThickness, length, 0),
            timeInMillisecondsToTravel
        )
        .easing(Easing.Linear.InOut)
        .start()
        .onComplete(()=>
        {
           if (this.onLineAnimatedCompleted)
            {
                this.onLineAnimatedCompleted();
            };
        });

        LSTween.alphaFromTo
        (
            lineMesh.mainMaterial,
            1,
            0,
            fadeDuration
        )
        .easing(Easing.Sinusoidal.In)
        .start()
        .onComplete(()=>
        {
          line.destroy();
        });
    }
}
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
        var animatedLine = global.scene.createSceneObject("AnimatedLine");
        var animatedLineMesh = animatedLine.createComponent("RenderMeshVisual");
        animatedLineMesh.mesh = this.animatedRenderMesh;
        animatedLineMesh.addMaterial(this.animatedLineMaterial);

        var animatedLineTransform = animatedLine.getTransform();
        animatedLineTransform.setWorldPosition(lineStart);

        var direction = lineEnd.sub(lineStart);
        var rotation = quat.rotationFromTo(vec3.up(), direction.normalize());
        animatedLineTransform.setWorldRotation(rotation);

        var distanceToTravel = lineStart.distance(lineEnd);
        var timeInMillisecondsToTravel = distanceToTravel / this.constantAnimationSpeed * 1000;

        animatedLineTransform.setWorldScale(new vec3(5, 10, 1)); 

        LSTween.moveFromToWorld
        (
            animatedLineTransform,
            animatedLineTransform.getWorldPosition(),
            lineEnd,
            timeInMillisecondsToTravel
        )
        .easing(Easing.Linear.InOut)
        .start()
        .onComplete(()=>{
           if (this.onLineAnimatedCompleted)
            {
                this.onLineAnimatedCompleted();
                animatedLine.destroy();
            };
        });

        LSTween.alphaFromTo
        (
            animatedLineMesh.mainMaterial,
            1,
            0,
            timeInMillisecondsToTravel / 2
        )
        .easing(Easing.Sinusoidal.In)
        .start();
    }
}
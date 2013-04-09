/// <reference path="DependencyObject.ts" />
/// CODE
/// <reference path="Walkers.ts" />

module Fayde {
    export class UINode extends XamlNode {
        XObject: UIElement;
        constructor(xobj: UIElement) {
            super(xobj);
        }
        VisualParentNode: UINode;
        GetInheritedEnumerator(): IEnumerator {
            return this.GetVisualTreeEnumerator(VisualTreeDirection.Logical);
        }

        OnIsAttachedChanged(newIsAttached: bool) {
            super.OnIsAttachedChanged(newIsAttached);
            //Update total render visibility
            if (!newIsAttached) {
                //cache invalidate hint
                //Remove dirty element from surface
                //If surface focused element === this --> focus element to null on surface
            }
        }
        _ElementAdded(uie: UIElement) {
            uie.XamlNode.VisualParentNode = this;
            //Update uie Total Render+HitTest Visibility
            //Invalidate uie
            //Propagate inherited props on adding to tree
            //set loaded to this.IsLoaded
            //Update this Bounds(true)
            //Invalidate this measure
            //LayoutInformation.SetLayoutClip(this, undefined)
            //Clear PreviousConstraint
            //Clear uie render size
            //Update uie transform
            //Update uie projection
            //Invalidate uie measure
            //Invalidate uie arrange
            //if uie has dirtysizehint or uie LastRenderSize !== undefined --> uie.propagateflagup dirtysizeup
        }
        _ElementRemoved(uie: UIElement) {
            //this.Invalidate uie subtree bounds
            uie.XamlNode.VisualParentNode = null;
            //set loaded to false
            //LayoutInformation.SetLayoutSlot(uie, emptySlot);
            //LayoutInformation.SetLayoutClip(uie, undefined);

            //Invalidate this measure

            //Clear inherited properties on removing from tree
        }
    }
    export class UIElement extends DependencyObject {
        XamlNode: UINode;
        CreateNode(): XamlNode {
            return new UINode(this);
        }
    }
}
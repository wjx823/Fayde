﻿
namespace WickedSick.Server.XamlParser.Elements.Media.Animation
{
    [Element("Fayde.Media.Animation")]
    public class SplineDoubleKeyFrame : DoubleKeyFrame
    {
        public static readonly PropertyDescription KeySplineProperty = PropertyDescription.Register("KeySpline", typeof(KeySpline), typeof(SplineDoubleKeyFrame));

    }
}
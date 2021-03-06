﻿using WickedSick.Server.XamlParser.Elements.Types;

namespace WickedSick.Server.XamlParser.Elements.Shapes
{
    [Element("Fayde.Shapes")]
    public class Polygon : Shape
    {
        public static readonly PropertyDescription FillRuleProperty = PropertyDescription.Register("FillRule", typeof(FillRule), typeof(Polygon));
        public static readonly PropertyDescription PointsProperty = PropertyDescription.Register("Points", typeof(PointCollection), typeof(Polygon));
    }
}